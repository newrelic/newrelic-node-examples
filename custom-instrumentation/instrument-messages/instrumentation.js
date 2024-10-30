/*
 * Copyright 2022 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

// This is the file where we will instrument our messaging library.

const newrelic = require('newrelic')
const niftyPath = require.resolve('./nifty-messages')

// The agent will call our instrumentation function when the message 
// broker module is required in the user's application code.
newrelic.instrumentMessages({ 
  absolutePath: niftyPath, 
  moduleName: 'nifty-messages', 
  onRequire: instrumentNiftyMessages
})

// The instrumentation function receives the following arguments:
//  shim - The API object that contains methods for performing instrumentation.
//  messages - The loaded module that should be instrumented 
//  moduleName - The name of the loaded module. This is useful if the same 
//    instrumentation function was used to instrument multiple modules.
// 
// The function can be included in the application code itself, or it can live 
// in a separate instrumentation module. In either case, we need to register it 
// in our application code in order for the agent to use it. 
// This is done in our application by calling instrumentMessages (see above).
function instrumentNiftyMessages(shim, messages, moduleName) {
  console.log(`[NEWRELIC] instrumenting ${moduleName}`)
  const Client = messages.Client

  // The first thing the instrumentation should specify is the name 
  // of the message broker that the library being instrumented applies to. 
  // This value is used as a part of the metric names.
  shim.setLibrary('nifty-messages')

  // Producing Messages
  // 
  // An application can publish a message to the broker. When this happens as 
  // part of a transaction, the agent can record this call to the broker as a 
  // separate segment in the transaction trace. Here is an example of instrumenting 
  // a publish method on the Client class from the message broker module we are instrumenting.
  //
  // The recordProduce method wraps the publish function, so that when it's called we can 
  // extract information about the specific call from its arguments. This is done in the 
  // callback function (third argument), where we need to return a map of parameters that 
  // describe the current operation.
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

  // Consuming Messages
  //
  // An application can consume messages from the broker's queues. 
  // The mechanism for consuming messages can vary based on the broker and type 
  // of queues. Messages can either be consumed by the client explicitly asking 
  // for a message (e.g. a worker-queue pattern), or it can subscribe to a queue 
  // and receive messages as they become available (e.g. a pub/sub pattern).
  //
  // When the client calls getMessage, the message broker returns a message from 
  // the requested queue. Similarly to the produce-messages case, recordConsume 
  // wraps the function used to call the message broker. The main difference here 
  // is that some parameters may be included as arguments to the getMessage call, 
  // while some might be extracted from the received message. As a result, there 
  // is an extra parameter called messageHandler, which refers to a function to be 
  // called when a message is received. In this function we can extract additional 
  // information from the message and pass on to the API.
  console.log(`[NEWRELIC] instrumenting callbacks of method 'getMessage'`)
  shim.recordConsume(Client.prototype, 'getMessage', new shim.specs.MessageSpec({
    destinationName: shim.FIRST,
    callback: shim.LAST,
    after({ result, error }) {
      if (result) {
        console.log(
          `[NEWRELIC] getMessage on queue ${result.queueName} returned a message: '${result.msg}'`
        )
        // misc key/value parameters can be recorded as a part of the trace segment
        const params = { message: result.msg, queueName: result.queueName }

        return {
          parameters: params
        }
      }

      console.log('[NEWRELIC] getMessage returned no message')
      return {
        parameters: { err: error }
      }
    }
  }))

  // For listening to messages sent by the broker, let's assume that the client has 
  // a subscribe method, which registers a function for processing messages when 
  // they are received. 
  // 
  // The recordSubscribedConsume method has almost the same interface as recordConsume. 
  // The one difference is that we need to also specify which argument represents the 
  // consumer function (the function that will be called everytime a message arrives). 
  // This is specified using the consumer parameter.
  //
  // The messageHandler parameter works the same as in the recordConsume case. When a 
  // message is consumed, the messageHandler function will be called, and we can extract
  // the information we need from the message.
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
}
