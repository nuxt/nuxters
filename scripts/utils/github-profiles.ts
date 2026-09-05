export interface GitHubProfile {
  location: string | null
  login: string
}

interface GraphQLResponse {
  data?: Record<string, unknown> | null
  errors?: Array<{ message: string, type?: string, path?: Array<string | number> }>
}

export function parseProfileBatch(result: GraphQLResponse, usernames: readonly string[]): GitHubProfile[] {
  if (!result.data)
    throw new Error('GitHub returned no profile data')
  const data = result.data
  const missingAccounts = new Set<string>()
  for (const error of result.errors ?? []) {
    const alias = error.path?.[0]
    // Deleted accounts are expected. Every other partial response must fail the
    // collection so it cannot replace a complete snapshot with missing people.
    if (error.type === 'NOT_FOUND' && error.path?.length === 1 && typeof alias === 'string' && /^u\d+$/.test(alias) && Number(alias.slice(1)) < usernames.length && data[alias] === null) {
      missingAccounts.add(alias)
      continue
    }
    throw new Error(`Incomplete GitHub profile batch: ${error.message}`)
  }
  return usernames.flatMap((_, index) => {
    const alias = `u${index}`
    const profile = data[alias]
    if (missingAccounts.has(alias))
      return []
    if (!profile || typeof profile !== 'object' || !('login' in profile) || typeof profile.login !== 'string' || !('location' in profile) || (profile.location !== null && typeof profile.location !== 'string'))
      throw new Error(`GitHub returned an incomplete profile for ${alias}`)
    return [{ login: profile.login, location: profile.location }]
  })
}
