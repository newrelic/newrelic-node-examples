/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

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

function instrumentSimpleDatastore(shim, SimpleDatastore, moduleName) {
  console.log(`[NEWRELIC] instrumenting ${moduleName}`)
  const proto = SimpleDatastore.prototype

  // This is required to set the datastore name in the transaction trace
  shim.setDatastore(moduleName)

  // These functions instrument our queries.
  shim.recordQuery(proto, 'execute', function (shim, fn, name, args) {
    return new shim.specs.QuerySpec({
      name: 'query',
      query: shim.FIRST,
      promise: true,
      parameters: getInstanceParameters(shim, this)
    })
  }
  )

  shim.recordBatchQuery(proto, 'batch', function (shim, fn, name, args) {
    return new shim.specs.QuerySpec({
      name: 'batch',
      query: findBatchQueryArg,
      promise: true,
      parameters: getInstanceParameters(shim, this)
    })
  }
  )
}

// This is a QueryFunction that returns a query of type string.
function findBatchQueryArg(shim, name, func, args) {
  const sql = (args[0] && args[0][0]) || ''
  return sql.query || sql
}

// This gets the datastore parameters.
function getInstanceParameters(shim, client) {
  return new shim.specs.params.DatastoreParameters({
    host: client.host || null,
    port_path_or_id: client.port || null,
    database_name: client.database || null
  })
}