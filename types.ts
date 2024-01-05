export interface Contributor {
  username: string,
  githubId: string,
  issues: number,
  merged_pull_requests: number,
  helpful_issues: number,
  comments: number,
  helpful_comments: number,
  reactions: number,
  score: number
}

export interface ModuleMaintainer {
  name: string,
  github: string,
  modules: string[]
}
