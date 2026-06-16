import Link from 'next/link'

export default function RepoNotFound() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <h2 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
        Repository not found
      </h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        GitHub returned no repository for that owner and name.
      </p>
      <Link
        href="/repos"
        className="mt-6 inline-block text-sm text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        ← Back to watchlist
      </Link>
    </main>
  )
}
