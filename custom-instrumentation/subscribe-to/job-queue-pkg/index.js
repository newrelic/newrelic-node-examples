/*
 * Copyright 2026 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

// This is our example module, a job queue. After a job is scheduled, it is
// pushed to the queue to be ran later. Once runJobs is called, all jobs
// are ran in the order that they were pushed.

function Queue() {
  this.jobs = []
}

Queue.prototype.runJobs = function runJobs() {
  const jobs = this.jobs
  while (jobs.length) {
    const job = jobs.pop()
    job()
  }
}

Queue.prototype.scheduleJob = function scheduleJob(job) {
  const jobs = this.jobs
  process.nextTick(function () {
    jobs.push(job)
  })
}

// Processes a single job asynchronously: waits a bit (simulating queue
// latency), then awaits the job itself, which may return a plain value or a
// promise. Returns a promise that resolves with the job's result or rejects
// with whatever error the job threw.
Queue.prototype.processJob = async function processJob(job) {
  await new Promise((resolve) => setTimeout(resolve, 50))
  const result = await job()
  return result
}

module.exports = Queue
