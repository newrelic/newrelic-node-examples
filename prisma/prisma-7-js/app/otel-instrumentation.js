'use strict'

const {registerInstrumentations} = require('@opentelemetry/instrumentation')
const { PrismaInstrumentation } = require('@prisma/instrumentation')

registerInstrumentations({
  instrumentations: [
    new PrismaInstrumentation()
  ]
})
