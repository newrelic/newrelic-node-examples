/*
 * Copyright 2026 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

// This is the file where we will subscribe to our example message broker client.

const newrelic = require('newrelic')

// Define the subscriber config: what to instrument, when to fire, and what to do - all in one
// entry per target function, so there's nothing to keep in sync by array index.
// `nifty-messages` is a real dependency (see nifty-messages-pkg/), since subscribeTo rewrites
// the target package's source as it's loaded, which requires it to be resolvable the same way
// `require('nifty-messages')` is.
const config = {
  instrumentations: [
    {
      // subscribe is only called *once* per queue, to register a handler - it's not itself the
      // work we care about tracking. The handler it registers is what runs repeatedly and
      // independently, whenever a message is published - each of those runs should be its own
      // transaction. See the handler below. `Client` is an ES6 class, so this uses
      // className/methodName rather than expressionName.
      module: { name: 'nifty-messages', versionRange: '>=1.0.0', filePath: 'index.js' },
      functionQuery: { className: 'Client', methodName: 'subscribe', kind: 'Sync' },
      // subscribe() itself needs no events beyond `handler` - all the interesting work happens
      // inside the wrapper it installs, not on any lifecycle event of the subscribe() call itself.
      events: [],
      handlers: {
        // `handler` fires once, when subscribe(queueName, handler) is called to register a
        // message handler. We swap that handler out for a wrapper that gives each later,
        // independent delivery its own transaction - createTransaction creates it, and
        // createSegment both creates a segment for the message-processing work and
        // runs the real handler inside it (via its own `handler` option).
        //
        // Important: `handler` only fires if there's an *active transaction* at the moment
        // subscribe() is called (subscribers default to `requireActiveTx: true`, and there's no
        // way to configure that from subscribeTo yet) - see index.js, which wraps the
        // subscribe() call itself in a throwaway transaction for exactly this reason.
        handler: (data, ctx) => {
          const queueName = data.arguments[0]
          const originalHandler = data.arguments[1]
          data.arguments[1] = function wrappedHandler(msg) {
            // createTransaction only creates and enters the transaction's base segment -
            // passed no `handler`, it just returns that context, since we still need to create a
            // nested segment before running the real message-processing work.
            const txCtx = newrelic.createTransaction(ctx, {
              type: 'message',
              name: `Consume/Named/${queueName}`
            })

            // createSegment, on the other hand, is given a `handler` - it creates the
            // nested segment, runs originalHandler inside it, and returns originalHandler's result.
            const result = newrelic.createSegment(txCtx, {
              name: 'processMessage',
              attributes: { message: msg },
              handler: originalHandler,
              thisArg: this,
              args: [msg]
            })

            txCtx.transaction.end()
            return result
          }
          return ctx
        }
      }
    }
  ]
}

// Register the subscription.
newrelic.subscribeTo('nifty-messages', config)
