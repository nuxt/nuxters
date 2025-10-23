import type { Contributor, ModuleMaintainer, ModuleContributor } from '#shared/types'
import { Octokit } from 'octokit'

export const fetchContributors = cachedFunction<Contributor[]>(async () => {
  return $fetch<Contributor[]>('https://api.nuxt.com/contributors').catch(() => [])
}, {
  getKey: () => 'contributors',
  maxAge: 60 * 10, // 10 minutes
})

export const fetchModuleMaintainers = cachedFunction<ModuleMaintainer[]>(async () => {
  return $fetch<{ maintainers: ModuleMaintainer[] }>('https://api.nuxt.com/modules').then(data => data.maintainers).catch(() => [])
}, {
  getKey: () => 'module-maintainers',
  maxAge: 60 * 10, // 10 minutes
})

export const fetchAllModuleContributors = cachedFunction<ModuleContributor[]>(async () => {
  const modules = await $fetch<{ modules: { contributors: ModuleContributor[] }[] }>('https://api.nuxt.com/modules').then(data => data.modules).catch(() => null)
  if (modules === null) return []

  // Combine contributors across modules
  const rawContributors = modules.map(mod => mod.contributors).flat()
  const contributors = rawContributors.reduce((map, contributor) => {
    let data = map.get(contributor.id)
    if (data === undefined) data = contributor
    else data.contributions = data.contributions + contributor.contributions
    map.set(contributor.id, data)
    return map
  }, new Map<ModuleContributor['id'], ModuleContributor>())
  return Array.from(contributors.values())
}, {
  getKey: () => 'module-contributors',
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
