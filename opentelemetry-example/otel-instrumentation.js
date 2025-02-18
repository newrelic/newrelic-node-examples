'use strict'

const { registerInstrumentations } = require('@opentelemetry/instrumentation')
const { KnexInstrumentation } = require('@opentelemetry/instrumentation-knex')
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http')
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express')
const { FetchInstrumentation } = require('@opentelemetry/instrumentation-fetch')
registerInstrumentations({
  instrumentations: [
    new KnexInstrumentation(),
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
    new FetchInstrumentation()
  ]
})
