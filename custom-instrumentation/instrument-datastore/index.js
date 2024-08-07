/*
 * Copyright 2024 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const { SimpleDatastore } = require('./simple-datastore')
const newrelic = require('newrelic')
const fastify = require('fastify')({ logger: true })
const EventEmitter = require('events')

const datastore = new SimpleDatastore()
const { PORT: port = 3000, HOST: host = '127.0.0.1' } = process.env
const shutdownEmitter = new EventEmitter()

// We will be using the fastify web framework to host the
// datastore, but any host (Docker, web framework, etc.) can be used
fastify.post('/query', async (request, reply) => {
    // Execute a single query
    const query = "SELECT * FROM users";
    const result = await datastore.execute(query);
    return reply.send({ result });
});

fastify.post('/batch', async (request, reply) => {
    // Execute a batch of queries.
    const queries = ["SELECT * FROM orders", "SELECT * FROM products", ];
    const result = await datastore.batch(queries);
    return reply.send({ result });
});

fastify.post('/shutdown', async (request, reply) => {
    // Close the connection to the datastore
    datastore.close();
    shutdownEmitter.emit('shutdown');
    return reply.send({ status: 'Connection closed' });
});

// Listen for the shutdown event and then
// shutdown the agent so it properly flushes all data
shutdownEmitter.on('shutdown', () => {
    setTimeout(() => {
        newrelic.shutdown({ collectPendingData: true }, () => process.exit(0));
    }, 2500);
});

// Start the server where the database will be hosted
const start = async () => {
    try {
        datastore.connect();
        fastify.listen({ port: port, host: host });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();