'use strict'

const { registerInstrumentations } = require('@opentelemetry/instrumentation')
const { GraphQLInstrumentation } = require('@opentelemetry/instrumentation-graphql')

registerInstrumentations({
  instrumentations: [
    new GraphQLInstrumentation({
      // allowAttributes: true,
      // depth: 2,
      // mergeItems: true,
    })
  ],
})
