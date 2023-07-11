export default defineEventHandler(async event => {
  const session = await getUserSession(event)
  event.context.canUnlockBadge = false

  if (session.data.githubId) {
    const contributors = await fetchContributors()

    const contributor = contributors.find(contributor => contributor.githubId === String(session.data.githubId)) || {
      githubId: session.data.githubId,
      username: session.data.githubUsername,
      issues: 0,
      merged_pull_requests: 0,
      helpful_issues: 0,
      comments: 0,
      helpful_comments: 0,
      reactions: 0,
      score: 0,
    }
    event.context.contributor = contributor
    event.context.canUnlockBadge = (contributor.helpful_comments + contributor.helpful_issues + contributor.merged_pull_requests) > 0
  }
})
