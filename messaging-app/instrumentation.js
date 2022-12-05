/*
 * Copyright 2022 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const newrelic = require('newrelic')

newrelic.instrumentMessages('./messages', (shim, messages, modname) => {
  console.log(`[NEWRELIC] instrumenting ${modname}`)
  const Client = messages.Client
  shim.setLibrary('messages')

  console.log(`[NEWRELIC] instrumenting method 'publish'`)
  shim.recordProduce(Client.prototype, 'publish', (shim, fn, name, args) => {
    const queueName = args[0]
    const message = args[1]
    console.log(`[NEWRELIC] publish called on queue '${queueName}' with message '${message}'`)

    // misc key/value parameters can be recorded as a part of the trace segment
    const params = { message, queueName }

    return {
      callback: shim.LAST,
      destinationName: queueName,
      destinationType: shim.QUEUE,
      parameters: params
    }
  })

  console.log(`[NEWRELIC] instrumenting callbacks of method 'getMessage'`)
  shim.recordConsume(Client.prototype, 'getMessage', {
    destinationName: shim.FIRST,
    callback: shim.LAST,
    messageHandler(shim, fn, name, args) {
      const err = args[0]
      const msg = args[1]
      if (msg) {
        console.log(
          `[NEWRELIC] getMessage on queue ${msg.queueName} returned a message: '${msg.msg}'`
        )
        // misc key/value parameters can be recorded as a part of the trace segment
        const params = { message: msg.msg, queueName: msg.queueName }

        return {
          parameters: params
        }
      }

      console.log('[NEWRELIC] getMessage returned no message')
      return {
        parameters: { err }
      }
    }
  })

  console.log(`[NEWRELIC] instrumenting callbacks of method 'subscribe'`)
  shim.recordSubscribedConsume(Client.prototype, 'subscribe', {
    consumer: shim.LAST,
    messageHandler(shim, consumer, name, args) {
      const msg = args[0]
      console.log(`[NEWRELIC] subscribe on queue ${msg.queueName} returned a message: '${msg.msg}'`)
      return {
        destinationName: msg.queueName,
        destinationType: shim.QUEUE
      }
    }
  })
})
