export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <div className="h-8 w-40 animate-pulse rounded bg-black/[.08] dark:bg-white/[.12]" />
      <div className="mt-3 h-5 w-72 animate-pulse rounded bg-black/[.06] dark:bg-white/[.08]" />
      <ul className="mt-8 flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <li
            key={i}
            className="h-[68px] animate-pulse rounded-lg border border-black/[.08] bg-black/[.03] dark:border-white/[.145] dark:bg-white/[.04]"
          />
        ))}
      </ul>
    </main>
  )
}
