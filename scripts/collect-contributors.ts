import { dirname, resolve } from 'node:path'
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { Octokit } from 'octokit'
import { paginateRest } from '@octokit/plugin-paginate-rest'
import { retry } from '@octokit/plugin-retry'

const REQUIRED_TOKEN_MESSAGE = 'NUXT_GITHUB_TOKEN is required to collect contributor statistics'
const ORGS = [
  'nuxt',
  'nuxt-modules',
  'nuxt-ui-templates',
  'nuxt-hub',
  'nuxt-content',
] as const
const HELPFUL_REACTIONS_THRESHOLD = 3
const OUTPUT_FILE = resolve(fileURLToPath(new URL('../public/contributors.json', import.meta.url)))
const USER_AGENT = 'nuxters-contributor-collector'

type ContributorAccumulator = {
  username: string
  githubId: string
  issues: number
  merged_pull_requests: number
  helpful_issues: number
  comments: number
  helpful_comments: number
  reactions: number
}

type ContributorRecord = ContributorAccumulator & {
  score: number
  rank: number
}

const OctokitWithPlugins = Octokit.plugin(paginateRest, retry)
const token = process.env.NUXT_GITHUB_TOKEN

if (!token) {
  console.error(REQUIRED_TOKEN_MESSAGE)
  process.exit(1)
}

const octokit = new OctokitWithPlugins({
  auth: token,
  userAgent: USER_AGENT,
  retry: {
    doNotRetry: [404],
  },
  mediaType: {
    previews: ['squirrel-girl'],
  },
})

const contributors = new Map<string, ContributorAccumulator>()

const isBotAccount = (login: string | null | undefined) => {
  if (!login) {
    return true
  }
  return login.includes('[bot]') || login.endsWith('-bot')
}

const upsertContributor = (user: { login: string | null, id: number | null } | null | undefined) => {
  if (!user || isBotAccount(user.login)) {
    return null
  }
  const login = user.login!
  const key = login.toLowerCase()
  let contributor = contributors.get(key)
  if (!contributor) {
    contributor = {
      username: login,
      githubId: String(user.id ?? ''),
      issues: 0,
      merged_pull_requests: 0,
      helpful_issues: 0,
      comments: 0,
      helpful_comments: 0,
      reactions: 0,
    }
    contributors.set(key, contributor)
  }
  return contributor
}

const addIssueStats = (
  issue: {
    user: { login: string | null, id: number | null } | null
    number: number
    pull_request?: object
    reactions?: { total_count?: number }
  },
  mergedPullNumbers: Set<number>,
) => {
  const contributor = upsertContributor(issue.user)
  if (!contributor) {
    return
  }

  const reactionCount = issue.reactions?.total_count ?? 0
  contributor.reactions += reactionCount
  if (reactionCount > HELPFUL_REACTIONS_THRESHOLD) {
    contributor.helpful_issues += 1
  }

  if (!issue.pull_request) {
    contributor.issues += 1
    return
  }

  if (mergedPullNumbers.has(issue.number)) {
    contributor.merged_pull_requests += 1
  }
}

const addCommentStats = (
  comment: {
    user: { login: string | null, id: number | null } | null
    reactions?: { total_count?: number }
  },
) => {
  const contributor = upsertContributor(comment.user)
  if (!contributor) {
    return
  }

  contributor.comments += 1
  const reactionCount = comment.reactions?.total_count ?? 0
  contributor.reactions += reactionCount
  if (reactionCount > HELPFUL_REACTIONS_THRESHOLD) {
    contributor.helpful_comments += 1
  }
}

const fetchMergedPullNumbers = async (owner: string, repo: string) => {
  const mergedPulls = new Set<number>()
  for await (const response of octokit.paginate.iterator(octokit.rest.pulls.list, {
    owner,
    repo,
    state: 'all',
    per_page: 100,
  })) {
    for (const pull of response.data) {
      if (pull.merged_at) {
        mergedPulls.add(pull.number)
      }
    }
  }
  return mergedPulls
}

const collectIssues = async (owner: string, repo: string, mergedPullNumbers: Set<number>) => {
  for await (const response of octokit.paginate.iterator(octokit.rest.issues.listForRepo, {
    owner,
    repo,
    state: 'all',
    per_page: 100,
  })) {
    for (const issue of response.data) {
      addIssueStats(issue, mergedPullNumbers)
    }
  }
}

const collectComments = async (owner: string, repo: string) => {
  for await (const response of octokit.paginate.iterator(octokit.rest.issues.listCommentsForRepo, {
    owner,
    repo,
    per_page: 100,
  })) {
    for (const comment of response.data) {
      addCommentStats(comment)
    }
  }
}

const collectRepository = async (owner: string, repo: string) => {
  console.log(`Collecting stats for ${owner}/${repo}`)
  const mergedPullNumbers = await fetchMergedPullNumbers(owner, repo)
  await collectIssues(owner, repo, mergedPullNumbers)
  await collectComments(owner, repo)
}

const collectOrganization = async (org: string) => {
  console.log(`Fetching repositories for ${org}`)
  const repos = await octokit.paginate(octokit.rest.repos.listForOrg, {
    org,
    type: 'public',
    per_page: 100,
  })
  for (const repo of repos) {
    if (repo.private || repo.archived || repo.disabled || repo.fork) {
      continue
    }
    await collectRepository(org, repo.name)
  }
}

const computeScore = (stats: ContributorAccumulator) => {
  const total
    = stats.merged_pull_requests * 5
      + stats.helpful_issues * 3
      + stats.helpful_comments * 2
      + stats.issues
      + stats.comments * 0.5
      + stats.reactions * 0.1
  return Math.round(total)
}

const buildContributorRecords = () => {
  const sorted = Array.from(contributors.values())
    .map(stats => ({
      ...stats,
      score: computeScore(stats),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score
      }
      return a.username.localeCompare(b.username)
    })

  return sorted.map<ContributorRecord>((contributor, index) => ({
    ...contributor,
    rank: index + 1,
  }))
}

const saveContributors = async (data: ContributorRecord[]) => {
  await mkdir(dirname(OUTPUT_FILE), { recursive: true })
  await writeFile(OUTPUT_FILE, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
  console.log(`Wrote ${data.length} contributors to ${OUTPUT_FILE}`)
}

const main = async () => {
  for (const org of ORGS) {
    try {
      await collectOrganization(org)
    }
    catch (error) {
      console.error(`Failed to collect data for ${org}:`, error)
    }
  }

  const data = buildContributorRecords()
  await saveContributors(data)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
