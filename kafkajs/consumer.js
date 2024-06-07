/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'
const pino = require('pino')
const logger = pino({ level: 'debug' })
const { Kafka } = require('kafkajs')
const kafka = new Kafka({
  clientId: 'test-consumer',
  brokers: ['localhost:9093']
})
const topics = ['test-topic', 'other-topic']
const consumer = kafka.consumer({ groupId: 'test-group' })

async function main() {
  await consumer.connect()
  topics.forEach(async (topic) => {
    await consumer.subscribe({ topic })
  })
  await consumer.run({
    eachMessage: async function processMessage({ topic, partition, message }) {
      logger.info('Handling message %s from topic: %s', message.value.toString(), topic)
      await new Promise((resolve) => {
        setTimeout(resolve, Math.floor(Math.random() * 2000))
      })
      await consumer.commitOffsets([{ topic, partition, offset: message.offset }])
    }
  })
}

main()
  .then(() => {
    logger.info('Consumer is running')
  })
  .catch((err) => {
    logger.error('Failed to start consumer %j', err)
  })
