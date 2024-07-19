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

// since BullMQ is not auto instrumented by the newrelic node agent, we have to manually start a transaction.
return newrelic.startBackgroundTransaction('Message queue - producer', function innerHandler() {
  console.log('Message queue started')

  // call newrelic.getTransaction to retrieve a handle on the current transaction.
  const backgroundHandle = newrelic.getTransaction()

  // insert the headers into the transaction
  const headers = { 'test-dt': 'test-newrelic' }
  backgroundHandle.insertDistributedTraceHeaders(headers)

  // add jobs every 6 milliseconds with data containing the message and the headers
  setInterval(async () => {
    await queue.add('simpleJob', { message: 'This is a background job', headers })
    console.log('Job added to the queue')
  }, 600)

  // end the transaction
  backgroundHandle.end()

  return new Promise((resolve) => {
    setTimeout(() => {
      newrelic.shutdown({ collectPendingData: true }, () => {
        console.log('new relic agent shutdown')
        resolve()
        // eslint-disable-next-line no-process-exit
        process.exit(0)
      })
    }, 10000)
  })
})