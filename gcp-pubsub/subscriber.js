'use strict'

const newrelic = require('newrelic')
const { PubSub } = require('@google-cloud/pubsub')

async function startSubscriber() {
    // Assumes Google Cloud credentials are set up via this example:
    // https://cloud.google.com/pubsub/docs/publish-receive-messages-client-library#node.js
    const subscriber = new PubSub({ enableOpenTelemetryTracing: true })
    const subscriptionName = 'my-sub'
    const subscription = subscriber.subscription(subscriptionName)
    console.log(`Listening for messages on ${subscriptionName}`)
    subscription.on('message', message => {
        newrelic.startBackgroundTransaction('receive-message', async function handleTransaction() {
            console.log(`Received message: ${message.data}`)
            message.ack()
        })
    })
}

async function main() {
    if (newrelic.agent.collector.isConnected() === false) {
        await new Promise((resolve) => {
            newrelic.agent.on('connected', resolve)
        })
    }
    await startSubscriber()
}

main()