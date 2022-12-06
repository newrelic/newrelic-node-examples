'use strict'

const express = require('express')
const app = express()
const { PORT = '3000', HOST = 'localhost' } = process.env

app.listen(PORT, HOST, function() {
  const addr = this.address()
  const host = addr.family === 'IPv6' ? `[${addr.address}]` : addr.address
  console.log('Server started at http://%s:%s', host, addr.port)
})


app.get('/named-mw', function namedMiddlweare(_req, res) {
  res.send('This is a named middleware handler')
})

app.get('/anon', function(_req, res) {
  res.send('anonymous mw handler')
})

app.get('/arrow', (_req, res) => {
  res.send('arrow fn mw handler')
})

function mw4(_req, _res, next) {
  next()
}

const handler = function(_req, res) {
  res.send('phew, that was a lot of hops')
}

app.get('/chained', function mw1(_req, _res, next) { next() }, function(_req, _res, next) { next() }, (_req, _res, next) => { next() }, mw4, handler)
