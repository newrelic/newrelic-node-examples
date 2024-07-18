/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'
const newrelic = require('newrelic')
const { Kafka } = require('kafkajs')
const kafka = new Kafka({
  clientId: 'test-consumer',
  brokers: ['localhost:9093']
})
const topics = ['test-topic', 'other-topic']
const consumer = kafka.consumer({ groupId: 'test-group' })

async function main() {
  newrelic.startBackgroundTransaction('Accept kafka message', async function innerHandler() {
    const backgroundHandle = newrelic.getTransaction()
    backgroundHandle.acceptDistributedTraceHeaders()

    await consumer.connect()
    console.log('Consumer connected')

    topics.forEach(async (topic) => {
      await consumer.subscribe({ topic })
    })

    await consumer.run({
      eachMessage: async function processMessage({ topic, partition, message }) {
        console.log(`Received message from ${topic}: ${message.value.toString()}`)
        await new Promise((resolve) => {
          setTimeout(resolve, Math.floor(Math.random() * 2000))
        })
        await consumer.commitOffsets([{ topic, partition, offset: message.offset }])
      }
    })

    process.on('SIGINT', async () => {
      await consumer.disconnect()
      console.log('Consumer disconnected')
      // eslint-disable-next-line no-process-exit
      process.exit(0)
    })
  })
}

main().catch(console.error)
