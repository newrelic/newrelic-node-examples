/*
 * Copyright 2025 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const amqp = require('amqplib')

const queue = 'product_inventory'

async function startConsumer() {
  try {
    const connection = await amqp.connect('amqp://localhost:5673')
    const channel = await connection.createChannel()

    process.once('SIGINT', async function () {
      await channel.close()
      await connection.close()
    })

    await channel.assertQueue(queue, { durable: false })

    console.log(' [*] Waiting for messages. To exit press CTRL+C')

    channel.consume(
      queue,
      function (message) {
        if (message) {
          console.log(
            " [x] Received '%s'",
            JSON.parse(message.content.toString())
          )
          // Acknowledge the message
          channel.ack(message)
        }
      },
      { noAck: false }
    )
  } catch (error) {
    console.warn(error)
  }
}

startConsumer()
