/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'
const newrelic = require('newrelic')
const { Worker } = require('bullmq')
const IORedis = require('ioredis')

const connection = new IORedis({
  maxRetriesPerRequest: null
})

return newrelic.startBackgroundTransaction('Message queue - consumer', function innerHandler() {
  const worker = new Worker(
    'jobQueue',
    async (job) => {
      console.log('Processing job:', job.id)
      console.log('Job data:', job.data)
      console.log('Job headers', job.data.headers)

      const backgroundHandle = newrelic.getTransaction()
      backgroundHandle.acceptDistributedTraceHeaders('Queue', job.data.headers)
      backgroundHandle.end()
      return Promise.resolve()
    },
    { connection }
  )

  worker.on('completed', (job) => {
    console.log(`Job with ID ${job.id} has been completed`)
  })

  worker.on('failed', (job, err) => {
    console.log(`Job with ID ${job.id} has failed with error: ${err.message}`)
  })

  console.log('Worker started')

  return new Promise((resolve) => {
    setTimeout(() => {
      newrelic.shutdown({ collectPendingData: true }, () => {
        console.log('new relic agent shutdown')
        resolve()
        // eslint-disable-next-line no-process-exit
        process.exit(0)
      })
    }, 20000)
  })
})
