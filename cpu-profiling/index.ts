/*
 * Copyright 2026 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import crypto from 'node:crypto'
import express, { Request, Response } from 'express'

const app = express()
const PORT = process.env.PORT ?? '3000'

/**
 * Each of these does a small, distinct slice of CPU work. They exist as separate named functions so the flame graph shows several frames instead of one giant loop — the work is spread across the call stack. All of it runs synchronously inside the Express route handler, so it stays within the transaction's context and the CPU samples still pick up the `span:`/`span_id`/`trace_id` labels.
 *
 * The app is compiled to `dist/`, so the profiler samples frames in `dist/index.js`. The agent's `profiling.source_mapping.enabled` config (see newrelic.js / the `start:source-map` script) decides whether those frames are resolved back to `index.ts` via `dist/*.js.map` — that comparison is the whole point of this app.
 */

/**
 * Sieve of Eratosthenes up to `n`. Returns the count of primes found.
 */
function countPrimes(n: number): number {
  const sieve = new Uint8Array(n + 1)
  let count = 0
  for (let i = 2; i <= n; i++) {
    if (!sieve[i]) {
      count++
      for (let j = i * i; j <= n; j += i) {
        sieve[j] = 1
      }
    }
  }
  return count
}

/**
 * Repeatedly sha256-hashes a growing buffer. Returns the final digest.
 */
function hashRounds(rounds: number): string {
  let data = 'seed'
  for (let i = 0; i < rounds; i++) {
    data = crypto.createHash('sha256').update(data).digest('hex')
  }
  return data
}

/**
 * Builds and sorts a pseudo-random array. Returns the median element.
 */
function sortChurn(size: number): number {
  const arr = new Array<number>(size)
  let seed = size
  for (let i = 0; i < size; i++) {
    // cheap deterministic PRNG so we don't depend on Math.random
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    arr[i] = seed
  }
  arr.sort((a, b) => a - b)
  return arr[size >> 1]
}

/**
 * Naive recursive Fibonacci — deep, self-similar stack frames.
 */
function fib(n: number): number {
  if (n < 2) {
    return n
  }
  return fib(n - 1) + fib(n - 2)
}

/**
 * Float-heavy trig/accumulate loop. Returns the accumulated value.
 */
function trigAccumulate(iterations: number): number {
  let x = 0
  for (let i = 0; i < iterations; i++) {
    x += Math.sqrt(i) * Math.sin(i) + Math.cos(i / 3)
  }
  return x
}

// Rotate through the workers so no single frame dominates the profile. `level`
// scales every worker together (default 1).
const WORKERS: Array<(lvl: number) => number | string> = [
  (lvl) => countPrimes(50_000 * lvl),
  (lvl) => hashRounds(2_000 * lvl),
  (lvl) => sortChurn(20_000 * lvl),
  (lvl) => fib(28 + lvl),
  (lvl) => trigAccumulate(300_000 * lvl)
]

/**
 * Runs one pass over every worker once. Returns a combined result (kept so the
 * work isn't optimized away).
 */
function mixedWorkload(level: number): number {
  let acc = 0
  for (const work of WORKERS) {
    acc += Number(String(work(level)).length)
  }
  return acc
}

// Distributed CPU work — spread across several functions for a varied flame
// graph. `?reps=` controls how many passes (default 8), `?level=` the per-call
// intensity (default 1).
app.get('/burn', (req: Request, res: Response) => {
  const reps = Number(req.query.reps) || 8
  const level = Number(req.query.level) || 1
  let result = 0
  for (let i = 0; i < reps; i++) {
    result += mixedWorkload(level)
  }
  res.json({ reps, level, result })
})

// A cheap route, for contrast in the profile.
app.get('/ping', (_req: Request, res: Response) => {
  res.send('pong')
})

app.listen(PORT, () => {
  console.log(`cpu-profiling app listening on port ${PORT}`)
  console.log(`Drive load with:  npm run load   (or: curl "http://localhost:${PORT}/burn")`)
})
