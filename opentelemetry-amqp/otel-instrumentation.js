'use strict'

const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { registerInstrumentations } = require('@opentelemetry/instrumentation')
const { AmqplibInstrumentation } = require('@opentelemetry/instrumentation-amqplib')

const provider = new NodeTracerProvider();
provider.register();

registerInstrumentations({
  instrumentations: [
    new AmqplibInstrumentation({}),
  ]
})
