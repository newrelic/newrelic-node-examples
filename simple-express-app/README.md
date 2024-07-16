# Express example

This example application uses [express](https://github.com/expressjs/express) and has 2 endpoints to demonstrate telemetry produced by Node.js agent with express and AWS SNS.

## Setup

 1. Run `npm install`
 1. Start application with `NEW_RELIC_LICENSE_KEY=<your-key> node index.js`


## Test

Once the application is started you can make requests to the 2 endpoints to see the telemetry it generates.


```sh
curl http://localhost:3000/named-route
curl http://localhost:3000/sns
```
