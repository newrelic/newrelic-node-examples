import Database from 'better-sqlite3'
import logger from './logger'

export type WatchedRepo = {
  full_name: string
  note: string
  added_at: string
}

export type RepoMeta = {
  full_name: string
  note: string
  views: number
}

// better-sqlite3 is synchronous and the connection is process-wide. Cache it on
// globalThis so Next's dev HMR doesn't open a fresh in-memory DB (and re-seed)
// on every module reload, which would reset view counts between requests.
const globalForDb = globalThis as unknown as { __watchlistDb?: Database.Database }

function seed(db: Database.Database) {
  db.exec(`
    CREATE TABLE watched_repos (
      full_name TEXT PRIMARY KEY,
      note      TEXT NOT NULL DEFAULT '',
      added_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE repo_views (
      full_name TEXT PRIMARY KEY,
      views     INTEGER NOT NULL DEFAULT 0
    );
  `)

  const insert = db.prepare(
    'INSERT INTO watched_repos (full_name, note) VALUES (?, ?)'
  )
  const seedRepos: Array<[string, string]> = [
    ['vercel/next.js', 'The framework this app runs on'],
    ['pinojs/pino', 'Logger used in lib/logger.ts'],
    ['WiseLibs/better-sqlite3', 'Driver backing this watchlist'],
    ['newrelic/node-newrelic', 'APM agent wired into the layout'],
  ]
  const seedMany = db.transaction((rows: Array<[string, string]>) => {
    for (const row of rows) insert.run(...row)
  })
  seedMany(seedRepos)

  logger.info({ count: seedRepos.length }, 'Seeded watchlist database')
}

function getDb(): Database.Database {
  if (globalForDb.__watchlistDb) return globalForDb.__watchlistDb

  const db = new Database(':memory:')
  db.pragma('journal_mode = WAL')
  seed(db)
  globalForDb.__watchlistDb = db
  return db
}

export function getWatchedRepos(): WatchedRepo[] {
  const start = performance.now()
  const rows = getDb()
    .prepare(
      'SELECT full_name, note, added_at FROM watched_repos ORDER BY added_at'
    )
    .all() as WatchedRepo[]
  logger.info(
    { rows: rows.length, ms: Math.round(performance.now() - start) },
    'Queried watched_repos'
  )
  return rows
}

export function getRepoMeta(fullName: string): RepoMeta | null {
  const row = getDb()
    .prepare(
      `SELECT w.full_name AS full_name, w.note AS note,
              COALESCE(v.views, 0) AS views
       FROM watched_repos w
       LEFT JOIN repo_views v ON v.full_name = w.full_name
       WHERE w.full_name = ?`
    )
    .get(fullName) as RepoMeta | undefined
  return row ?? null
}

// Records a page view for a repo and returns the new total. Uses an UPSERT so
// repos that aren't on the watchlist still get counted.
export function recordRepoView(fullName: string): number {
  const db = getDb()
  const row = db
    .prepare(
      `INSERT INTO repo_views (full_name, views) VALUES (?, 1)
       ON CONFLICT(full_name) DO UPDATE SET views = views + 1
       RETURNING views`
    )
    .get(fullName) as { views: number }
  logger.info({ fullName, views: row.views }, 'Recorded repo view')
  return row.views
}
