import type { Contributor, ModuleMaintainer } from '#shared/types'
import { Octokit } from 'octokit'

export const fetchContributors = cachedFunction<Contributor[]>(async (event) => {
  const url = getRequestURL(event)

  return $fetch<Contributor[]>(`${url.protocol}//${url.host}/contributors.json`)
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
  const octokit = new Octokit({
    auth: process.env.NUXT_GITHUB_TOKEN,
  })
  const response = await octokit.paginate(octokit.rest.repos.listCollaborators, {
    owner: 'nuxt',
    repo: 'ui-pro',
  })
  return response.map((collaborator: { login: string }) => collaborator.login)
}, {
  getKey: () => 'nuxt-ui-pro-outside-collaborators',
  maxAge: 365 * 60 * 60 * 24, // 365 days
})
