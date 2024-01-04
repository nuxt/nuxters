import type { Contributor, ModuleMaintainer } from '~/types'

export const fetchContributors = cachedFunction<Contributor[]>(async () => {
  return $fetch<Contributor[]>('https://api.nuxt.com/contributors').catch(() => [])
}, {
  getKey: () => 'contributors',
  maxAge: 60 * 10, // 10 minutes
})

export const fetchModuleMaintainers = cachedFunction<ModuleMaintainer[]>(async () => {
  return $fetch<{ maintainers: ModuleMaintainer[] }>('https://api.nuxt.com/modules').then((data) => data.maintainers).catch(() => [])
}, {
  getKey: () => 'module-maintainers',
  maxAge: 60 * 10, // 10 minutes
})
