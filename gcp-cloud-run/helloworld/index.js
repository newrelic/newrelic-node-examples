/*
 * Copyright 2025 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

const newrelic = require('newrelic')
const express = require('express')
const app = express()

app.get('/', (req, res) => {
  newrelic.startBackgroundTransaction('helloworld', () => {
    const txn = newrelic.getTransaction()
    const name = process.env.NAME || 'World'
    res.send(`Hello ${name}!`)
    txn.end()
  })
})

const port = parseInt(process.env.PORT) || 8080
app.listen(port, () => {
  console.log(`helloworld: listening on port ${port}`)
})
