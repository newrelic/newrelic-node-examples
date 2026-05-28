/*
 * Copyright 2023 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const http = require('node:http')
const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const cors = require('@koa/cors')
const { ApolloServer } = require('@apollo/server')
const { ApolloServerPluginDrainHttpServer: drain } = require('@apollo/server/plugin/drainHttpServer')
const { koaMiddleware } = require('@as-integrations/koa')

const getContext = require('./context')
const resolvers = require('./resolvers')
const typeDefs = require('./schema')
const { initData } = require('./datastore')

async function main() {
  const app = new Koa()
  const httpServer = http.createServer(app.callback())

  // As of newrelic@14.0.0, Apollo Server is instrumented automatically by the
  // agent — no explicit plugin registration is needed.
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [drain({ httpServer })]
  })
  await server.start()
  await initData()

  app.use(cors())
  app.use(bodyParser())
  app.use(
    koaMiddleware(server, {
      context: async ({ ctx }) => { return { token: ctx.headers.token, ...getContext() } }
    })
  )
  await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve))
  console.log('🚀 Server ready at http://localhost:4000')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
