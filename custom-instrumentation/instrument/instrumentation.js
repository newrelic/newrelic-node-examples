/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const newrelic = require('newrelic')
const queuePath = require.resolve('./job-queue')

newrelic.instrument({
    // The absolute path to the required module
    absolutePath: queuePath,
    // The module's name 
    moduleName: 'job-queue',
    // The function that will be called once the module is required
    onRequire: instrumentMyJobQueue,
    // The function that will be called if the instrumentation fails
    onError: function onError(err) {
        // Uh oh! Our instrumentation failed, let's see why:
        console.error(err.message, err.stack)

        // Let's kill the application when debugging so we don't miss it.
        process.exit(-1)
    }
})

function instrumentMyJobQueue(shim, myModule, moduleName) {
    console.log(`[NEWRELIC] instrumenting ${moduleName}`)

    const proto = myModule.prototype;

    shim.record(proto, 'scheduleJob', 
        // This is a RecorderFunction that returns a RecorderSpecParams object
        function (shim, func, name, args) {
            const job = args[0];
            return {
                name: `scheduleJob - ${job.name}`,
                callback: shim.LAST
            }
        }
    )
    shim.record(proto, 'runJobs', 
        function (shim, func, name, args) {
            return {
                name: 'runJobs',    
                callback: shim.LAST
            }
        }
    )
}