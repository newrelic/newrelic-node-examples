/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

function Queue() {
  this.jobs = []
}

Queue.prototype.runJobs = function run(jobs) {
  while (jobs.length) {
    jobs.pop()()
  }
}

Queue.prototype.scheduleJob = function scheduleJob(job) {
  const queue = this
  process.nextTick(function() {
    if (queue.jobs.length === 0) {
      setTimeout(queue.runJobs, 1000, queue.jobs)
    }
    queue.jobs.push(job)
  })
}

module.exports = Queue