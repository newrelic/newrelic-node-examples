import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getRepo } from '../../../../lib/github'
import { getRepoMeta, recordRepoView } from '../../../../lib/db'
import logger from '../../../../lib/logger'

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-black/[.08] px-4 py-3 dark:border-white/[.145]">
      <div className="text-xl font-semibold text-black dark:text-zinc-50">
        {value}
      </div>
      <div className="text-sm text-zinc-600 dark:text-zinc-400">{label}</div>
    </div>
  )
}

export default async function RepoDetailPage({
  params,
}: {
  params: Promise<{ owner: string; name: string }>
}) {
  const { owner, name } = await params
  const fullName = `${owner}/${name}`
  logger.info({ fullName }, 'Rendering repo detail page')

  // External HTTP (GitHub) and the local SQLite write run independently.
  const [repo, views] = await Promise.all([
    getRepo(owner, name),
    Promise.resolve(recordRepoView(fullName)),
  ])

  if (!repo) {
    notFound()
  }

  const meta = getRepoMeta(fullName)

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <Link
        href="/repos"
        className="text-sm text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        ← Back to watchlist
      </Link>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
        <a href={repo.html_url} className="hover:underline">
          {repo.full_name}
        </a>
      </h1>
      {repo.description && (
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {repo.description}
        </p>
      )}
      {meta?.note && (
        <p className="mt-3 rounded-md bg-black/[.04] px-3 py-2 text-sm text-zinc-700 dark:bg-white/[.06] dark:text-zinc-300">
          Note: {meta.note}
        </p>
      )}

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Stars" value={repo.stargazers_count.toLocaleString()} />
        <Stat label="Forks" value={repo.forks_count.toLocaleString()} />
        <Stat label="Open issues" value={repo.open_issues_count.toLocaleString()} />
        <Stat label="Page views" value={views.toLocaleString()} />
      </div>

      <dl className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
        <div className="flex gap-2">
          <dt className="font-medium text-black dark:text-zinc-50">Language:</dt>
          <dd>{repo.language ?? 'n/a'}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-medium text-black dark:text-zinc-50">
            Last push:
          </dt>
          <dd>{new Date(repo.pushed_at).toLocaleString()}</dd>
        </div>
      </dl>
    </main>
  )
}
