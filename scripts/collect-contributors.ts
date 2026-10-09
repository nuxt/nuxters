import { join, resolve } from 'node:path'
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
/**
 * The framework repository and its former homes: Nuxt 3 was built in nuxt/framework,
 * the docs lived in nuxt/docs. Merged PRs, helpful issues and helpful comments there count double.
 */
const CORE_REPOS = ['nuxt/nuxt', 'nuxt/framework', 'nuxt/docs']
const CORE_MULTIPLIER = 2
/** Archived repositories are skipped, except these: years of Nuxt history live there. */
const INCLUDE_ARCHIVED = ['nuxt/framework', 'nuxt/docs']
const HELPFUL_REACTIONS_THRESHOLD = 3
const HELPFUL_COMMENTS_THRESHOLD = 5
// Override to test locally without touching `public/`, e.g. CONTRIBUTORS_OUTPUT_DIR=/tmp/nuxters
const OUTPUT_DIR = process.env.CONTRIBUTORS_OUTPUT_DIR
  ? resolve(process.env.CONTRIBUTORS_OUTPUT_DIR)
  : fileURLToPath(new URL('../public/', import.meta.url))
// Override to collect a few repositories only, e.g. COLLECT_REPOS=nuxt/nuxters,nuxt/test-utils
const COLLECT_REPOS = process.env.COLLECT_REPOS?.split(',').map(repo => repo.trim()).filter(Boolean)
const USER_AGENT = 'nuxters-contributor-collector'
const KNOWN_BOT_ACCOUNTS = ['codecov-io', 'codecov-commenter']

type PullRequestType = 'docs' | 'chore' | 'feat' | 'fix'

type MergedPullRequests = {
  docs: number
  chore: number
  feat: number
  fix: number
  all: number
}

/** The part of the quality signals made in `CORE_REPOS`, already included in the totals. */
type CoreContributions = {
  merged_pull_requests: MergedPullRequests
  helpful_issues: number
  helpful_comments: number
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
  core: CoreContributions
}

type ContributorRecord = ContributorAccumulator & {
  score: number
  /** Earliest counted contribution (issue, comment or merged PR), across all periods. */
  first_contribution_at: string | null
}

/**
 * Each contribution counts in `all`, in its calendar year (UTC), and in the rolling windows it falls in.
 * Files: `contributors.json` (all), `contributors-30d.json`, `contributors-12m.json`, `contributors-<year>.json`.
 */
type Period = 'all' | '30d' | '12m' | `${number}`

const FIRST_YEAR = 2016
const DAY_MS = 24 * 60 * 60 * 1000
const COLLECTED_AT = Date.now()
const ROLLING_WINDOWS = [
  ['30d', COLLECTED_AT - 30 * DAY_MS],
  ['12m', COLLECTED_AT - 365 * DAY_MS],
] as const satisfies ReadonlyArray<readonly [Period, number]>

/** The periods a contribution made at `date` counts in. */
const periodsFor = (date: string | null | undefined): Period[] => {
  const periods: Period[] = ['all']
  const time = date ? Date.parse(date) : Number.NaN
  if (Number.isNaN(time)) {
    return periods
  }
  for (const [period, since] of ROLLING_WINDOWS) {
    if (time >= since) {
      periods.push(period)
    }
  }
  const year = new Date(time).getUTCFullYear()
  if (year >= FIRST_YEAR) {
    periods.push(`${year}`)
  }
  return periods
}

const periodFile = (period: Period) => period === 'all' ? 'contributors.json' : `contributors-${period}.json`

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

type GitHubUser = { login: string | null, id: number | null } | null | undefined

/** Period → lowercased login → stats */
const contributors = new Map<Period, Map<string, ContributorAccumulator>>()
/** Lowercased login → earliest contribution time */
const firstContributions = new Map<string, number>()

const isBotAccount = (login: string | null | undefined) => {
  if (!login) {
    return true
  }
  return KNOWN_BOT_ACCOUNTS.includes(login) || login.includes('[bot]') || login.endsWith('-bot') || login === 'ghost'
}

