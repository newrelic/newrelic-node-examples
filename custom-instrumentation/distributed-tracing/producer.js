/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'
const newrelic = require('newrelic')
const { Queue } = require('bullmq')
const IORedis = require('ioredis')

const connection = new IORedis({
  maxRetriesPerRequest: null
})

const queue = new Queue('jobQueue', { connection })

newrelic.startBackgroundTransaction('Background task - producer', function innerHandler() {
  const backgroundHandle = newrelic.getTransaction()
  const headers = {}
  backgroundHandle.insertDistributedTraceHeaders(headers)

  setInterval(async () => {
    await queue.add('simpleJob', { message: 'This is a background job', headers })
    console.log('Job added to the queue')
  }, 600)

  console.log('Background job queue started')
  backgroundHandle.end()
})
