## Application Logging 

This folder contains example applications interacting with various logging libraries that provide [logs in context](https://docs.newrelic.com/docs/logs/logs-context/configure-logs-context-nodejs/)

 * [ESM logs in context](./esm-logs-in-context) - An [ESM](https://nodejs.org/api/esm.html) application that uses winston to create logs.
 * [Log generator](./log-generator) - An application used to produce logs with either winston or pino.
 * [Log enrichers](./legacy-logs-in-context) - **deprecated** - An application that uses deprecated log enrichers for pino and winston.
