/*
 * Copyright 2025 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const { registerInstrumentations } = require('@opentelemetry/instrumentation')
const { KnexInstrumentation } = require('@opentelemetry/instrumentation-knex')
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http')
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express')
const { UndiciInstrumentation } = require('@opentelemetry/instrumentation-undici')

registerInstrumentations({
  instrumentations: [
    new KnexInstrumentation(),
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
    new UndiciInstrumentation()
  ]
})
