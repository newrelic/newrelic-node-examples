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

newrelic.startBackgroundTransaction('Background task - consumer', function innerHandler() {
  const backgroundHandle = newrelic.getTransaction()
  const headers = {}
  backgroundHandle.acceptDistributedTraceHeaders(headers)

  const worker = new Worker(
    'jobQueue',
    async (job) => {
      console.log('Processing job:', job.id)
      console.log('Job data:', job.data)

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

  backgroundHandle.end()
})
