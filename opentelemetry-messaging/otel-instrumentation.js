/*
 * Copyright 2025 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const { registerInstrumentations } = require('@opentelemetry/instrumentation')
const { AmqplibInstrumentation } = require('@opentelemetry/instrumentation-amqplib')

registerInstrumentations({
  instrumentations: [
    new AmqplibInstrumentation({}),
  ]
})
