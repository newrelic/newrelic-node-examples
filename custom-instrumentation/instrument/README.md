# Example job queue app with instrumentation

This example application shows you how to use the [newrelic.instrument() ](https://newrelic.github.io/node-newrelic/API.html#instrument)and associated [shim](https://newrelic.github.io/node-newrelic/Shim.html) API. It instruments a simple module, a rudimentary job queue, and runs a series of basic jobs.

## Getting Started

1. Clone or fork this repository.
2. Navigate to this example's sub directory
   ```
   cd newrelic-node-examples/custom-instrumentation/instrument
   ```
3. Install dependencies and run application.
   ```
   npm install
   cp env.sample .env
   # Fill out `NEW_RELIC_LICENSE_KEY` in .env and save 
   # Start the application
   npm start
   ```
