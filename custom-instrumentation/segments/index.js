/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'
const newrelic = require('newrelic')
const fastify = require('fastify')({ logger: true })
const { PORT: port = 3000, HOST: host = '127.0.0.1' } = process.env
const { someCbTask, somePromiseTask, someAsyncTask, someSyncAssignTask } = require('./functions.js')

// Define routes for each segment event
fastify.post('/callback-segment', (request, reply) => {
    // `startSegment()` takes a segment name, a boolean if a metric should be
    // created for this segment, the handler function, and an optional callback.
    // The handler is the function that will be wrapped with the new segment. When
    // a callback is provided, the segment timing will end when the callback is
    // called.
    newrelic.startSegment('myCallbackSegment', false, someCbTask, function cb(err, output) {
        // Handle the error and output as appropriate.
        reply.send({ status: output })
    })
});

fastify.post('/promise-segment', (request, reply) => {
    // `startSegment()` takes a segment name, a boolean if a metric should be
    // created for this segment, the handler function, and an optional callback.
    // The handler is the function that will be wrapped with the new segment. If
    // a promise is returned from the handler, the segment's ending will be tied
    // to that promise resolving or rejecting.
    return newrelic.startSegment('myPromiseSegment', false, somePromiseTask).then(function thenAfter(output) {
        return reply.send({ status: output })
    })
});

fastify.post('/async-segment', async (request, reply) => {
    // `startSegment()` takes a segment name, a boolean if a metric should be
    // created for this segment, the handler function, and an optional callback.
    // The handler is the function that will be wrapped with the new segment.
    // Since `async` functions just return a promise, they are covered just the
    // same as the promise example.
    const result = await newrelic.startSegment('myAsyncSegment', false, someAsyncTask)
    return reply.send({ status: result });
});

fastify.post('/sync-assign-segment', (request, reply) => {
    // `startSegment()` takes a segment name, a boolean if a metric should be
    // created for this segment, the handler function, and an optional callback.
    // The handler is the function that will be wrapped with the new segment.
    const result = newrelic.startSegment('mySyncAssignSegment', false, function timedFunction() {
        return someSyncAssignTask()
    })
    reply.send({ status: result });
});

// Start the server
const start = async () => {
    try {
        await fastify.listen({ port: port, host: host });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();