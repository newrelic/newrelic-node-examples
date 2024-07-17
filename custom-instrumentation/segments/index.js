/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'
const newrelic = require('newrelic')

function callbackSegment() {
    return new Promise((resolve) => {
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

        function someTask(callback) {
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

        // Segments can only be created inside of transactions. They could be automatically
        // generated HTTP transactions or custom transactions.
        newrelic.startBackgroundTransaction('bg-tx', function transHandler() {
            const tx = newrelic.getTransaction()

            // `startSegment()` takes a segment name, a boolean if a metric should be
            // created for this segment, the handler function, and an optional callback.
            // The handler is the function that will be wrapped with the new segment. When
            // a callback is provided, the segment timing will end when the callback is
            // called.
            newrelic.startSegment('myCallbackSegment', false, someTask, function cb(err, output) {
                // Handle the error and output as appropriate.
                tx.end()
                resolve(output)
            })
        })
    })
}

function promiseSegment() {
    return new Promise((resolve) => {
        async function myAsyncTask() {
            // We'll stub out an async task that runs as part of monitoring a segment
            await new Promise((resolve) => {
                setTimeout(resolve, 1)
            })
            return 'promise segment'
        }

        function myNextTask(phrase) {
            // Then we stub out the task that handles that task's result,
            // to show how the result is passed through the segment handler
            return `${phrase} completed!`
        }

        function someTask() {
            // This task will be run as its own segment within our transaction handler
            return myAsyncTask().then(function thenNext(result) {
                return myNextTask(result)
            })
        }

        // Segments can only be created inside of transactions. They could be automatically
        // generated HTTP transactions or custom transactions.
        newrelic.startBackgroundTransaction('bg-tx', function transHandler() {
            const tx = newrelic.getTransaction()

            // `startSegment()` takes a segment name, a boolean if a metric should be
            // created for this segment, the handler function, and an optional callback.
            // The handler is the function that will be wrapped with the new segment. If
            // a promise is returned from the handler, the segment's ending will be tied
            // to that promise resolving or rejecting.
            return newrelic.startSegment('myPromiseSegment', false, someTask).then(function thenAfter(output) {
                tx.end()
                resolve(output)
            })
        })
    })
}

function asyncSegment() {
    return new Promise((resolve) => {
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

        async function someTask() {
            // This task will be run as its own segment within our transaction handler
            const result = await myAsyncTask()
            return await myNextTask(result)
        }

        // Segments can only be created inside of transactions. They could be automatically
        // generated HTTP transactions or custom transactions.
        newrelic.startBackgroundTransaction('bg-tx', async function transHandler() {
            // `startSegment()` takes a segment name, a boolean if a metric should be
            // created for this segment, the handler function, and an optional callback.
            // The handler is the function that will be wrapped with the new segment.
            // Since `async` functions just return a promise, they are covered just the
            // same as the promise example.
            const output = await newrelic.startSegment('myAsyncSegment', false, someTask)
            resolve(output)
        })
    })
}

function syncAssignSegment() {
    return new Promise((resolve) => {
        function mySyncTask() {
            // We'll stub out an aysnc task that as run as part of monitoring a segment.
            return 'sync assign segment'
        }

        function myNextTask(phrase) {
            // Then we stub out the task that handles that task's result,
            // to show how the result is passed throughthe segment handler.
            return `${phrase} completed!`
        }

        function someTask() {
            // This task will be run as its own segment within our transaction handler
            const result = mySyncTask()
            return myNextTask(result)
        }

        // Segments can only be created inside of transactions. They could be automatically
        // generated HTTP transactions or custom transactions.
        newrelic.startBackgroundTransaction('bg-tx', function transHandler() {
            // `startSegment()` takes a segment name, a boolean if a metric should be
            // created for this segment, the handler function, and an optional callback.
            // The handler is the function that will be wrapped with the new segment.
            const output = newrelic.startSegment('mySyncAssignSegment', false, function timedFunction() {
                return someTask()
            })
            resolve(output)
        })
    })
}

async function main() {
    const data = await Promise.all([callbackSegment(), promiseSegment(), asyncSegment(), syncAssignSegment()])
    console.log(data)
    newrelic.shutdown({ collectPendingData: true }, () => process.exit(0))
}

main()