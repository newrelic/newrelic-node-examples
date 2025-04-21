'use strict';

const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { GraphQLInstrumentation } = require('@opentelemetry/instrumentation-graphql');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');

registerInstrumentations({
  instrumentations: [
    new GraphQLInstrumentation({
      // allowAttributes: true,
      // depth: 2,
      // mergeItems: true,
    }),
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
  ],
});
