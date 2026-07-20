declare module 'h3' {
  interface H3EventContext {
    contributor: Contributor
    canUnlockNuxterBadge: boolean
    canUnlockModuleBadge: boolean
    unlockedHackathons: string[]
    nuxterRoleAdded: boolean
  }
}

export {}
