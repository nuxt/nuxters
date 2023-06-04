interface CacheEntry<T> {
  data: T
  expires: number
}

export async function fetchContributors() {
  const storage = useStorage()

  const cachedContributors = (await storage.getItem('github:contributors')) as CacheEntry<any[]>
  if (cachedContributors && cachedContributors.expires > Date.now()) {
    return cachedContributors.data
  }

  const config = useRuntimeConfig()

  const contributors = []
  let page = 1

  do {
    const results = await $fetch<any[]>('https://api.github.com/repos/nuxt/nuxt/contributors', {
      query: {
        per_page: 100,
        page,
      },
      headers: {
        Authorization: `Bearer ${config.github.accessToken}`,
        'User-Agent': 'Nuxtbot',
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    })
    contributors.push(...results)
    if (!results.length) break
    page++
  } while (true)

  await storage.setItem('github:contributors', {
    data: contributors,
    expires: Date.now() + 1000 * 60 * 10, // 10 minutes
  })

  return contributors
}
