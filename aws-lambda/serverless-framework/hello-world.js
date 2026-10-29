/*
 * Copyright 2026 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

// Deployed via `serverless.yml`. The New Relic layer wraps this handler, so
// there is no need to require the agent here.
// `@opentelemetry/api` is provided by the New Relic layer at runtime
// eslint-disable-next-line n/no-unpublished-require
const otel = require('@opentelemetry/api')

// The agent registers its OpenTelemetry meter provider before this module is
// loaded, so the counter is reported to New Relic with each invocation.
const counter = otel.metrics.getMeter('lambda-meter').createCounter('integers')

module.exports.handler = async function helloWorld(event, context) {
  counter.add(1)

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
