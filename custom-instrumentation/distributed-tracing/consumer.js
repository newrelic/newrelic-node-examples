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

// since BullMQ is not auto instrumented by the newrelic node agent, we have to manually start a transaction
return newrelic.startBackgroundTransaction('Message queue - consumer', function outerHandler() {
  const worker = new Worker(
    'jobQueue',
    async (job) => {
      // create a transaction for every consumption
      newrelic.startBackgroundTransaction('Message consumption', function innerHandler() {
        console.log('Processing job:', job.id)
        console.log('Job data:', job.data)
        console.log('Job headers', job.data.headers)
  
        // call newrelic.getTransaction to retrieve a handle on the current transaction
        const backgroundHandle = newrelic.getTransaction()
  
        // link the transaction started in the producer by accepting its headers
        backgroundHandle.acceptDistributedTraceHeaders('Queue', job.data.headers)
  
        // end the transaction
        backgroundHandle.end()
        return Promise.resolve()
      })
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
    process.on('SIGINT', () => {
      newrelic.shutdown({ collectPendingData: true }, () => {
        console.log('new relic agent shutdown')
        // eslint-disable-next-line no-process-exit
        process.exit(0)
      })
    })
  })
})
