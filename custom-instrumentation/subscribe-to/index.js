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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// The main function of our application
function main() {
  const queue = new Queue()

  // Some notes:
  // We will be creating one transaction with startBackgroundTransaction
  // because this application does not utilize frameworks New Relic already
  // instruments. Thus, transactions are not automatically created for use.
  // If you are already operating within an instrumented framework, you may
  // omit the startBackgroundTransaction wrapper.
  //
  // Everything below runs inside a single transaction, so scheduleJob,
  // runJobs, and processJob all show up as segments in the same trace,
  // making their relative timings easy to compare.
  newrelic.startBackgroundTransaction('jobQueueDemo', async function () {
    const transaction = newrelic.getTransaction()

    // scheduleJob only queues the job - the job itself doesn't actually run
    // until runJobs() pops it later. Track completion with promises so we
    // know when the jobs have really finished, since runJobs() returns as
    // soon as it's *started* each one, not when they're done.
    let resolveFirstJob
    const firstJobDone = new Promise((resolve) => { resolveFirstJob = resolve })
    queue.scheduleJob(async function firstJob() {
      const result = await promiseJob()
      console.log(result)
      resolveFirstJob()
    })

    let resolveSecondJob
    const secondJobDone = new Promise((resolve) => { resolveSecondJob = resolve })
    queue.scheduleJob(function secondJob() {
      cbJob(function cb(result) {
        console.log(result)
        resolveSecondJob()
      })
    })

    // Wait for the jobs to be added to the queue, then run them.
    await sleep(1000)
    queue.runJobs()
    await Promise.all([firstJobDone, secondJobDone])

    // processJob is async - it waits a bit, then awaits whatever the job
    // itself returns, resolving with the job's result.
    const result = await queue.processJob(function complexJob() {
      return promiseJob()
    })
    console.log('processJob result:', result)

    transaction.end()
    // Finally shutdown the agent so it properly flushes all data
    newrelic.shutdown({ collectPendingData: true }, () => process.exit(0))
  })
}

main()
