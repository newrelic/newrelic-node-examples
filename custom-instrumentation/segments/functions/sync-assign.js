/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

// Supporting functions for sync-assign-based segment example
function mySyncTask() {
    // We'll stub out an aysnc task that as run as part of monitoring a segment.
    return 'sync assign segment'
}

function myNextTask(phrase) {
    // Then we stub out the task that handles that task's result,
    // to show how the result is passed throughthe segment handler.
    return `${phrase} completed!`
}

function someSyncAssignTask() {
    // This task will be run as its own segment within our transaction handler
    const result = mySyncTask()
    return myNextTask(result)
}

module.exports = { someSyncAssignTask };