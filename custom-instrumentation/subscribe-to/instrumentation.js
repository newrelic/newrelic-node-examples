/*
 * Copyright 2026 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

// This is the file where we will subscribe to our example module.

const newrelic = require('newrelic')

// 1. Define the subscriber config (what to instrument).
// `job-queue` is a real dependency in package.json (see job-queue-pkg/), since
// subscribeTo works by rewriting the target package's source as it's loaded,
// which requires it to be resolvable the same way `require('job-queue')` is.
const config = {
  instrumentations: [
    {
      module: { name: 'job-queue', versionRange: '>=1.0.0', filePath: 'index.js' },
      functionQuery: { expressionName: 'scheduleJob', kind: 'Sync' }
    },
    {
      module: { name: 'job-queue', versionRange: '>=1.0.0', filePath: 'index.js' },
      functionQuery: { expressionName: 'runJobs', kind: 'Sync' }
    }
  ]
}

// 2. Define events (when to trigger).
// index-based, matches config.instrumentations: index 0 is scheduleJob, index 1 is runJobs.
const events = [
  ['end'],
  ['end']
]

// 3. Define handlers (the logic to run).
// index-based, matches config.instrumentations: index 0 is scheduleJob, index 1 is runJobs.
const handlers = [
  {
    // `handler` fires on the `start` event and is where the segment for this
    // call gets created. It must be a regular function, not an arrow
    // function - `this` needs to refer to the subscriber instance so
    // `this.createSegment` works.
    handler(data, ctx) {
      const job = data?.arguments?.[0]
      return this.createSegment({
        name: `scheduleJob - ${job?.name ?? 'anonymous job'}`,
        ctx
      })
    },
    end: (data) => {
      const job = data?.arguments?.[0]
      console.debug(`[NEWRELIC] scheduleJob ended for ${job?.name ?? 'anonymous job'}`)
    }
  },
  {
    handler(data, ctx) {
      return this.createSegment({ name: 'runJobs', ctx })
    },
    end: () => {
      console.debug('[NEWRELIC] runJobs ended')
    }
  }
]

// 4. Register the subscription.
newrelic.subscribeTo('job-queue', config, events, handlers)
