/*
 * Copyright 2026 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

// This is the file where we use our example module.

const newrelic = require('newrelic')
const Queue = require('job-queue')

// These are some example jobs to simulate work.
function exampleJob() {
  // Do some work
  return 'job done'
}

function cbJob(cb) {
  const result = exampleJob()
  return cb('Callback ' + result)
}

async function promiseJob() {
  return new Promise((resolve, reject) => {
    try {
      const result = exampleJob()
      resolve('Promise ' + result)
    } catch (error) {
      reject(error)
    }
  })
}

// The main function of our application
function main() {
  const queue = new Queue()

  // Some notes:
  // We will be creating our transactions with startBackgroundTransaction
  // because this application does not utilize frameworks New Relic already
  // instruments. Thus, transactions are not automatically created for use.
  // If you are already operating within an instrumented framework, you may
  // omit the startBackgroundTransaction wrapper.

  newrelic.startBackgroundTransaction('firstTransaction', function () {
    const transaction = newrelic.getTransaction()
    queue.scheduleJob(async function firstJob() {
      const result = await promiseJob()
      console.log(result)
      transaction.end()
    })
  })

  newrelic.startBackgroundTransaction('secondTransaction', function () {
    const transaction = newrelic.getTransaction()
    queue.scheduleJob(function secondJob() {
      cbJob(function cb(result) {
        console.log(result)
        transaction.end()
      })
    })
  })

  // Wait for the jobs to be added to the queue and then run them
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  sleep(1000).then(() => newrelic.startBackgroundTransaction('thirdTransaction', function () {
    const transaction = newrelic.getTransaction()
    queue.runJobs()
    transaction.end()
    // Finally shutdown the agent so it properly flushes all data
    newrelic.shutdown({ collectPendingData: true }, () => process.exit(0))
  }))
}

main()
