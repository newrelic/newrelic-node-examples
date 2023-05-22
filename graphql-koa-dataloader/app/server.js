/*
 * Copyright 2023 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import http from 'http'
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import cors from '@koa/cors'
import { ApolloServer } from '@apollo/server'
import { ApolloServerPluginDrainHttpServer as drain } from '@apollo/server/plugin/drainHttpServer'
import { koaMiddleware } from '@as-integrations/koa'
import createNewRelicPlugin from '@newrelic/apollo-server-plugin'

import getContext from './context.js'
import resolvers from './resolvers.js'
import typeDefs from './schema.js'
import { initData } from './datastore.js'

const app = new Koa()
const httpServer = http.createServer(app.callback())

// Set up Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [drain({ httpServer }), createNewRelicPlugin({})]
})
await server.start()
await initData()

app.use(cors())
app.use(bodyParser())
app.use(
  koaMiddleware(server, {
    context: async ({ ctx }) => ({ token: ctx.headers.token, ...getContext() })
  })
)
await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve))
console.log(`🚀 Server ready at http://localhost:4000`)
