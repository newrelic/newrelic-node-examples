/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const io = require('socket.io-client')

const socket = io.connect('http://localhost:3000', { reconnect: true })
let responses = 0

socket.on('pong', () => {
  responses += 1
  console.log('ping pong success')
})

socket.on('message-received', (data) => {
  responses += 1
  console.log(`message received: ${JSON.stringify(data)}`)
})

socket.on('update-done', (data) => {
  responses += 1
  console.log(`update received: ${JSON.stringify(data)}`)
})

socket.emit('ping')

for (let i = 1; i < 21; i++) {
  socket.emit('update', { name: `Message ${i}`, msg: 'Hello world' })
  socket.emit('new-message', `this is message ${i}`)
}

setInterval(() => {
  if (responses === 41) {
    console.log('done processing events from server')

    process.exit(0)
  }
}, 500)
