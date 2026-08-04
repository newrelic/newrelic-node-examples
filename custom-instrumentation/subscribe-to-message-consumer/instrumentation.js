/*
 * Copyright 2026 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

// This is the file where we will subscribe to our example message broker client.

const newrelic = require('newrelic')

// `nifty-messages` is a real dependency (see nifty-messages-pkg/), since createSubscription
// rewrites the target package's source as it's loaded, which requires it to be resolvable the
// same way `require('nifty-messages')` is.
const subscription = newrelic.createSubscription('nifty-messages')

subscription.instrument(
  {
    module: { name: 'nifty-messages', versionRange: '>=1.0.0', filePath: 'index.js' },
    // subscribe is only called *once* per queue, to register a handler - it's not itself the
    // work we care about tracking. The handler it registers is what runs repeatedly and
    // independently, whenever a message is published - each of those runs should be its own
    // transaction. See the `handler` below. `Client` is an ES6 class, so this uses
    // className/methodName rather than expressionName.
    functionQuery: { className: 'Client', methodName: 'subscribe', kind: 'Sync' }
  },
  {
    // `handler` fires once, when subscribe(queueName, handler) is called to register a message
    // handler. We swap that handler out for a wrapper that gives each later, independent
    // delivery its own transaction - startBackgroundTransaction creates it, startSegment creates
    // a nested segment for the message-processing work and runs the real handler inside it.
    //
    // Important: `handler` only fires if there's an *active transaction* at the moment
    // subscribe() is called (subscribers default to requiring one, and createSubscription
    // doesn't yet expose a way to change that) - see index.js, which wraps the subscribe() call
    // itself in a throwaway transaction for exactly this reason.
    handler: (data, ctx) => {
      const queueName = data.arguments[0]
      const originalHandler = data.arguments[1]
      data.arguments[1] = function wrappedHandler(msg) {
        return newrelic.startBackgroundTransaction(`Consume/Named/${queueName}`, () => {
          const transaction = newrelic.getTransaction()

          const result = newrelic.startSegment('processMessage', false, () => {
            newrelic.agent.tracer.getSegment()?.addAttribute('message', msg)
            return originalHandler.call(this, msg)
          })

          transaction.end()
          return result
        })
      }
      return ctx
    }
  }
)

// Only now does anything actually get built/patched.
subscription.register()
