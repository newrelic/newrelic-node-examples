/*
 * Copyright 2026 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

// Deployed via `serverless.yml`. The New Relic layer wraps this handler, so
// there is no need to require the agent here.
const metrics = require('./lib/metrics.js')

module.exports.handler = async function helloWorld(event, context) {
  metrics.integers.add(1)

  console.log('Hello world!')
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Hello world!',
      requestId: context.awsRequestId,
      receivedEvent: event
    })
  }
}
