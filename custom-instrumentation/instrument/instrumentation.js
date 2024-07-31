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
    onRequire: function onRequire(shim, jobQueue) {
        console.log(`[NEWRELIC] instrumenting job-queue module`)

        console.log(`[NEWRELIC] instrumenting method 'scheduleJob'`)
        shim.record(
            jobQueue.prototype,
            'scheduleJob',
            function wrapJob(shim, original) {
                return function wrappedScheduleJob(job) {
                    return original.call(this, shim.bindSegment(job)) 
                }
            }
        )

        console.log(`[NEWRELIC] instrumenting method 'runJobs'`)
        shim.record(
            jobQueue.prototype,
            'runJobs',
            function wrapJob(shim, original) {
                return function wrappedRunJobs() {
                    return original.apply(this, shim.bindSegment())
                }
            }
        )
    },
    // The function that will be called if the instrumentation fails
    onError: function onError(err) {
        // Uh oh! Our instrumentation failed, lets see why:
        console.error(err.message, err.stack)

        // Let's kill the application when debugging so we don't miss it.
        process.exit(-1)
    }
})