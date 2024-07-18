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

return newrelic.startBackgroundTransaction('Message queue - producer', function innerHandler() {
  console.log('Message queue started')

  const backgroundHandle = newrelic.getTransaction()
  const headers = { 'test-dt': 'test-newrelic' }
  backgroundHandle.insertDistributedTraceHeaders(headers)

  setInterval(async () => {
    await queue.add('simpleJob', { message: 'This is a background job', headers })
    console.log('Job added to the queue')
  }, 600)

  backgroundHandle.end()

  return new Promise((resolve) => {
    setTimeout(() => {
      newrelic.shutdown({ collectPendingData: true }, () => {
        console.log('new relic agent shutdown')
        resolve()
        // eslint-disable-next-line no-process-exit
        process.exit(0)
      })
    }, 5000)
  })
})
