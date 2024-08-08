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
  onError: function myErrorHandler (err) {
    console.error(err.message, err.stack)
    process.exit(1)
  },
})

function instrumentSimpleDatastore (shim, datastore, moduleName) {
  console.log(`[NEWRELIC] instrumenting ${moduleName}`)
  const proto = datastore.SimpleDatastore.prototype

  // This is required to set the datastore name in the transaction trace
  shim.setDatastore(moduleName)

  // This function instruments our datastore operations.
  // You may provide a OperationSpec or SegmentFunction for the opSpec.
  // We chose SegmentFunction here because we want to know the name of the operation.
  shim.recordOperation(proto, ['connect', 'close'], function (shim, fn, name, args) {
    return {
      name,
      callback: shim.LAST,
    }
  })

  // These functions instrument our queries.
  shim.recordQuery(proto, 'execute', {
    name: 'query',
    query: shim.FIRST,
    callback: shim.LAST,
  })
  shim.recordBatchQuery(proto, 'batch', {
    name: 'batch',
    query: findBatchQueryArg,
    callback: shim.LAST,
  })
}

// This is a QueryFunction that returns a query of type string.
function findBatchQueryArg (shim, name, func, args) {
  const sql = (args[0] && args[0][0]) || ''
  return sql.query || sql
}
