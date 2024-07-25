/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const newrelic = require('newrelic')
const queuePath = require.resolve('./job-queue')

newrelic.instrument({
    absolutePath: queuePath,
    moduleName: 'job-queue',
    onRequire: function onRequire(shim, jobQueue) {
        console.log(`[NEWRELIC] instrumenting 'job-module'`)

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
    },
    onError: function onError(err) {
        // Uh oh! Our instrumentation failed, lets see why:
        console.error(err.message, err.stack)

        // Let's kill the application when debugging so we don't miss it.
        process.exit(-1)
    }
})