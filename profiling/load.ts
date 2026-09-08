/*
 * Copyright 2026 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Continuously hammers /burn so the CPU profiler keeps taking samples inside
 * transactions. Profiling harvests every 60s, so let this run for a couple of
 * minutes before checking the agent log / staging UI. Ctrl-C to stop.
 *
 * Env:
 *   TARGET       base URL (default http://localhost:3000)
 *   CONCURRENCY  in-flight requests (default 4)
 *   REPS         workload passes per request (default 8)
 *   LEVEL        per-call intensity multiplier (default 1)
 */

import http from 'node:http'
import type { IncomingMessage } from 'node:http'

const TARGET = process.env.TARGET || 'http://localhost:3000'
const CONCURRENCY = Number(process.env.CONCURRENCY) || 4
const REPS = Number(process.env.REPS) || 8
const LEVEL = Number(process.env.LEVEL) || 1

const url = `${TARGET}/burn?reps=${REPS}&level=${LEVEL}`
let completed = 0
let inFlight = 0

function fire(): void {
  inFlight++
  const req = http.get(url, (res: IncomingMessage) => {
    res.resume()
    res.on('end', () => {
      inFlight--
      completed++
      fire()
    })
  })
  req.on('error', (err: Error) => {
    inFlight--
    console.error('request error:', err.message)
    setTimeout(fire, 250)
  })
}

console.log(`load: ${CONCURRENCY} workers hitting ${url}`)
for (let i = 0; i < CONCURRENCY; i++) {
  fire()
}

setInterval(() => {
  console.log(`completed=${completed} inFlight=${inFlight}`)
}, 5000).unref()
