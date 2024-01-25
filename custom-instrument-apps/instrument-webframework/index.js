/*
 * Copyright 2022 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const { SimpleFramework } = require('./simple-framework')

const loggingMiddleware = (req, _) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
}

const app = new SimpleFramework()
app.use(loggingMiddleware)

app.get('/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('Hello, World!')
})

app.post('/submit', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('Form submitted successfully!')
})

app.start(3000)
