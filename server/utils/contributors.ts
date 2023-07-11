import type { Contributor } from '~/types'

export const fetchContributors = cachedFunction<Contributor[]>(async () => {
  return $fetch<Contributor[]>('https://api.nuxt.com/contributors').catch(() => [])
}, {
  getKey: () => 'contributors',
  maxAge: 60 * 10, // 10 minutes
})
