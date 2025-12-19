export type Provider = 'github' | 'discord'

export interface Contributor {
  username: string
  githubId: string
  issues: number
  merged_pull_requests: number
  helpful_issues: number
  comments: number
  helpful_comments: number
  reactions: number
  score: number
  rank: number
}

export interface ModuleMaintainer {
  name: string
  github: string
  modules: string[]
}

export interface ModuleContributor {
  id: number
  username: string
  contributions: number
}

export interface Score {
  type: string
  multiplier: number | ''
  amount: string
  total: string
}
