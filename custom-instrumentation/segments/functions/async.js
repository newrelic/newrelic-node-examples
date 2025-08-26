/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

// Supporting functions for async-based segment example
async function myAsyncTask() {
  // We'll stub out an async task that runs as part of monitoring a segment
  await new Promise((resolve) => {
    setTimeout(resolve, 1)
  })
  return 'async segment'
}

async function myNextTask(phrase) {
  // Then we stub out the task that handles that task's result
  // to show how the result is passed through the segment handler
  await new Promise((resolve) => {
    setTimeout(resolve, 1)
  })
  return `${phrase} completed!`
}

async function someAsyncTask() {
  // This task will be run as its own segment within our transaction handler
  const result = await myAsyncTask()
  return await myNextTask(result)
}

module.exports = { someAsyncTask }
