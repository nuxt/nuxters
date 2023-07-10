export default defineEventHandler(async event => {
  const session = await getUserSession(event)

  if (session.data.githubId) {
    const contributors = await fetchContributors()
    const contributor = contributors.find(contributor => contributor.node_id === session.data.githubId)

    event.context.contributions = contributor?.contributions || 0
    event.context.avatarUrl = contributor?.avatar_url
    event.context.githubUsername = contributor?.login
    event.context.roles = session.data.roles || []
  }
})
