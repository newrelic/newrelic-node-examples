/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'
const fastify = require('fastify')({ logger: true })
const { Kafka } = require('kafkajs')
const logger = () => ({ namespace, level, label, log }) => {
  if (log?.message?.startsWith('Request Produce')) {
    console.log('Message size: ', log.size)
  }
}
const kafka = new Kafka({
  clientId: 'example-producer',
  brokers: ['localhost:9093'],
  logLevel: 'debug',
  logCreator: logger
})
const producer = kafka.producer()
const { PORT: port = 3000, HOST: host = '127.0.0.1' } = process.env

fastify.listen({ host, port }, function listener(err) {
  if (err) {
    fastify.log.error(err)
    // eslint-disable-next-line no-process-exit
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
