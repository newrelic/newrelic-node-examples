# Sample ESM Application
This application demonstrates using the agent to instrument both New Relic built-instrumentation and custom ESM instrumentation.  It is done by using the `newrelic/esm-loader.mjs` via `--experimental-loader` flag to node.

## Getting started
**Note**: You must be running Node >=v16.2.0.

 1. Clone or fork this repository.

 1. Install dependencies and run application

```sh
npm ci
PORT=3000 NEW_RELIC_LICENSE_KEY=<Your New Relic License Key> npm start
```

 1. Make requests to application.

```sh
curl http://localhost:3000
curl http://localhost:3000/instrumentation-example
curl http://localhost:3000/user/100
```

 1. Navigate to [New Relic One](https://one.newrelic.com) > APM > ESM Example App > Monitor > Distributed Tracing.
![DT view](./images/dt-view.png?raw=true "DT view")

 1. Click a trace and you can see the express instrumentation recording relevant spans.
![Detailed trace](./images/dt-details.png?raw=true "Detailed Trace")


## Additional Configuration
If you are a New Relic employee and wanting to testing on a staging environment, add the following to the `npm start` command:

```sh
NEW_RELIC_HOST=staging-collector.newrelic.com
```
