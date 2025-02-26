'use strict'

const { registerInstrumentations } = require('@opentelemetry/instrumentation')
const { AmqplibInstrumentation } = require('@opentelemetry/instrumentation-amqplib')

registerInstrumentations({
  instrumentations: [
    new AmqplibInstrumentation({}),
  ]
})