const upsertContributor = (period: Period, user: GitHubUser) => {
  if (!user || isBotAccount(user.login)) {
    return null
  }
  const login = user.login!
  const key = login.toLowerCase()
  let byLogin = contributors.get(period)
  if (!byLogin) {
    byLogin = new Map()
    contributors.set(period, byLogin)
  }
  let contributor = byLogin.get(key)
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
      core: {
        merged_pull_requests: { docs: 0, chore: 0, feat: 0, fix: 0, all: 0 },
        helpful_issues: 0,
        helpful_comments: 0,
      },
    }
    byLogin.set(key, contributor)
  }
  return contributor
}

/** Run `update` on the user's stats of every period that `date` counts in. */
const contribute = (user: GitHubUser, date: string | null | undefined, update: (contributor: ContributorAccumulator) => void) => {
  for (const period of periodsFor(date)) {
    const contributor = upsertContributor(period, user)
    if (contributor) {
      update(contributor)
    }
  }
}

const recordFirstContribution = (user: GitHubUser, date: string | null | undefined) => {
  const time = date ? Date.parse(date) : Number.NaN
  if (!user?.login || isBotAccount(user.login) || Number.isNaN(time)) {
    return
  }
  const key = user.login.toLowerCase()
  const first = firstContributions.get(key)
  if (first === undefined || time < first) {
    firstContributions.set(key, time)
  }
}

type MergedPull = { type: PullRequestType, mergedAt: string }

const isCoreRepo = (owner: string, repo: string) => CORE_REPOS.includes(`${owner}/${repo}`.toLowerCase())

const addIssueStats = (
  issue: {
    user: GitHubUser
    number: number
    created_at?: string
    pull_request?: object
    reactions?: { total_count?: number }
    comments?: number
    state_reason?: string | null
  },
  mergedPulls: Map<number, MergedPull>,
  core: boolean,
) => {
  const reactionCount = issue.reactions?.total_count ?? 0
  const commentCount = issue.comments ?? 0

  // Reaction dates would cost one API call per item: they count on the date of the item.
  contribute(issue.user, issue.created_at, (contributor) => {
    contributor.reactions += reactionCount
  })

  if (!issue.pull_request) {
    const isHelpful = issue.state_reason === 'completed' || reactionCount >= HELPFUL_REACTIONS_THRESHOLD || commentCount >= HELPFUL_COMMENTS_THRESHOLD
    contribute(issue.user, issue.created_at, (contributor) => {
      contributor.issues += 1
      if (isHelpful) {
        contributor.helpful_issues += 1
        if (core) {
          contributor.core.helpful_issues += 1
        }
      }
    })
    recordFirstContribution(issue.user, issue.created_at)
    return
  }

  // A merged PR counts on the day it landed.
  const pull = mergedPulls.get(issue.number)
  if (pull) {
    contribute(issue.user, pull.mergedAt, (contributor) => {
      contributor.merged_pull_requests[pull.type] += 1
      contributor.merged_pull_requests.all += 1
      if (core) {
        contributor.core.merged_pull_requests[pull.type] += 1
        contributor.core.merged_pull_requests.all += 1
      }
    })
    recordFirstContribution(issue.user, pull.mergedAt)
  }
}

const addCommentStats = (
  comment: {
    user: GitHubUser
    created_at?: string
    reactions?: { total_count?: number }
  },
  core: boolean,
) => {
  const reactionCount = comment.reactions?.total_count ?? 0
  contribute(comment.user, comment.created_at, (contributor) => {
    contributor.comments += 1
    contributor.reactions += reactionCount
    if (reactionCount >= HELPFUL_REACTIONS_THRESHOLD) {
      contributor.helpful_comments += 1
      if (core) {
        contributor.core.helpful_comments += 1
      }
    }
  })
  recordFirstContribution(comment.user, comment.created_at)
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
  const mergedPulls = new Map<number, MergedPull>()
  for await (const response of octokit.paginate.iterator(octokit.rest.pulls.list, {
    owner,
    repo,
    state: 'all',
    per_page: 100,
  })) {
    for (const pull of response.data) {
      if (pull.merged_at) {
        const type = inferPullRequestType(pull.title, pull.labels)
        mergedPulls.set(pull.number, { type, mergedAt: pull.merged_at })
      }
    }
  }
  return mergedPulls
}

