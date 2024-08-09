/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

// For a datastore, there are only two types of things to record: operations and queries.
class SimpleDatastore {
  constructor () {
    this.client = null
    this.connected = false
  }

  // These are our datastore operation methods
  connect () {
    this.connected = true
    console.log('Connected to simple-datastore')
  }

  close () {
    this.connected = false
    console.log('Closed connection to simple-datastore')
  }

  // These are our datastore query methods
  execute (query) {
    return new Promise((resolve, reject) => {
      if (!this.connected) {
        return reject(Error('Not connected'))
      }
      // Here we will simulate executing a query
      // by logging and returning a result.
      console.log(query)
      const result = { attribute: 'value' }
      resolve(result)
    })
  }

  batch (queries) {
    return new Promise((resolve, reject) => {
      if (!this.connected) {
        return reject(Error('Not connected'))
      }
      const results = []
      for (const query of queries) {
        // Simulate waiting for each query to execute
        console.log(query)
        const result = { attribute: 'value' }
        results.push(result)
      }
      resolve(results)
    })
  }
}

module.exports = SimpleDatastore 
