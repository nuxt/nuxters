import { getSession } from 'h3'

export default defineNuxtPlugin(async () => {
  const {
    linked,
    contributor,
    canUnlockNuxterBadge,
    canUnlockModuleBadge,
    canUnlockUIProBadge,
    hasMergedPullRequests,
    hasHelpfulIssues,
    hasHelpfulComments,
  } = useNuxter()
  const event = useRequestEvent()!
  const session = await getSession(event, { password: useRuntimeConfig().sessionPassword })

  linked.value = {
    github: !!session?.data.githubId,
    discord: !!session?.data.discordId,
  }

  contributor.value = event.context.contributor
  canUnlockNuxterBadge.value = event.context.canUnlockNuxterBadge
  canUnlockModuleBadge.value = event.context.canUnlockModuleBadge
  canUnlockUIProBadge.value = event.context.canUnlockUIProBadge

  if (contributor.value) {
    hasMergedPullRequests.value = contributor.value.merged_pull_requests.all > 0
    hasHelpfulIssues.value = contributor.value.helpful_issues > 0
    hasHelpfulComments.value = contributor.value.helpful_comments > 0
  }
})
