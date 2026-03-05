'use strict'

// https://orpc.dev/docs/adapters/fastify

const Fastify = require('fastify')
const { RPCHandler } = require('@orpc/server/fastify')
const { onError } = require('@orpc/server')

const handler = new RPCHandler({ foo() {} }, {
  interceptors: [
    onError((error) => { console.error(error) })
  ]
})

const server = Fastify({ logger: true })
server.addContentTypeParser('*', (req, res, done) => {
  done(null, undefined)
})
server.all('/rpc/*', async (req, res) => {
  const { matched } = await handler.handle(req, res, {
    prefix: '/rpc',
    context: {}
  })

  if (!matched) {
    res.status(404).send('Not found')
  }
})

server.listen({ port: 3000 })

