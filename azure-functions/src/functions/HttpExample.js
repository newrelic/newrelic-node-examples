/*
 * Copyright 2025 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

const { app } = require('@azure/functions')

// HTTP trigger handling multiple methods
app.http('HttpExample', {
  methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    let name
    switch (request.method) {
      case 'GET':
        name = request.query.get('name')
        break
      case 'POST':
      case 'PUT':
      case 'PATCH':
        const input = await request.text()
        name = JSON.parse(input).name
        break
      case 'DELETE':
        name = request.query.get('name')
    }
    context.log(`http function processed request for url "${request.url}"`)

    if (!name) { name = 'World' }

    return { body: `Hello, ${name}! You sent a ${request.method} request.` }
  }
})
