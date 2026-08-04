/*
 * Copyright 2026 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

// This is the file where we will subscribe to our example module.

const newrelic = require('newrelic')

// createSubscription gives us one validated call per target function - `job-queue` is a real
// dependency in package.json (see job-queue-pkg/), since it rewrites the target package's source
// as it's loaded, which requires it to be resolvable the same way `require('job-queue')` is.
const subscription = newrelic.createSubscription('job-queue')

// `.instrument()`'s second argument configures the returned subscriber in one shot - `.events`
// is derived from whichever handlers you give (here just `end`), and each one automatically
// touches the segment afterward, so there's no separate step to remember.
subscription.instrument(
  {
    module: { name: 'job-queue', versionRange: '>=1.0.0', filePath: 'index.js' },
    functionQuery: { expressionName: 'scheduleJob', kind: 'Sync' }
  },
  {
    // `handler` fires once, at the call itself, and is where the segment for this call gets
    // created. It's called with `this` bound to the subscriber, so `this.createSegment` (not an
    // arrow function here) is how a segment actually gets made.
    handler: function (data, ctx) {
      const job = data?.arguments?.[0]
      return this.createSegment({ name: `scheduleJob: ${job?.name ?? 'anonymous job'}`, ctx })
    },
    end: (data) => {
      const job = data?.arguments?.[0]
      console.debug(`[NEWRELIC] scheduleJob ended for ${job?.name ?? 'anonymous job'}`)
    }
  }
)

subscription.instrument(
  {
    module: { name: 'job-queue', versionRange: '>=1.0.0', filePath: 'index.js' },
    functionQuery: { expressionName: 'runJobs', kind: 'Sync' }
  },
  {
    handler: function (data, ctx) {
      return this.createSegment({ name: 'runJobs', ctx })
    },
    end: () => {
      console.debug('[NEWRELIC] runJobs ended')
    }
  }
)

subscription.instrument(
  {
    // processJob is `async` (returns a promise), so `kind: 'Async'` here instead of 'Sync' -
    // that's what tells the transformer to wrap it as a promise-based trace (asyncStart/asyncEnd
    // around the resolution), rather than a plain synchronous call.
    module: { name: 'job-queue', versionRange: '>=1.0.0', filePath: 'index.js' },
    functionQuery: { expressionName: 'processJob', kind: 'Async' }
  },
  {
    handler: function (data, ctx) {
      return this.createSegment({ name: 'processJob', ctx })
    },
    asyncEnd: function (data) {
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
)

// Only now does anything actually get built/patched.
subscription.register()
