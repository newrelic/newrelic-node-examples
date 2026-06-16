import logger from './logger'

const API_BASE = 'https://api.github.com'

export type GitHubRepo = {
  id: number
  full_name: string
  description: string | null
  html_url: string
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  language: string | null
  pushed_at: string
}

export type GitHubUser = {
  login: string
  name: string | null
  avatar_url: string
  html_url: string
  bio: string | null
  public_repos: number
  followers: number
  following: number
}

export class GitHubError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message)
    this.name = 'GitHubError'
  }
}

// GitHub requires a User-Agent on every request and rejects anonymous calls
// without one. A token is optional but lifts the unauthenticated rate limit.
async function githubFetch<T>(path: string): Promise<T | null> {
  const url = `${API_BASE}${path}`
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'nextjs-cloud-providers-demo',
  }
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  }

  const start = performance.now()
  const res = await fetch(url, { headers })
  const ms = Math.round(performance.now() - start)

  if (res.status === 404) {
    logger.warn({ url, status: 404, ms }, 'GitHub resource not found')
    return null
  }
  if (!res.ok) {
    logger.error({ url, status: res.status, ms }, 'GitHub request failed')
    throw new GitHubError(`GitHub request to ${path} failed`, res.status)
  }

  logger.info({ url, status: res.status, ms }, 'GitHub request succeeded')
  return (await res.json()) as T
}

export function getRepo(owner: string, name: string): Promise<GitHubRepo | null> {
  return githubFetch<GitHubRepo>(`/repos/${owner}/${name}`)
}

export function getUser(username: string): Promise<GitHubUser | null> {
  return githubFetch<GitHubUser>(`/users/${username}`)
}

export function getUserRepos(username: string): Promise<GitHubRepo[] | null> {
  return githubFetch<GitHubRepo[]>(
    `/users/${username}/repos?sort=updated&per_page=10`
  )
}
