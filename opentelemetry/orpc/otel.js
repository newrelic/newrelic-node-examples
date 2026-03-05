'use strict'

const { registerInstrumentations } = require('@opentelemetry/instrumentation')
const { ORPCInstrumentation } = require('@orpc/otel')

registerInstrumentations({
  instrumentations: [
    new ORPCInstrumentation()
  ]
})

