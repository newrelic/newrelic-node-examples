/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const newrelic = require('newrelic')
const Queue = require('./job-queue')

function exampleJob() {
    // Do whatever work you want here - this is just a placeholder
    return 'job done';
}

function cbJob(cb) {
    const result = exampleJob();
    return cb('Callback ' + result);
}

async function promiseJob() {
    return new Promise((resolve, reject) => {
        try {
            const result = exampleJob()
            resolve('Promise ' + result)
        }
        catch (error) {
            reject(error)
        }
    })
}

function main(){
    const queue = new Queue()
    newrelic.startBackgroundTransaction('firstTransaction', function first() {
        const transaction = newrelic.getTransaction()
        queue.scheduleJob(async function firstJob() {
            // Do some work - for example, this waits for a promise job to complete
            const result = await promiseJob()
            console.log(result)
            transaction.end()
        })
    })
    
    newrelic.startBackgroundTransaction('secondTransaction', function second() {
        const transaction = newrelic.getTransaction()
        queue.scheduleJob(function secondJob() {
            // Do some work - for example, this waits for a callback job to complete
            cbJob(function cb(result) {
                console.log(result)
                // Transaction state will be lost here because 'firstTransaction' will have
                // already ended the transaction
                transaction.end()
            })
        })
    })
}

main()