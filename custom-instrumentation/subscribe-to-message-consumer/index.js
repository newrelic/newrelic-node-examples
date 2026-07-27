/*
 * Copyright 2026 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

// This is the file where we use our example message broker client.

const newrelic = require('newrelic')
const { Client } = require('nifty-messages')

const client = new Client()

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function subscribeToOrders() {
  // subscribe() must be called within an active transaction: `handler` (bound to the `start`
  // event, see instrumentation.js) only fires if there's an active transaction at the moment
  // subscribe() is called - otherwise our wrapper never gets installed at all, silently. A
  // throwaway transaction just for the registration call is enough.
  return new Promise((resolve) => {
    newrelic.startBackgroundTransaction('subscribeToOrders', function () {
      client.subscribe('orders', function onOrderMessage(msg) {
        console.log(`[NEWRELIC] received message on 'orders': ${msg}`)
      })
      newrelic.getTransaction().end()
      resolve()
    })
  })
}

async function main() {
  await subscribeToOrders()

  // Publish a few messages at different times, simulating messages arriving independently -
  // each delivery to onOrderMessage should get its own transaction, not be nested under
  // whatever happened to call publish.
  await new Promise((resolve) => {
    newrelic.startBackgroundTransaction('publishOrders', async function () {
      const transaction = newrelic.getTransaction()
      client.publish('orders', 'order #1')
      await sleep(200)
      client.publish('orders', 'order #2')
      await sleep(200)
      client.publish('orders', 'order #3')
      transaction.end()
      resolve()
    })
  })

  // Give the last message's delivery a moment to finish, then shut down.
  await sleep(200)
  newrelic.shutdown({ collectPendingData: true }, () => process.exit(0))
}

main()
