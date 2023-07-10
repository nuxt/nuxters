export type GithubUser = { login: string; id: number; avatar_url: string; contributions: number } & Record<String, any>

export type UserStat = {
  username: string,
  githubId: string,
  issues: number,
  merged_pull_requests: number,
  helpful_issues: number,
  comments: string,
  helpful_comments: number,
  reactions: number,
  score: number
}
