'use strict'

const newrelic = require('newrelic')
const { PubSub } = require('@google-cloud/pubsub')

async function publishMessage() {
    try {
        // Assumes Google Cloud credentials are set up via this example:
        // https://cloud.google.com/pubsub/docs/publish-receive-messages-client-library#node.js
        const publisher = new PubSub({ enableOpenTelemetryTracing: true })
        // Create a topic, then publish a message to it
        const topicName = 'my-topic'
        const topic = publisher.topic(topicName)
        const messageId = await topic.publishMessage({ data: Buffer.from('Hello, world!') })
        console.log(`Message ${messageId} published.`)
    } catch (err) {
        console.log('Could not publish message:\n', err)
    }
}

async function main() {
    if (newrelic.agent.collector.isConnected() === false) {
        await new Promise((resolve) => {
            newrelic.agent.on('connected', resolve)
        })
    }

    newrelic.startBackgroundTransaction('publish-message', async function handleTransaction() {
        const txn = newrelic.getTransaction()
        await publishMessage()
        txn.end()
        newrelic.shutdown({ collectPendingData: true }, () => process.exit(0))
    });
}

main()