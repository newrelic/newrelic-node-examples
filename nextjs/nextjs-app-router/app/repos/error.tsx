'use client'

import { useEffect } from 'react'

export default function ReposError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <h2 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
        Something went wrong
      </h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        The repository data could not be loaded.
      </p>
      <button
        onClick={() => unstable_retry()}
        className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
      >
        Try again
      </button>
    </main>
  )
}
