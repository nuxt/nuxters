import { fetchContributors } from '../../utils/contributors'
import { getQuery } from 'h3'

export default defineCachedEventHandler(async event => {
  const username = getRouterParam(event, 'username')
  const contributors = await fetchContributors()

  // match for username
  const contributor = contributors.find(c => c.login === username)
  if (!contributor) {
    throw createError({
      statusCode: 404,
      message: `Contributor ${username} does not seem like a Nuxter`,
    })
  }

  return contributor
})
