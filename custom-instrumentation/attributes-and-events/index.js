/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'
const newrelic = require('newrelic')
const fastify = require('fastify')({ logger: true })
const { PORT: port = 3000, HOST: host = '127.0.0.1' } = process.env

//Define routes for each type of transaction and event
fastify.post('/custom-attribute', async (request, reply) => {
    newrelic.addCustomAttribute('hello', 'world');
    reply.send({ status: 'Custom attribute recorded' });
});

fastify.post('/custom-attributes', async (request, reply) => {
    newrelic.addCustomAttributes({ hello: 'world' });
    reply.send({ status: 'Custom attributes recorded' });
});

fastify.post('/custom-span-attribute', async (request, reply) => {
    newrelic.addCustomSpanAttribute('hello', 'world');
    reply.send({ status: 'Custom span attribute recorded' });
});

fastify.post('/custom-span-attributes', async (request, reply) => {
    newrelic.addCustomSpanAttributes({ hello: 'world' });
    reply.send({ status: 'Custom span attributes recorded' });
});

fastify.post('/custom-event', async (request, reply) => {
    newrelic.recordCustomEvent('my_app:my_event', {
        custom: 'properties',
        n: 1,
        ok: true
    });
    reply.send({ status: 'Custom event recorded' });
});

//Start the server
const start = async () => {
    try {
        await fastify.listen({ port: port, host: host });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();