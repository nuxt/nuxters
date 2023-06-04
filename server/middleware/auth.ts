export default defineEventHandler(async event => {
  const session = await getUserSession(event)

  if (session.data.githubId) {
    const contributors = await fetchContributors()
    const contributions =
      contributors.find(contributor => contributor.node_id === session.data.githubId)?.contributions || 0

    event.context.contributions = {
      count: contributions,
    }
  }
})
