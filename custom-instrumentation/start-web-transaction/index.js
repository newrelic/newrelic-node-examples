/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'
const newrelic = require('newrelic')
const app = require('http').createServer()
const io = require('socket.io')(app)
const randomNum = () => Math.ceil(Math.random() * 100)

function updateChatWindow(data, cb) {
  newrelic.startSegment('updateChatWindow', true, function handler() {
    setTimeout(() => {
      console.log('got update data', data)
      cb(null, data)
    }, randomNum())
  })
}

function addMessageToChat(data, cb) {
  newrelic.startSegment('addMessageToChat', true, function handler() {
    setTimeout(() => {
      console.log('got add message data', data)
      cb(null, data)
    }, randomNum())
  })
}

function onPing() {
  const socket = this
  newrelic.startWebTransaction('/websocket/ping', function transactionHandler() {
    // transaction is ended automatically after synchronous operations
    socket.emit('pong')
  })
}

function onUpdate(data) {
  const socket = this
  newrelic.startWebTransaction('/websocket/update', function transactionHandler() {
    // Must manually end transaction after the callback is invoked
    const transaction = newrelic.getTransaction()
    updateChatWindow(data, function chatWinCb(_, results) {
      socket.emit('update-done', results)
      transaction.end()
    })
  })
}

function onNewMsg(data) {
  const socket = this
  newrelic.startWebTransaction('/websocket/new-message', function transactionHandler() {
    // Returning a promise
    return new Promise((resolve) => {
      addMessageToChat(data, function addMsgCb(_, results) {
        socket.emit('message-received', results)
        resolve()
      })
    })
  })
}

io.on('connection', function onConnect(socket) {
  socket.on('ping', onPing)
  socket.on('update', onUpdate)
  socket.on('new-message', onNewMsg)
})

app.listen(3000, () => {
  console.log('listening on 3000')
})
