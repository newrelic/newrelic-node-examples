/*
 * Copyright 2026 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

// This is our example message broker client. Publishing a message to a
// queue immediately delivers it to any handler subscribed to that queue -
// simulating a real message consumer, where messages arrive independently
// and asynchronously, whenever some other, unrelated part of the system
// publishes one.

const EventEmitter = require('node:events')

class Client extends EventEmitter {
  constructor() {
    super()
    this.queues = {}
    this.handlers = {}
  }

  publish(queueName, msg) {
    if (this.queues[queueName] === undefined) {
      this.#initQueue(queueName)
    }
    this.queues[queueName].push(msg)
    this.emit(`message:${queueName}`)
  }

  subscribe(queueName, handler) {
    if (this.queues[queueName] === undefined) {
      this.#initQueue(queueName)
    }
    this.handlers[queueName].push(handler)
  }

  #initQueue(queueName) {
    this.queues[queueName] = []
    this.handlers[queueName] = []
    this.on(`message:${queueName}`, () => {
      const queue = this.queues[queueName]
      const msg = queue.shift()
      for (const handler of this.handlers[queueName]) {
        handler(msg)
      }
    })
  }
}

module.exports = { Client }
