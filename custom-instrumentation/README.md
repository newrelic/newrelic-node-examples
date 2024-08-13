## Custom instrumentation

This folder contains example applications using the [Agent API](https://newrelic.github.io/node-newrelic/API.html) to do custom instrumentation.

* [instrument](./instrument) - example application that uses the [newrelic.instrument API](https://newrelic.github.io/node-newrelic/API.html#instrument) and associated [shim API](https://newrelic.github.io/node-newrelic/Shim.html) to instrument a toy queue library called Job Queue
* [instrumentDatastore](./instrument-datastore) - example application that uses the [newrelic.instrumentDatastore API](https://newrelic.github.io/node-newrelic/API.html#instrumentDatastore) and [datastore shim API](https://newrelic.github.io/node-newrelic/DatastoreShim.html) to instrument a toy datastore called Simple Datastore
* [instrumentMessages](./instrument-messages) - example application that uses the [newrelic.instrumentMessages API](https://newrelic.github.io/node-newrelic/API.html#instrumentMessages) and associated [messaging shim API](https://newrelic.github.io/node-newrelic/MessageShim.html) to instrument a toy messaging library called Nifty Messages
* [instrumentWebframework](./instrument-webframework) - example application that uses the [newrelic.instrumentWebframework API](https://newrelic.github.io/node-newrelic/API.html#instrumentWebframework) and associated [WebFramework shim API](https://newrelic.github.io/node-newrelic/WebFrameworkShim.html) to instrument a hypothetical web framework
* [attributesAndEvents](./attributes-and-events) - example application that demonstrates how to share custom [attributes](https://newrelic.github.io/node-newrelic/API.html#addCustomAttribute) and [events](https://newrelic.github.io/node-newrelic/API.html#recordCustomEvent)
* [backgroundTransactions](./background-transactions) - example application that uses the newrelic API to create [background transactions](https://newrelic.github.io/node-newrelic/API.html#startBackgroundTransaction)
* [segments](./segments) - example application that demonstrates how to use the [newrelic.startSegment API](https://newrelic.github.io/node-newrelic/API.html#startSegment) in a variety of cases: callback-based, promise-based, asyncronously, and syncronously
* [distributed tracing](./distributed-tracing/) - example application that demonstrates distributed tracing
