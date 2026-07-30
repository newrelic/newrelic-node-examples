/*
 * Copyright 2026 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

// This is the file where we will subscribe to our example module.

const newrelic = require('newrelic')

// Define the subscriber config: what to instrument, when to fire, and what to do - all in one
// entry per target function, so there's nothing to keep in sync by array index.
// `job-queue` is a real dependency in package.json (see job-queue-pkg/), since
// subscribeTo works by rewriting the target package's source as it's loaded,
// which requires it to be resolvable the same way `require('job-queue')` is.
const config = {
  instrumentations: [
    {
      module: { name: 'job-queue', versionRange: '>=1.0.0', filePath: 'index.js' },
      functionQuery: { expressionName: 'scheduleJob', kind: 'Sync' },
      events: ['end'],
      handlers: {
        // `handler` fires on the `start` event and is where the segment for this
        // call gets created. newrelic.createSegment takes the context
        // explicitly
        handler: (data, ctx) => {
          const job = data?.arguments?.[0]
          return newrelic.createSegment(ctx, { name: `scheduleJob: ${job?.name ?? 'anonymous job'}` })
        },
        end: (data) => {
          const job = data?.arguments?.[0]
          console.debug(`[NEWRELIC] scheduleJob ended for ${job?.name ?? 'anonymous job'}`)
        }
      }
    },
    {
      module: { name: 'job-queue', versionRange: '>=1.0.0', filePath: 'index.js' },
      functionQuery: { expressionName: 'runJobs', kind: 'Sync' },
      events: ['end'],
      handlers: {
        handler: (data, ctx) => {
          return newrelic.createSegment(ctx, { name: 'runJobs' })
        },
        end: () => {
          console.debug('[NEWRELIC] runJobs ended')
        }
      }
    },
    {
      // processJob is `async` (returns a promise), so `kind: 'Async'` here
      // instead of 'Sync' - that's what tells the transformer to wrap it as
      // a promise-based trace (asyncStart/asyncEnd around the resolution),
      // rather than a plain synchronous call.
      module: { name: 'job-queue', versionRange: '>=1.0.0', filePath: 'index.js' },
      functionQuery: { expressionName: 'processJob', kind: 'Async' },
      events: ['asyncEnd'],
      handlers: {
        handler: (data, ctx) => {
          return newrelic.createSegment(ctx, { name: 'processJob' })
        },
        asyncEnd(data) {
          const ctx = this.agent.tracer.getContext()
          const { result, error } = data
          if (error) {
            console.debug(`[NEWRELIC] processJob failed: ${error.message}`)
          } else {
            console.debug(`[NEWRELIC] processJob resolved with: ${JSON.stringify(result)}`)
            ctx?.segment?.addAttribute('jobResult', String(result))
          }
        }
      }
    }
  ]
}

// Register the subscription.
newrelic.subscribeTo('job-queue', config)
