/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

// This is the file where we will instrument our datastore.

const newrelic = require('newrelic')
const datastorePath = require.resolve('./simple-datastore')

newrelic.instrumentDatastore({
  // The path to our datastore module
  absolutePath: datastorePath,
  // The name of the datastore module
  moduleName: 'simple-datastore',
  // The function that will instrument the datastore
  // if it is successfully required.
  onRequire: instrumentSimpleDatastore,
  // The function that will be called if there is
  // an error with the instrumentation.
  onError: function myErrorHandler(err) {
    console.error(err.message, err.stack)
    process.exit(1)
  },
})

// This is our custom instrumentation function.
function instrumentSimpleDatastore(shim, SimpleDatastore, moduleName) {
  console.log(`[NEWRELIC] instrumenting ${moduleName}`)
  const proto = SimpleDatastore.prototype

  // Here we simply tell the shim the name of our datastore.
  // In our case we're passing in a string for our custom datastore,
  // but we could have passed one of the predefined datastore names,
  // which can be found in DatastoreShim.DATASTORE_NAMES.
  shim.setDatastore(moduleName)

  // Because our datastore is SQL-like (not NoSQL), we
  // will use the recordQuery and recordBatchQuery functions,
  // instead of recordOperation. You may use recordOperation
  // to instrument methods like connect and close, but we
  // won't for this example.

  // shim.recordQuery takes in 3 arguments: the module prototype,
  // the name of the function to instrument, and a QuerySpecFunction
  // that returns a QuerySpec.
  shim.recordQuery(proto, 'execute', function (shim, fn, name, args) {
    // The QuerySpec requires that we identify a query
    // argument. Since our datastore uses a SQL-like language, 
    // we can use the DatastoreShim's default query parser to pull  
    // the information it needs out of the query. We also need to
    // set promise to true because our execute method returns a promise.
    // Finally, we need to pass in the datastore parameters.
    return new shim.specs.QuerySpec({
      name: 'query',
      query: shim.FIRST,
      promise: true,
      parameters: getInstanceParameters(shim, this)
    })
  }
  )

  // shim.recordBatchQuery takes in 3 arguments: the module prototype,
  // the name of the function to instrument, and a QuerySpecFunction
  // that returns a QuerySpec.
  shim.recordBatchQuery(proto, 'batch', function (shim, fn, name, args) {
    // Recording batches of queries is just like recording a single one, 
    // except we need to do a little more work to pull out the query text. 
    // This time we pass in a function for the spec's query parameter, 
    // findBatchQueryArg.
    return new shim.specs.QuerySpec({
      name: 'batch',
      query: findBatchQueryArg,
      promise: true,
      parameters: getInstanceParameters(shim, this)
    })
  }
  )
}

// This function is a QueryFunction callback, which takes
// in the current shim, the function we're getting the query from, 
// that function's name, and an Array of arguments. For batch, 
// the first argument is either an array of strings or an array of 
// objects that contain query strings. We want to be very defensive 
// when writing instrumentation, so we will default the query to an 
// empty string if no query was extractable.
function findBatchQueryArg(shim, name, func, args) {
  const sql = (args[0] && args[0][0]) || ''
  return sql.query || sql
}

// This function gets the datastore parameters.
// This is required for your datastore to 
// properly show up in the UI and for transactions
// to have the correct tags.
function getInstanceParameters(shim, datastore) {
  return new shim.specs.params.DatastoreParameters({
    host: datastore.host || null,
    port_path_or_id: datastore.port || null,
    database_name: datastore.database || null
  })
}