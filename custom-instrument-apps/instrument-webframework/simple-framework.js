/*
 * Copyright 2022 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const http = require('http')
const url = require('url')

class SimpleFramework {
  constructor() {
    this.routes = []
    this.middleware = []
  }

  use(middlewareFunction) {
    this.middleware.push(middlewareFunction)
  }

  get(path, handler) {
    this.routes.push({ method: 'GET', path, handler })
  }

  post(path, handler) {
    this.routes.push({ method: 'POST', path, handler })
  }

  handleRequest(req, res) {
    const { pathname } = url.parse(req.url, true)

    this.middleware.forEach((middleware) => {
      middleware(req, res)
    })

    const route = this.routes.find(
      (route) => route.method === req.method && route.path === pathname
    )

    if (route) {
      route.handler(req, res)
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('Not Found')
    }
  }

  start(port) {
    const server = http.createServer((req, res) => {
      this.handleRequest(req, res)
    })

    server.listen(port, () => {
      console.log(`Server listening on port ${port}`)
    })
  }
}

module.exports = { SimpleFramework }
