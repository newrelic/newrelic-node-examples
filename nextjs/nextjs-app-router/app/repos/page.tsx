import Link from 'next/link'
import { getWatchedRepos } from '../../lib/db'
import logger from '../../lib/logger'

export const metadata = {
  title: 'Watchlist',
}

export default async function ReposPage() {
  logger.info('Rendering repos watchlist page')
  const repos = getWatchedRepos()

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
        Watchlist
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        {repos.length} repositories tracked in SQLite. Open one to fetch its
        live stats from the GitHub API.
      </p>

      <ul className="mt-8 flex flex-col gap-3">
        {repos.map((repo) => {
          const [owner, name] = repo.full_name.split('/')
          return (
            <li key={repo.full_name}>
              <Link
                href={`/repos/${owner}/${name}`}
                className="block rounded-lg border border-black/[.08] px-5 py-4 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
              >
                <span className="font-medium text-black dark:text-zinc-50">
                  {repo.full_name}
                </span>
                {repo.note && (
                  <span className="mt-1 block text-sm text-zinc-600 dark:text-zinc-400">
                    {repo.note}
                  </span>
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </main>
  )
}
