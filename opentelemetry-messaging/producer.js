'use strict'

const newrelic = require('newrelic')
const amqp = require('amqplib')

const queue = "product_inventory"
const text = {
  item_id: "macbook",
  text: "This is a sample message to send receiver to check the ordered Item Availablility",
}

async function sendMessage() {
  try {
    const connection = await amqp.connect("amqp://localhost:5672")
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

newrelic.startBackgroundTransaction('send-message', async function handleTransaction() {
    const txn = newrelic.getTransaction()
    await sendMessage()
    txn.end()
    newrelic.shutdown({ collectPendingData: true }, () => process.exit(0))
});