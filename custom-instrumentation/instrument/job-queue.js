/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

// This is our example module, a job queue. After a job is scheduled, it is
// pushed to the queue to be ran later. Once runJobs is called, all jobs
// are ran in the order that they were pushed. 

function Queue() {
  this.jobs = []
}

Queue.prototype.runJobs = function run() {
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

module.exports = Queue