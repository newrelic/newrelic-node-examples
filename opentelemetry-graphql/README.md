# OpenTelemetry Bridge GraphQL Instrumentation Example

## Example Application

This example shows how to use 2 popular graphql servers

- [Apollo GraphQL](https://www.npmjs.com/package/apollo-server)
- [GraphQL HTTP Server Middleware](https://www.npmjs.com/package/express-graphql)

and the New Relic Node agent's OpenTelemetry bridge to instrument a simple Node.js application.

This instrumentation should work with any graphql server as it instruments graphql directly.

Adapted from [opentelemetry-js-contrib](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/examples/graphql).

### Installation

```shell
# from this directory
npm install
```

### Run the Application

1. Run docker

   ```shell
   # from this directory
   npm run docker:start
   ```
2. Run server - depends on your preference

   ```shell
   # from this directory
   cp env.sample .env
   # fill out New Relic license key
   npm run server:express
   // or
   npm run server:apollo
   ```
3. Open page at [http://localhost:9411/zipkin/](http://localhost:9411/zipkin/) -  you should be able to see the spans in zipkin
4. Run example client

   ```shell
   # from this directory
   npm run client
   ```
5. You can also write your own queries, open page `http://localhost:4000/graphql`
6. You can also test a `graphql-transform-federation`

   ```shell
   # from this directory
   npm run server:federation
   npm run client:federation
   ```

## Instrumenting your GraphQL App

If you already have a GraphQL application that you would like to instrument with our agent's OpenTelemetry bridge, here are the steps that you need to do:

1. Install `newrelic` normally. Please refer to our [installation docs](https://docs.newrelic.com/docs/apm/agents/nodejs-agent/installation-configuration/install-nodejs-agent/) if you need help.
2. In your `newrelic.js` file, set the `opentelemetry_bridge` flag to `true` inside `exports.config`:

   ```javascript
   exports.config = {
        // ...
        feature_flag: {
            opentelemetry_bridge: true
        },
        // ...
   }
   ```
3. Create a `otel-instrumentation.js` file in the same directory as `newrelic.js`. The minimum required file for GraphQL instrumentation is shown below. See [`./otel-instrumentation.js`](./otel-instrumentation.js) for a more fleshed out example.

   ```javascript
   'use strict'

   const { registerInstrumentations } = require('@opentelemetry/instrumentation')
   const { GraphQLInstrumentation } = require('@opentelemetry/instrumentation-graphql')
   // require any other OTel instrumentations

   registerInstrumentations({
     instrumentations: [
       new GraphQLInstrumentation({ }),
       // include any other instrumentations
     ],
   })
   ```
4. In your `package.json`, include `-r newrelic -r ./otel-instrumentation.js` (assuming `otel-instrumentation.js` and `package.json` are in the same directory) in your application start script.

   ```json
   // Example package.json 
   "scripts" : {
       "myapp:start": "node -r newrelic -r ./otel-instrumentation.js ./myapp.js
   }
   ```
