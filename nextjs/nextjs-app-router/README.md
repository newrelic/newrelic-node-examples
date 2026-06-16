This is an example of an instrumented Next.js app using
[App Router](https://nextjs.org/docs).

## Overview

This example application shows integration between New Relic Node.js agent using the [hybrid agent feature](https://docs.newrelic.com/docs/apm/agents/manage-apm-agents/opentelemetry-api-support/) to intercept native Next.js opentelemetry spans to synthesize necessary telemetry for New Relic. 

A few source files to pay particular attention to:

+ [next.config.js](./next.config.js): shows configuration necessary to get New Relic Node.js agent loading in Vercel.
+ [newrelic.js](./newrelic.js): shows how to enable hybrid agent instrumentation and disable native New Relic Node.js agent instrumentation. 
+ [app/layout.js](app/layout.js): shows how to enable the New Relic browser agent.

## Setup

 1. Copy [.env.sample](./.env.sample) to `.env`.
 1. Edit `.env` to add your New Relic app name and license key
 1. Build the application: `npm run build`
 1. Start the application: `npm start`.
 1. Make requests `./scripts/smoke-test.sh`
 1. After a few minutes view your [APM Entity's telemetry](https://one.newrelic.com/)

## Vercel setup 

Deploying to Vercel splits static and dynamic pages into different environments. Instead of relying on `.env` and `newrelic.js` to load agent configuration, you must define a few [environment variables](https://vercel.com/docs/environment-variables). Navigate to Vercel console > Environment Variables.

To enable hybrid agent and disable native New Relic instrumentation for conflicting libraries:

 * `NEW_RELIC_OPENTELEMETRY_ENABLED=true`
 * `NEW_RELIC_INSTRUMENTATION_NEXT_ENABLED=false`
 * `NEW_RELIC_INSTRUMENTATION_HTTP_ENABLED=false`
 * `NEW_RELIC_INSTRUMENTATION_UNDICI_ENABLED=false`

Specify the application name and license key to allow New Relic Node.js agent to send telemetry to New Relic platform:

 * `NEW_RELIC_APP_NAME=<your app name>`
 * `NEW_RELIC_LICENSE_KEY=<your ingest key>`

To see agent logs in the Vercel console:

 * `NEW_RELIC_LOG=stdout`
 * `NEW_RELIC_LOG_LEVEL=info|error|warn|debug|trace`(depending on which level you want to see New Relic Node.js agent logs)

Make requests to application:

```sh
BASE_URL=<your vercel domain> ./scripts/smoke-test.sh
```
 
After a few minutes view your [APM Entity's telemetry](https://one.newrelic.com/)

**Note**: Due to how code is split and executed, transaction names will vary when comparing against a Next.js app deployed to a server. This is because the native Next.js opentelemetry spans never emit `http.route` which is used by the New Relic Node.js agent for more complete route based transaction naming.

