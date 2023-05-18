/*
 * Copyright 2023 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as dynamodb from './datastore-dynamodb.js'
import * as mongo from './datastore-mongo.js'

async function initData() {
  if (process.env.NEW_RELIC_DATASTORE?.toLowerCase() === 'dynamodb') {
    return await dynamodb.initData()
  }
  if (process.env.NEW_RELIC_DATASTORE?.toLowerCase() === 'mongo') {
    return await mongo.initData()
  }
  throw new Error(
    'Unknown datastore. Set the "NEW_RELIC_DATASTORE" environment variable to either "DynamoDB" or "Mongo"'
  )
}

async function getUserById(id) {
  if (process.env.NEW_RELIC_DATASTORE?.toLowerCase() === 'dynamodb') {
    return await dynamodb.getUserById(id)
  }
  if (process.env.NEW_RELIC_DATASTORE?.toLowerCase() === 'mongo') {
    return await mongo.getUserById(id)
  }
  throw new Error(
    'Unknown datastore. Set the "NEW_RELIC_DATASTORE" environment variable to either "DynamoDB" or "Mongo"'
  )
}

export { getUserById, initData }
