/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

const { someCbTask } = require('./functions/callback.js')
const { somePromiseTask } = require('./functions/promise.js')
const { someAsyncTask } = require('./functions/async.js')
const { someSyncAssignTask } = require('./functions/sync-assign.js')

module.exports =  { someCbTask, somePromiseTask, someAsyncTask, someSyncAssignTask };