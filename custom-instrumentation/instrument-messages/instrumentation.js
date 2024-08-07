/*
 * Copyright 2022 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const newrelic = require('newrelic')
const niftyPath = require.resolve('./nifty-messages')

newrelic.instrumentMessages({ absolutePath: niftyPath, moduleName: 'nifty-messages', onRequire: (shim, messages, modname) => {
  console.log(`[NEWRELIC] instrumenting ${modname}`)
  const Client = messages.Client
  // The library name will be used for naming transactions
  shim.setLibrary('nifty-messages')

  console.log(`[NEWRELIC] instrumenting method 'publish'`)
  shim.recordProduce(Client.prototype, 'publish', (shim, fn, name, args) => {
    const queueName = args[0]
    const message = args[1]
    console.log(`[NEWRELIC] publish called on queue '${queueName}' with message '${message}'`)

    // misc key/value parameters can be recorded as a part of the trace segment
    const params = { message, queueName }

    return new shim.specs.MessageSpec({
      callback: shim.LAST,
      destinationName: queueName,
      destinationType: shim.QUEUE,
      parameters: params
    })
  })

  console.log(`[NEWRELIC] instrumenting method 'purge'`)
  shim.recordPurgeQueue(Client.prototype, 'purge', (shim, fn, name, args) => {
    const queueName = args[0]
    console.log(`[NEWRELIC] purge called on queue '${queueName}'`)

    // misc key/value parameters can be recorded as a part of the trace segment
    const params = { queueName }

    return new shim.specs.MessageSpec({
      callback: shim.LAST,
      destinationName: queueName,
      destinationType: shim.QUEUE,
      parameters: params
    })
  })

  console.log(`[NEWRELIC] instrumenting callbacks of method 'getMessage'`)
  shim.recordConsume(Client.prototype, 'getMessage', new shim.specs.MessageSpec({
    destinationName: shim.FIRST,
    callback: shim.LAST,
    after({ args }) {
      const [err, msg] = args
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
  }))

  console.log(`[NEWRELIC] instrumenting callbacks of method 'subscribe'`)
  shim.recordSubscribedConsume(Client.prototype, 'subscribe', new shim.specs.MessageSubscribeSpec({
    consumer: shim.LAST,
    // This handler will be called in whatever context our subscribed
    // message handler is called. In index.js, this is the
    // `consumeMessage` function defined by the `subscribe` Express
    // route, which will be called whenever new messages are
    // published.
    //
    // Note that we are not recording the subscription call itself,
    // only the the consume calls made because a subscription was made
    // earlier.
    messageHandler(shim, args) {
      const msg = args[0]
      console.log(`[NEWRELIC] subscribe on queue ${msg.queueName} returned a message: '${msg.msg}'`)
      return {
        destinationName: msg.queueName,
        destinationType: shim.QUEUE
      }
    }
  }))
}})
