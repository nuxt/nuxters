import { fetchContributors } from '../utils/contributors'
import { getQuery } from 'h3'

export default defineEventHandler(async e => {
  const { username } = getQuery(e)
  const contributors = await fetchContributors()
  // match for username
  const contributor = contributors.find(c => c.login === username)
  if (!contributor) {
    return {
      statusCode: 404,
      statusMessage: `Contributor ${username} does not seem like a Nuxter`,
    }
  }
  return contributor
})
