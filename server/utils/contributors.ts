import type { Contributor, MergedPullRequests, ModuleMaintainer } from '#shared/types'
import { Octokit } from 'octokit'

function normalizeMergedPRs(value: number | MergedPullRequests): MergedPullRequests {
  if (typeof value === 'number') {
    return { docs: 0, chore: 0, feat: 0, fix: 0, all: value }
  }
  return value
}

export const fetchContributors = cachedFunction<Contributor[]>(async (event) => {
  const origin = process.env.NUXT_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || getRequestURL(event).origin

  const raw = await $fetch<Contributor[]>(`${origin}/contributors.json`)
  return raw.map(c => ({
    ...c,
    merged_pull_requests: normalizeMergedPRs(c.merged_pull_requests),
  }))
}, {
  getKey: () => 'contributors',
  maxAge: 60 * 60, // 1 hour
})

export const fetchModuleMaintainers = cachedFunction<ModuleMaintainer[]>(async () => {
  return $fetch<{ maintainers: ModuleMaintainer[] }>('https://api.nuxt.com/modules').then(data => data.maintainers).catch(() => [])
}, {
  getKey: () => 'module-maintainers',
  maxAge: 60 * 10, // 10 minutes
})

export const fetchNuxtUIProOutsideCollaborators = cachedFunction<string[]>(async () => {
  // Fetch on GitHub the outside collaborators of the Nuxt UI Pro repository
  try {
    const octokit = new Octokit({
      auth: process.env.NUXT_GITHUB_TOKEN,
    })
    const response = await octokit.paginate(octokit.rest.repos.listCollaborators, {
      owner: 'nuxt',
      repo: 'ui-pro',
    })
    return response.map((collaborator: { login: string }) => collaborator.login)
  }
  catch {
    console.warn('Failed to fetch Nuxt UI Pro collaborators:')
    return []
  }
}, {
  getKey: () => 'nuxt-ui-pro-outside-collaborators',
  maxAge: 365 * 60 * 60 * 24, // 365 days
})
