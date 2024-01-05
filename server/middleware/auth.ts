export default defineEventHandler(async event => {
  const session = await getUserSession(event)
  event.context.canUnlockNuxterBadge = false

  if (session.data.githubId) {
    const [contributors, moduleMaintainers] = await Promise.all([fetchContributors(), fetchModuleMaintainers()])

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
    event.context.canUnlockNuxterBadge = (contributor.helpful_comments + contributor.helpful_issues + contributor.merged_pull_requests) > 0
    event.context.canUnlockModuleBadge = !!moduleMaintainers.find(maintainer => maintainer.github?.toLowerCase() === String(session.data.githubUsername).toLowerCase())
  }
})
