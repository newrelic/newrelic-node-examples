import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getUser, getUserRepos } from '../../../lib/github'
import logger from '../../../lib/logger'

export default async function UserPage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  logger.info({ username }, 'Rendering user page')

  // Two independent GitHub calls fired in parallel.
  const [user, repos] = await Promise.all([
    getUser(username),
    getUserRepos(username),
  ])

  if (!user) {
    notFound()
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <div className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={user.avatar_url}
          alt={user.login}
          width={64}
          height={64}
          className="rounded-full"
        />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
            <a href={user.html_url} className="hover:underline">
              {user.name ?? user.login}
            </a>
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">@{user.login}</p>
        </div>
      </div>

      {user.bio && (
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">{user.bio}</p>
      )}

      <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
        {user.public_repos} public repos · {user.followers} followers ·{' '}
        {user.following} following
      </p>

      <h2 className="mt-10 text-lg font-medium text-black dark:text-zinc-50">
        Recently updated
      </h2>
      <ul className="mt-4 flex flex-col gap-3">
        {(repos ?? []).map((repo) => {
          const [owner, name] = repo.full_name.split('/')
          return (
            <li key={repo.id}>
              <Link
                href={`/repos/${owner}/${name}`}
                className="block rounded-lg border border-black/[.08] px-5 py-4 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
              >
                <span className="font-medium text-black dark:text-zinc-50">
                  {repo.full_name}
                </span>
                {repo.description && (
                  <span className="mt-1 block text-sm text-zinc-600 dark:text-zinc-400">
                    {repo.description}
                  </span>
                )}
                <span className="mt-2 block text-xs text-zinc-500">
                  ★ {repo.stargazers_count.toLocaleString()} ·{' '}
                  {repo.language ?? 'n/a'}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </main>
  )
}
