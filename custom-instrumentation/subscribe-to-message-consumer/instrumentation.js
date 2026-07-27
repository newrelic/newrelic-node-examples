/*
 * Copyright 2026 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

// This is the file where we will subscribe to our example message broker client.

const newrelic = require('newrelic')

// 1. Define the subscriber config (what to instrument).
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
      functionQuery: { className: 'Client', methodName: 'subscribe', kind: 'Sync' }
    }
  ]
}

// 2. Define events (when to trigger). subscribe() itself needs nothing beyond `handler` - all
// the interesting work happens inside the wrapper it installs, not on any lifecycle event of the
// subscribe() call itself.
const events = [
  []
]

// 3. Define handlers (the logic to run).
const handlers = [
  {
    // `handler` fires once, when subscribe(queueName, handler) is called to register a message
    // handler. We swap that handler out for a wrapper that gives each later, independent
    // delivery its own transaction - createSubscriberTransaction creates it,
    // runInSubscriberContext runs the real handler inside it.
    //
    // Important: `handler` only fires if there's an *active transaction* at the moment
    // subscribe() is called (subscribers default to `requireActiveTx: true`, and there's no way
    // to configure that from subscribeTo yet) - see index.js, which wraps the subscribe() call
    // itself in a throwaway transaction for exactly this reason.
    handler: (data, ctx) => {
      const queueName = data.arguments[0]
      const originalHandler = data.arguments[1]
      data.arguments[1] = function wrappedHandler(msg) {
        // createSubscriberTransaction only creates the transaction's base segment - it
        // doesn't create a segment for the actual message-processing work. Create one
        // explicitly so the trace has something to show besides the bare transaction.
        const txCtx = newrelic.createSubscriberTransaction(ctx, {
          type: 'message',
          name: `Consume/Named/${queueName}`
        })
        const segmentCtx = newrelic.createSubscriberSegment(txCtx, { name: 'processMessage' })
        segmentCtx.segment.addAttribute('message', msg)

        const result = newrelic.runInSubscriberContext(segmentCtx, {
          handler: originalHandler,
          thisArg: this,
          args: [msg]
        })

        segmentCtx.segment.touch()
        txCtx.transaction.end()
        return result
      }
      return ctx
    }
  }
]

// 4. Register the subscription.
newrelic.subscribeTo('nifty-messages', config, events, handlers)
