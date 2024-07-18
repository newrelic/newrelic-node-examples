/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'
const newrelic = require('newrelic')
const { Kafka } = require('kafkajs')

// Give the agent some time to start up.
setTimeout(run, 2000)

const kafka = new Kafka({
  clientId: 'example-producer',
  brokers: ['localhost:9093']
})
const producer = kafka.producer()

async function run() {
  newrelic.startBackgroundTransaction('Send kafka message', async function innerHandler() {
    const backgroundHandle = newrelic.getTransaction()
    const headers = { newrelic: '' }
    backgroundHandle.insertDistributedTraceHeaders(headers)

    await producer.connect()
    console.log('Producer connected')

    const topic = 'test-topic'
    const messages = [{ key: 'key', value: 'test-message' }]

    await producer.send({
      topic,
      messages
    })

    await producer.disconnect()
    console.log('Producer disconnected')
    backgroundHandle.end()
  })
}
