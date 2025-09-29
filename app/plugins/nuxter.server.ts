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
    detailedScore,
  } = useNuxter()
  const event = useRequestEvent()!
  const session = await getSession(event, { password: useRuntimeConfig().sessionPassword })
  const format = useNumberFormatter()

  linked.value = {
    github: !!session?.data.githubId,
    discord: !!session?.data.discordId,
  }

  contributor.value = event.context.contributor
  canUnlockNuxterBadge.value = event.context.canUnlockNuxterBadge
  canUnlockModuleBadge.value = event.context.canUnlockModuleBadge
  canUnlockUIProBadge.value = event.context.canUnlockUIProBadge

  // If user has contributions
  if (contributor.value) {
    hasMergedPullRequests.value = contributor.value.merged_pull_requests > 0
    hasHelpfulIssues.value = contributor.value.helpful_issues > 0
    hasHelpfulComments.value = contributor.value.helpful_comments > 0
    detailedScore.value = [
      {
        type: 'Merged pull requests',
        multiplier: 5,
        amount: format(contributor.value.merged_pull_requests),
        total: format(contributor.value.merged_pull_requests * 5),
      },
      {
        type: 'Helpful issues',
        multiplier: 3,
        amount: format(contributor.value.helpful_issues),
        total: format(contributor.value.helpful_issues * 3),
      },
      {
        type: 'Helpful comments',
        multiplier: 2,
        amount: format(contributor.value.helpful_comments),
        total: format(contributor.value.helpful_comments * 2),
      },
      {
        type: 'Issues',
        multiplier: 1,
        amount: format(contributor.value.issues),
        total: format(contributor.value.issues),
      },
      {
        type: 'Comments',
        multiplier: 0.5,
        amount: format(contributor.value.comments),
        total: format(contributor.value.comments * 0.5),
      },
      {
        type: 'Reactions',
        multiplier: 0.1,
        amount: format(contributor.value.reactions),
        total: format(contributor.value.reactions * 0.1),
      },
      {
        type: 'Score',
        multiplier: '',
        amount: '',
        total: format(contributor.value.score),
      },
    ]
  }
})
