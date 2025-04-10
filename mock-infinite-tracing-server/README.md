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
      host: 'localhost',
      port: 50051
    }
  }
}
```

As you use the application the mock gPRC server will log to console the number of spans seen.

**Note**: You have to swap out the credentials in agent with insecure creds [here](https://github.com/newrelic/node-newrelic/blob/main/lib/grpc/connection.js#L380)


## Testing errors
You can have the mock server respond with an error every n calls.  The agent has client retries built in and this can verify it is working. Below is an example that fails every 10th call:

```sh
NR_FAILS=true NR_FAIL_N_CALLS=10 node index.js
```
