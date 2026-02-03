/*
 * Copyright 2026 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

const fastify = require('fastify')({ logger: true })
const { PORT: port = 3000, HOST: host = '127.0.0.1' } = process.env
const model = require('./model')
const mongoose = require('mongoose')
const { CONN_STRING } = require('./constants')

fastify.listen({ host, port }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})

fastify.get('/mongoose', async (request, reply) => {
  await mongoose.connect(CONN_STRING)
  const data = await model.find({})
  const names = data.map((datum) => `${datum.author} ${datum.title}`)
  return reply.send({ names })
})
