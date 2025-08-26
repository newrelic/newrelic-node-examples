/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

// Supporting functions for callback-based segment example
function myAsyncTask(callback) {
  // We'll stub out an async task that runs as part of monitoring a segment
  const sleep = new Promise((resolve) => {
    setTimeout(resolve, 1)
  })
  sleep.then(() => {
    callback(null, 'callback segment')
  })
}

function myNextTask(phrase, callback) {
  // Then we stub out the task that handles that task's result,
  // to show how the result is passed through the segment handler
  callback(null, `${phrase} completed!`)
}

function someCbTask(callback) {
  // This task will be run as its own segment within our transaction handler
  myAsyncTask(function firstCb(err1, result) {
    if (err1) {
      return callback(err1)
    }

    myNextTask(result, function secondCb(err2, output) {
      callback(err2, output)
    })
  })
}

module.exports = { someCbTask }
