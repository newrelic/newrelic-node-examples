/*
 * Copyright 2025 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'
const http = require('http')
const https = require('https')

const {
  httpAllCounter,
  httpCrossCounter
} = require('../otel/metrics')

const httpAll = (req, res, next) => {
  httpAllCounter.add(1)

  https.get('https://jsonplaceholder.typicode.com/posts?foo=bar&baz=bat', (httpRes) => {
    let rawData = ''
    httpRes.on('data', (chunk) => rawData += chunk)
    httpRes.on('end', () => {
      const data = JSON.parse(rawData)
      res.json(data)
    })

    httpRes.on('error', (err) => {
      console.error(error)
      next(error)
    })
  })
}

const httpCross = (req, res, next) => {
  httpCrossCounter.add(1)

  const port = req.headers.host.includes('3000') ? 3001 : 3000
  http.get(`http://localhost:${port}/users`, (httpRes) => {
    let rawData = ''
    httpRes.on('data', (chunk) => rawData += chunk)
    httpRes.on('end', () => {
      const data = JSON.parse(rawData)
      res.json(data)
    })

    httpRes.on('error', (err) => {
      console.error(error)
      next(error)
    })
  })
}

module.exports = {
  httpAll,
  httpCross
}
