/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

// This is the file where we will instrument our example module.

const newrelic = require('newrelic')
const queuePath = require.resolve('./job-queue')

// Here we use newrelic.instrument to require our module 
// and call our instrumentation function.
newrelic.instrument({
    // The absolute path to the required module
    absolutePath: queuePath,
    // The module's name 
    moduleName: 'job-queue',
    // The function that will be called once the module is required
    onRequire: instrumentMyJobQueue,
    // The function that will be called if the instrumentation fails
    onError: function onError(err) {
        // Handle the error as needed
        console.error(err.message, err.stack)
        process.exit(1)
    }
})

// This is our custom instrumentation function. 
// The instrumentation will be relatively simple. We will use 
// shim.record to handle timing the queue and the work executed by it.
function instrumentMyJobQueue(shim, myModule, moduleName) {
    console.log(`[NEWRELIC] instrumenting ${moduleName}`)
    const proto = myModule.prototype;

    // shim.record takes in 3 arguments: the module prototype,
    // the name of the function to instrument,
    // and a RecorderFunction that returns a RecorderSpec
    shim.record(proto, 'scheduleJob', 
        function (shim, func, name, args) {
            // Get the name of the scheduled job
            const job = args[0];
            // Return a RecorderSpec that will name our segment
            return new shim.specs.RecorderSpec({
                name: `scheduleJob - ${job.name}`,
                callback: shim.LAST
            })
        }
    )
    shim.record(proto, 'runJobs', 
        function (shim, func, name, args) {
            return new shim.specs.RecorderSpec({
                name: 'runJobs',    
                callback: shim.LAST
            })
        }
    )
}