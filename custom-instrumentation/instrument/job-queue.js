/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

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