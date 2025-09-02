/*
 * Copyright 2025 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

const { app } = require('@azure/functions')

// An HTTP trigger using the `post` method
app.post('HttpPost', {
  authLevel: 'anonymous',
  handler: async (request, context) => {
    context.log(`Http function processed request for url "${request.url}"`)

    const name = request.query.get('name') || await request.text() || 'world'

    return { body: `Hello, ${name}! This is a POST response` }
  }
})
