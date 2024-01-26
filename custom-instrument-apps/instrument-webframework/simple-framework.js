/*
 * Copyright 2022 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const http = require('http')
const url = require('url')
const fs = require('fs');
const path = require('path');

class SimpleFramework {
  constructor() {
    this.routes = []
    this.middleware = []
  }

  all(middlewareFunction) {
    this.middleware.push(middlewareFunction)
  }

  get(path, handler) {
    this.routes.push({ method: 'GET', path, handler })
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

  render(viewName, callback) {
    const viewPath = path.join(__dirname, 'lib', 'views', `${viewName}.html`);
  
    fs.readFile(viewPath, 'utf8', (err, data) => {
      if (err) {
        return callback(err, null);
      }
  
      callback(null, data);
    });
  }
}

module.exports = { SimpleFramework }
