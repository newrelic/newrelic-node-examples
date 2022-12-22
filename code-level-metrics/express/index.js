/*
 * Copyright 2022 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'
const newrelic = require('newrelic')
const express = require('express')

const { scheduleJob, runJob } = require('./util')
const qs = require('qs')

const app = express()
app.set('query parser', (str) => {
  return qs.parse(str, {
    allowPrototypes: true,
    allowDots: true
  })
})
app.set('view engine', 'html')
const { PORT = '3000', HOST = 'localhost' } = process.env

app.listen(PORT, HOST, function () {
  const addr = this.address()
  const host = addr.family === 'IPv6' ? `[${addr.address}]` : addr.address
  console.log('Server started at http://%s:%s', host, addr.port)
})

app.get('/named-mw', function namedMiddlweare(_req, res) {
  res.send('This is a named middleware handler')
})

app.get('/anon', function (_req, res) {
  res.send('anonymous mw handler')
})

app.get('/arrow', (_req, res) => {
  res.send('arrow fn mw handler')
})

function mw4(req, _res, next) {
  const { profile } = req.query
  newrelic.addCustomAttribute('profileId', profile)
  next()
}

const handler = function (_req, res) {
  const browser = newrelic.getBrowserTimingHeader()
  res.send(`<html><head>${browser}</head><h1>Hello World</h1></html>`)
}

// eslint-disable-next-line
app.get('/chained', function mw1(_req, _res, next) { next() }, function(_req, _res, next) { next() }, (_req, _res, next) => { next() }, mw4, handler)
// The above is deliberately ugly and in one line, with named,
// anonymous, and arrow functions all in one big mess.

app.get('/schedule-job', scheduleJob)
app.get('/run-job', runJob)
