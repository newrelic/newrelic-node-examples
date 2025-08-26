/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'
const fastify = require('fastify')({ logger: true })
const { Kafka } = require('kafkajs')
const kafka = new Kafka({
  clientId: 'example-producer',
  brokers: ['localhost:9093']
})
const producer = kafka.producer()
const { PORT: port = 3000, HOST: host = '127.0.0.1' } = process.env

fastify.listen({ host, port }, function listener(err) {
  if (err) {
    fastify.log.error(err)

    process.exit(1)
  }
})

fastify.post('/message', async (request, reply) => {
  const { topic = 'test-topic', messages = [{ key: 'key', value: 'test-message' }] } =
    request.body || {}
  await producer.connect()
  await producer.send({
    topic,
    messages
  })
  return reply.send(`Sent ${messages.length} messages to ${topic}`)
})
