# Mock Infinite Tracing gRPC Server

This is a gRPC server used to test our [infinite tracing](https://docs.newrelic.com/docs/distributed-tracing/infinite-tracing/introduction-infinite-tracing/) with the Node.js agent.


## Setup

To setup gRPC, run

```sh
npm install
node index.js
```

## Test

Once the gPRC server is started, you can use it in an example application and set the following in `newrelic.js`


```js
exports.config = {
  license_key: <your-license-key>,
  infinite_tracing: {
    trace_observer: {
      host: 'localhost:50051
    }
  }
}
```

As you use the application the mock gPRC server will log to console the number of spans seen.
