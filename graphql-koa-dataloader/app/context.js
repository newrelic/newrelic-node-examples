/*
 * Copyright 2023 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const DataLoader = require('dataloader')
const { getUserById } = require('./datastore')

const loaders = () => {
  return {
    getUserById: new DataLoader(
      (ids) => Promise.all(ids.map((id) => getUserById(Number(id)))),
      {
        batchScheduleFn: (callback) => setTimeout(callback, 100)
      }
    )
  }
}

const getContext = () => {
  return {
    loaders: loaders()
  }
}

module.exports = getContext
