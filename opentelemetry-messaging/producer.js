/*
 * Copyright 2025 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const newrelic = require('newrelic')
const amqp = require('amqplib')

const queue = 'product_inventory'
const text = {
  item_id: 'macbook',
  text: 'This is a sample message to send receiver to check the ordered Item Availablility',
}

async function sendMessage() {
  try {
    const connection = await amqp.connect('amqp://localhost:5673')
    const channel = await connection.createChannel()

    await channel.assertQueue(queue, { durable: false })
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(text)))
    console.log(" [x] Sent '%s'", text)

    setTimeout(async function() {
      await connection.close()
    }, 100)
  } catch (error) {
    console.warn(error)
  }
}

async function main() {
  if (newrelic.agent.collector.isConnected() === false) {
    await new Promise((resolve) => {
      newrelic.agent.on('connected', resolve)
    })
  }

  newrelic.startBackgroundTransaction('send-message', async function handleTransaction() {
    const txn = newrelic.getTransaction()
    console.log('created trace', txn._transaction.traceId)
    await sendMessage()
    txn.end()
    newrelic.shutdown({ collectPendingData: true }, () => process.exit(0))
  })
}

main()