const collectIssues = async (owner: string, repo: string, mergedPulls: Map<number, MergedPull>) => {
  const core = isCoreRepo(owner, repo)
  for await (const response of octokit.paginate.iterator(octokit.rest.issues.listForRepo, {
    owner,
    repo,
    state: 'all',
    per_page: 100,
  })) {
    for (const issue of response.data) {
      addIssueStats(issue, mergedPulls, core)
    }
  }
}

const collectComments = async (owner: string, repo: string) => {
  const core = isCoreRepo(owner, repo)
  for await (const response of octokit.paginate.iterator(octokit.rest.issues.listCommentsForRepo, {
    owner,
    repo,
    per_page: 100,
  })) {
    for (const comment of response.data) {
      addCommentStats(comment, core)
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
    const archived = repo.archived && !INCLUDE_ARCHIVED.includes(`${org}/${repo.name}`.toLowerCase())
    if (repo.private || archived || repo.disabled || repo.fork) {
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

/** Points of the quality signals: merged PRs, helpful issues and helpful comments. */
const qualityPoints = (stats: Pick<ContributorAccumulator, 'merged_pull_requests' | 'helpful_issues' | 'helpful_comments'>) =>
  stats.merged_pull_requests.feat * PR_SCORE_MULTIPLIERS.feat
  + stats.merged_pull_requests.fix * PR_SCORE_MULTIPLIERS.fix
  + stats.merged_pull_requests.docs * PR_SCORE_MULTIPLIERS.docs
  + stats.merged_pull_requests.chore * PR_SCORE_MULTIPLIERS.chore
  + stats.helpful_issues * 3
  + stats.helpful_comments * 2

const computeScore = (stats: ContributorAccumulator) => {
  const total
    = qualityPoints(stats)
      + stats.issues
      + stats.comments * 0.5
      + stats.reactions * 0.1
      // The core part is already in the totals: add it (multiplier - 1) more times.
      + qualityPoints(stats.core) * (CORE_MULTIPLIER - 1)
  return Math.round(total)
}

const buildContributorRecords = (period: Period) => {
  const sorted = Array.from(contributors.get(period)?.values() ?? [])
    .map((stats) => {
      const first = firstContributions.get(stats.username.toLowerCase())
      return {
        ...stats,
        score: computeScore(stats),
        first_contribution_at: first === undefined ? null : new Date(first).toISOString(),
      }
    })
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score
      }
      return a.username.localeCompare(b.username)
    })

  return sorted as ContributorRecord[]
}

const saveContributors = async (period: Period, data: ContributorRecord[]) => {
  const file = join(OUTPUT_DIR, periodFile(period))
  // One record per line: valid JSON, readable diffs, and about half the size of indented JSON.
  await writeFile(file, `[\n${data.map(record => JSON.stringify(record)).join(',\n')}\n]\n`, 'utf8')
  console.log(`Wrote ${data.length} contributors to ${file}`)
}

const main = async () => {
  if (COLLECT_REPOS?.length) {
    for (const fullName of COLLECT_REPOS) {
      const [owner, repo, ...rest] = fullName.split('/')
      if (!owner || !repo || rest.length) {
        throw new Error(`Invalid COLLECT_REPOS entry "${fullName}", expected owner/repo`)
      }
      await collectRepository(owner, repo)
    }
  }
  else {
    const failedOrgs: string[] = []
    for (const org of ORGS) {
      try {
        await collectOrganization(org)
      }
      catch (error) {
        console.error(`Failed to collect data for ${org}:`, error)
        failedOrgs.push(org)
      }
    }
    // Partial data would publish wrong ranks in every period file: keep the previous files instead.
    if (failedOrgs.length) {
      console.error(`Collection failed for ${failedOrgs.join(', ')} — refusing to write contributor files.`)
      process.exit(1)
    }
  }

  if (!contributors.get('all')?.size) {
    console.error('No contributors collected — refusing to write an empty file. Check the GitHub token and API access.')
    process.exit(1)
  }

  await mkdir(OUTPUT_DIR, { recursive: true })
  // Every period gets a file, even an empty 30-day window, so consumers can rely on it.
  const periods: Period[] = ['all', '30d', '12m']
  for (let year = FIRST_YEAR; year <= new Date(COLLECTED_AT).getUTCFullYear(); year++) {
    periods.push(`${year}`)
  }
  for (const period of periods) {
    await saveContributors(period, buildContributorRecords(period))
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
