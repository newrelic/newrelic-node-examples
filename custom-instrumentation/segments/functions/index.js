/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

const { someCbTask } = require('./callback.js')
const { somePromiseTask } = require('./promise.js')
const { someAsyncTask } = require('./async.js')
const { someSyncAssignTask } = require('./sync-assign.js')

module.exports = { someCbTask, somePromiseTask, someAsyncTask, someSyncAssignTask }
