/*
 * Copyright 2026 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const newrelic = require('newrelic')
const fastify = require('fastify')({ logger: true })
const Anthropic = require('@anthropic-ai/sdk')
const { PORT: port = 3000, HOST: host = '127.0.0.1', ANTHROPIC_API_KEY: apiKey } = process.env
const client = new Anthropic({
  apiKey
})
const { randomUUID: uuid } = require('node:crypto')
const responses = new Map()
const defaultModel = 'claude-4-5-haiku'

fastify.listen({ host, port }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})

fastify.post('/chat-completion', async (request, reply) => {
  const { message = 'Write a haiku about coding', model = defaultModel, temperature = 1 } = request.body || {}

  // assign conversation_id via custom attribute API
  const conversationId = uuid()
  newrelic.addCustomAttribute('llm.conversation_id', conversationId)

  const response = await client.messages.create({
    model,
    max_tokens: 1024,
    temperature,
    messages: [{ role: 'user', content: message }]
  })

  const { traceId } = newrelic.getTraceMetadata()
  responses.set(response.id, { traceId })
  const text = response.content.find((b) => b.type === 'text')?.text ?? ''
  return reply.send(text)
})

fastify.post('/chat-completion-stream', async (request, reply) => {
  const { message = 'Write a short story about a developer who discovers their code has become sentient', model = defaultModel, temperature = 1 } = request.body || {}

  reply.hijack()

  const stream = client.messages.stream({
    model,
    max_tokens: 1024,
    temperature,
    messages: [{ role: 'user', content: message }]
  })

  try {
    reply.raw.writeHead(200, { 'Content-Type': 'text/plain' })
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        reply.raw.write(event.delta.text)
      }
    }

    const finalMessage = await stream.finalMessage()
    const { traceId } = newrelic.getTraceMetadata()
    responses.set(finalMessage.id, { traceId })
    reply.raw.write('\n-------- END OF MESSAGE ---------\n')
    reply.raw.write(`Use this id to record feedback '${finalMessage.id}'\n`)
  } catch (error) {
    if (!reply.raw.headersSent) {
      reply.raw.writeHead(error.status || 500, { 'Content-Type': 'application/json' })
    }
    reply.raw.write(JSON.stringify({ error: error.message }))
  } finally {
    reply.raw.end()
  }
})

// Error endpoints for testing error instrumentation
// UnprocessableEntityError (422) - invalid model name
fastify.post('/error/unprocessable', async (request, reply) => {
  const response = await client.messages.create({
    model: 'invalid-model',
    max_tokens: 1024,
    messages: [{ role: 'user', content: 'test' }]
  })
  return reply.send(response)
})

// APIConnectionError - non-routable host
fastify.post('/error/connection', async (request, reply) => {
  const badClient = new Anthropic({ apiKey, baseURL: 'http://10.255.255.1' })
  const response = await badClient.messages.create({
    model: defaultModel,
    max_tokens: 1024,
    messages: [{ role: 'user', content: 'test' }]
  })
  return reply.send(response)
})

fastify.post('/feedback', (request, reply) => {
  const { category = 'feedback-test', rating = 1, message = 'Good talk', metadata, id } = request.body || {}
  const { traceId } = responses.get(id)
  if (!traceId) {
    return reply.code(404).send(`No trace id found for ${id}`)
  }

  newrelic.recordLlmFeedbackEvent({
    traceId,
    category,
    rating,
    message,
    metadata
  })

  return reply.send('Feedback recorded')
})
