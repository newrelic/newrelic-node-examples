## Custom Instrumentation

This folder contains example applications using the [Agent API](https://newrelic.github.io/node-newrelic/API.html) to do custom instrumentation.

* Instrument library code
  * [instrument](./instrument) - example application that uses the [newrelic.instrument API](https://newrelic.github.io/node-newrelic/API.html#instrument) and associated [shim API](https://newrelic.github.io/node-newrelic/Shim.html) to instrument a simple library
  * [instrumentDatastore](./instrument-datastore) - example application that uses the [newrelic.instrumentDatastore API](https://newrelic.github.io/node-newrelic/API.html#instrumentDatastore) and [datastore shim API](https://newrelic.github.io/node-newrelic/DatastoreShim.html) to instrument a toy datastore called Simple Datastore
  * [instrumentWebframework](./instrument-webframework) - example application that uses the [newrelic.instrumentWebframework API](https://newrelic.github.io/node-newrelic/API.html#instrumentWebframework) and associated [WebFramework shim API](https://newrelic.github.io/node-newrelic/WebFrameworkShim.html) to instrument a hypothetical web framework
  * [instrumentMessages](./instrument-messages) - example application that uses the [newrelic.instrumentMessages API](https://newrelic.github.io/node-newrelic/API.html#instrumentMessages) and associated [messaging shim API](https://newrelic.github.io/node-newrelic/MessageShim.html) to instrument a toy messaging library called Nifty Messages
* [Attributes, Events, and Metrics](./attributes-events-metrics) - example application that demonstrates how to create custom [attributes](https://newrelic.github.io/node-newrelic/API.html#addCustomAttribute), [events](https://newrelic.github.io/node-newrelic/API.html#recordCustomEvent), and [metrics](https://newrelic.github.io/node-newrelic/API.html#recordMetric).
* [Background Transactions](./background-transactions) - example application that uses the newrelic API to create [background transactions](https://newrelic.github.io/node-newrelic/API.html#startBackgroundTransaction)
* [Distributed tracing](./distributed-tracing/) - example application that demonstrates distributed tracing
* [Segments](./segments) - example application that demonstrates how to use the [newrelic.startSegment API](https://newrelic.github.io/node-newrelic/API.html#startSegment) in a variety of cases: callback-based, promise-based, asyncronously, and syncronously
* [Start Web Transaction](./start-web-transaction/) - example application that demonstrates how to use [newrelic.startWebTransaction](https://newrelic.github.io/node-newrelic/API.html#startWebTransaction).
* [URL Obfuscation](./url-obfuscation) - example application that demonstrates how to use [url_obfuscation rules](https://docs.newrelic.com/docs/apm/agents/nodejs-agent/installation-configuration/nodejs-agent-configuration/#url-obfuscation) to scrub PII from span names and attributes.

## Purpose of Instrumentation

Instrumentation for Node.js holds two purposes. The first is to give users detailed information about what happens on their server. The more things instrumented, the more detailed your dashboard graphs will be. The second purpose is to maintain the transaction context; this is done by the context manager and is explained in more detailed in the [instrument example app](./instrument).

### Adding Custom Instrumentation to the New Relic Agent

Calling `require('newrelic')` will return an API object, which contains the following methods for registering custom instrumentation:

* instrument
* instrumentDatastore
* instrumentWebframework
* instrumentMessages

These methods are used to tell the New Relic agent to use the provided instrumentation function when the specified module is loaded by Node. It is critically important that we register our instrumentation *before* the module is loaded anywhere. For example:

```js
var newrelic = require('newrelic')
newrelic.instrument('my-module', instrumentMyModule)
var myModule = require('my-module')
```

All four methods have the same signature. The difference between them is in what type of shim they provide when the instrumentation function is called. The `instrument` method provides only the base [shim](https://newrelic.github.io/node-newrelic/Shim.html), while `instrumentDatastore`, `instrumentWebframework`, and `instrumentMessages` provide shims specific to the type of instrumentation ([DatastoreShim](https://newrelic.github.io/node-newrelic/DatastoreShim.html), [WebFrameworkShim](https://newrelic.github.io/node-newrelic/WebFrameworkShim.html), and [MessageShim](https://newrelic.github.io/node-newrelic/MessageShim.html) respectively).

The `instrument` call could have also been written using named parameters like this:

```js
newrelic.instrument({
  moduleName: 'my-module',
  onRequire: instrumentMyModule
})
```

This call is equivalent to the first one, it just depends on your preferred style.

### Handling Errors

While debugging your instrumentation it can be useful to get a handle on any errors happening within it. Normally, the agent swallows errors and disables the instrumentation. In order to get the error for your debugging purposes you can provide a third argument to `instrument` that receives the error.

```js
newrelic.instrument({
  moduleName: 'my-module',
  onRequire: instrumentMyCustomModule,
  onError: function myErrorHandler(err) {
    // Uh oh! Our instrumentation failed, let's see why:
    console.error(err.message, err.stack)

    // Let's kill the application when debugging so we don't miss it.
    process.exit(1)
  }
})
```

### Questions?

We have an extensive [help site](https://support.newrelic.com/) as well as [documentation](https://docs.newrelic.com/). If you can't find your answers there, please drop us a line on the [community forum](https://discuss.newrelic.com/).
