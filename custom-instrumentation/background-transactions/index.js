/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'
const newrelic = require('newrelic')

/**
 * Function to simulate async work with a callback.
 * @param callback
 */
function doSomeWorkCb(callback) {
  setTimeout(function work() {
    callback()
  }, 500)
}

// example1-basic
function basicBackgroundTransaction() {
  return new Promise((resolve) => {
    const transactionName = 'myBasicTransaction'

    // `startBackgroundTransaction()` takes a name, group, and a handler function to
    // execute. The group is optional. The last parameter is the function performing
    // the work inside the transaction. Once the transaction starts, there are
    // three ways to end it:
    //
    // 1) Call `transaction.end()`. The `transaction` can be received by calling
    //    `newrelic.getTransaction()` first thing in the handler function. Then,
    //    when you call `transaction.end()` timing will stop.
    // 2) Return a promise. The transaction will end when the promise resolves or
    //    rejects.
    // 3) Do neither. If no promise is returned, and `getTransaction()` isn't
    //    called, the transaction will end immediately after the handler returns.

    // Here is an example for the first case.
    newrelic.startBackgroundTransaction(transactionName, function handle() {
      const transaction = newrelic.getTransaction()
      doSomeWorkCb(function cb() {
        transaction.end()
        resolve()
      })
    })
  })
}

// example2-grouping
function groupingBackgroundTransaction() {
  return new Promise((resolve) => {
    const transactionName = 'myGroupedTransaction'

    // The second parameter to `startBackgroundTransaction` may be a group to
    // organize related background transactions on APM. More on this can be found
    // on our documentation website:
    // https://docs.newrelic.com/docs/apm/applications-menu/monitoring/transactions-page#txn-type-dropdown
    const groupName = 'myTransactionGroup'

    newrelic.startBackgroundTransaction(transactionName, groupName, function handle() {
      const transaction = newrelic.getTransaction()
      doSomeWorkCb(function cb() {
        transaction.end()
        resolve()
      })
    })
  })
}

// example3-results
function resultsBackgroundTransaction() {
  const transactionName = 'myResultTransaction'
  // The return value of the handle is passed back from `startBackgroundTransaction`.
  return newrelic.startBackgroundTransaction(transactionName, function handle() {
    return 'done'
  })
}

// example4-promises
function promiseBackgroundTransaction() {
  const transactionName = 'myPromiseTransaction'

  // startBackgroundTransaction() takes a name, group, and a handler function to
  // execute. The group is optional. The last parameter is the function performing
  // the work inside the transaction. Once the transaction starts, there are
  // three ways to end it:
  //
  // 1) Call `transaction.end()`. The `transaction` can be received by calling
  //    `newrelic.getTransaction()` first thing in the handler function. Then,
  //    when you call `transaction.end()` timing will stop.
  // 2) Return a promise. The transaction will end when the promise resolves or
  //    rejects.
  // 3) Do neither. If no promise is returned, and `getTransaction()` isn't
  //    called, the transaction will end immediately after the handle returns.

  // Here is an example for the second case.
  return newrelic
    .startBackgroundTransaction(transactionName, function handle() {
      return doSomeWork()
        .then(function resolve(data) {
          // Handle results...
          return data
        })
        .catch(function reject(error) {
          newrelic.noticeError(error)
          // Handle error...
        })
    })
    .then(function afterTransaction(data) {
      // Note that you can continue off of the promise at this point, but the
      // transaction has ended and this work will not be associated with it.
      return data
    })

  /*
     * Function to simulate async function that returns a promise.
     */
  function doSomeWork() {
    return new Promise(function executor(resolve) {
      setTimeout(function work() {
        resolve('done')
      }, 500)
    })
  }
}

async function main() {
  const data = await Promise.all([basicBackgroundTransaction(), groupingBackgroundTransaction(), promiseBackgroundTransaction(), resultsBackgroundTransaction()])
  console.log(data)
  newrelic.shutdown({ collectPendingData: true }, () => process.exit(0))
}

main()
