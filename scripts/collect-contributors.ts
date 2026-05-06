import { dirname, resolve } from 'node:path'
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { Octokit } from 'octokit'
import { paginateRest } from '@octokit/plugin-paginate-rest'
import { retry } from '@octokit/plugin-retry'

const REQUIRED_TOKEN_MESSAGE = 'NUXT_GITHUB_TOKEN is required to collect contributor statistics'
const ORGS = [
  'nuxt',
  'nuxt-community',
  'nuxt-content',
  'nuxt-hub',
  'nuxt-modules',
  'nuxt-ui-templates',
] as const
const HELPFUL_REACTIONS_THRESHOLD = 3
const HELPFUL_COMMENTS_THRESHOLD = 5
const OUTPUT_FILE = resolve(fileURLToPath(new URL('../public/contributors.json', import.meta.url)))
const USER_AGENT = 'nuxters-contributor-collector'

type PullRequestType = 'docs' | 'chore' | 'feat' | 'fix'

type MergedPullRequests = {
  docs: number
  chore: number
  feat: number
  fix: number
  all: number
}

type ContributorAccumulator = {
  username: string
  githubId: string
  issues: number
  merged_pull_requests: MergedPullRequests
  helpful_issues: number
  comments: number
  helpful_comments: number
  reactions: number
}

type ContributorRecord = ContributorAccumulator & {
  score: number
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
      merged_pull_requests: { docs: 0, chore: 0, feat: 0, fix: 0, all: 0 },
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
    comments?: number
    state_reason?: string | null
  },
  mergedPulls: Map<number, PullRequestType>,
) => {
  const contributor = upsertContributor(issue.user)
  if (!contributor) {
    return
  }

  const reactionCount = issue.reactions?.total_count ?? 0
  const commentCount = issue.comments ?? 0
  contributor.reactions += reactionCount
  const isCompleted = issue.state_reason === 'completed'
  if (isCompleted || reactionCount >= HELPFUL_REACTIONS_THRESHOLD || commentCount >= HELPFUL_COMMENTS_THRESHOLD) {
    contributor.helpful_issues += 1
  }

  if (!issue.pull_request) {
    contributor.issues += 1
    return
  }

  const prType = mergedPulls.get(issue.number)
  if (prType) {
    contributor.merged_pull_requests[prType] += 1
    contributor.merged_pull_requests.all += 1
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
  if (reactionCount >= HELPFUL_REACTIONS_THRESHOLD) {
    contributor.helpful_comments += 1
  }
}

const TITLE_TYPE_PATTERNS: [RegExp, PullRequestType][] = [
  [/^docs[\s(:]/i, 'docs'],
  [/^fix[\s(:]/i, 'fix'],
  [/^feat[\s(:]/i, 'feat'],
  [/^chore[\s(:]/i, 'chore'],
  [/^ci[\s(:]/i, 'chore'],
  [/^build[\s(:]/i, 'chore'],
  [/^test[\s(:]/i, 'chore'],
  [/^refactor[\s(:]/i, 'chore'],
  [/^style[\s(:]/i, 'chore'],
  [/^perf[\s(:]/i, 'feat'],
]

const LABEL_TYPE_MAP: Record<string, PullRequestType> = {
  documentation: 'docs',
  docs: 'docs',
  bug: 'fix',
  fix: 'fix',
  feature: 'feat',
  feat: 'feat',
  enhancement: 'feat',
  chore: 'chore',
  maintenance: 'chore',
  dependencies: 'chore',
}

const inferPullRequestType = (title: string, labels: { name?: string }[]): PullRequestType => {
  for (const [pattern, type] of TITLE_TYPE_PATTERNS) {
    if (pattern.test(title)) {
      return type
    }
  }
  for (const label of labels) {
    const name = label.name?.toLowerCase()
    if (name && LABEL_TYPE_MAP[name]) {
      return LABEL_TYPE_MAP[name]
    }
  }
  return 'feat'
}

const fetchMergedPullNumbers = async (owner: string, repo: string) => {
  const mergedPulls = new Map<number, PullRequestType>()
  for await (const response of octokit.paginate.iterator(octokit.rest.pulls.list, {
    owner,
    repo,
    state: 'all',
    per_page: 100,
  })) {
    for (const pull of response.data) {
      if (pull.merged_at) {
        const type = inferPullRequestType(pull.title, pull.labels)
        mergedPulls.set(pull.number, type)
      }
    }
  }
  return mergedPulls
}

const collectIssues = async (owner: string, repo: string, mergedPulls: Map<number, PullRequestType>) => {
  for await (const response of octokit.paginate.iterator(octokit.rest.issues.listForRepo, {
    owner,
    repo,
    state: 'all',
    per_page: 100,
  })) {
    for (const issue of response.data) {
      addIssueStats(issue, mergedPulls)
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
  const mergedPulls = await fetchMergedPullNumbers(owner, repo)
  await collectIssues(owner, repo, mergedPulls)
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

const PR_SCORE_MULTIPLIERS: Record<PullRequestType, number> = {
  feat: 7,
  fix: 5,
  docs: 4,
  chore: 3,
}

const computeScore = (stats: ContributorAccumulator) => {
  const prScore
    = stats.merged_pull_requests.feat * PR_SCORE_MULTIPLIERS.feat
      + stats.merged_pull_requests.fix * PR_SCORE_MULTIPLIERS.fix
      + stats.merged_pull_requests.docs * PR_SCORE_MULTIPLIERS.docs
      + stats.merged_pull_requests.chore * PR_SCORE_MULTIPLIERS.chore

  const total
    = prScore
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

  return sorted as ContributorRecord[]
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
