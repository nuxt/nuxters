export function useNuxter() {
  const linked = useState<{ [key in Provider]: boolean }>(() => ({ github: false, discord: false }))
  const contributor = useState<Contributor>('contributor')
  const canUnlockNuxterBadge = useState<boolean>(() => false)
  const canUnlockModuleBadge = useState<boolean>(() => false)
  const hasMergedPullRequests = useState<boolean>(() => false)
  const hasHelpfulIssues = useState<boolean>(() => false)
  const hasHelpfulComments = useState<boolean>(() => false)
  const detailedScore = useState<any>()

  return {
    linked,
    contributor,
    canUnlockNuxterBadge,
    canUnlockModuleBadge,
    hasMergedPullRequests,
    hasHelpfulIssues,
    hasHelpfulComments,
    detailedScore,
  }
}
