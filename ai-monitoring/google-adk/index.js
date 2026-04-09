/*
 * Copyright 2026 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const newrelic = require('newrelic')
const fastify = require('fastify')({ logger: true })
const { Runner, InMemorySessionService } = require('@google/adk')
const { createToolAgent, createMultiAgentHierarchy } = require('./agents')

const { PORT: port = 3000, HOST: host = '127.0.0.1' } = process.env
const responses = new Map()
const sessionService = new InMemorySessionService()

fastify.listen({ host, port }, function (err) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})

// Single agent with tools endpoint
fastify.post('/agent', async (request, reply) => {
  const { message = 'What is 25 multiplied by 4?' } = request.body || {}

  const agent = createToolAgent()
  const runner = new Runner({
    appName: 'google-adk-example',
    agent,
    sessionService
  })

  const events = []
  for await (const event of runner.runEphemeral({
    userId: 'test-user',
    newMessage: { role: 'user', parts: [{ text: message }] }
  })) {
    events.push(event)
    fastify.log.info({
      author: event.author,
      id: event.id,
      errorCode: event.errorCode,
      errorMessage: event.errorMessage,
      content: JSON.stringify(event.content)
    }, 'agent event')
  }

  const { traceId } = newrelic.getTraceMetadata()
  responses.set(traceId, { traceId })

  // Find the last event that has text content (may not be the very last event)
  let finalContent = 'No response'
  for (let i = events.length - 1; i >= 0; i--) {
    const text = events[i].content?.parts
      ?.filter((p) => p.text)
      .map((p) => p.text)
      .join('')
    if (text) {
      finalContent = text
      break
    }
  }

  return reply.send({
    response: finalContent,
    eventCount: events.length,
    feedbackId: traceId
  })
})

// Streaming agent endpoint
fastify.post('/agent-stream', async (request, reply) => {
  const { message = 'Search for information about Google ADK and tell me the weather in Tokyo.' } = request.body || {}

  const agent = createToolAgent()
  const runner = new Runner({
    appName: 'google-adk-example',
    agent,
    sessionService
  })

  const { traceId } = newrelic.getTraceMetadata()
  responses.set(traceId, { traceId })

  reply.hijack()
  reply.raw.writeHead(200, { 'Content-Type': 'text/plain' })
  reply.raw.write('\n-------- AGENT EXECUTION ---------\n')

  let stepNumber = 0
  let finalContent = null

  for await (const event of runner.runEphemeral({
    userId: 'test-user',
    newMessage: { role: 'user', parts: [{ text: message }] }
  })) {
    stepNumber++
    reply.raw.write(`\nStep ${stepNumber} (${event.author || 'system'}):\n`)

    for (const part of event.content?.parts ?? []) {
      if (part.functionCall) {
        reply.raw.write(`  Tool Call: ${part.functionCall.name}(${JSON.stringify(part.functionCall.args)})\n`)
      }
      if (part.functionResponse) {
        reply.raw.write(`  Tool Response: ${part.functionResponse.name} -> ${JSON.stringify(part.functionResponse.response)}\n`)
      }
      if (part.text) {
        reply.raw.write(`  Content: ${part.text}\n`)
        finalContent = part.text
      }
    }
  }

  reply.raw.write('\n-------- FINAL RESPONSE ---------\n')
  reply.raw.write(finalContent || 'No response')
  reply.raw.write('\n\n-------- END ---------\n')
  reply.raw.write(`Use this id to record feedback: '${traceId}'\n`)
  reply.raw.end()
})

// Multi-agent hierarchy endpoint
fastify.post('/multi-agent', async (request, reply) => {
  const { message = 'What is 15 plus 27, and what is the weather in London?' } = request.body || {}

  const agent = createMultiAgentHierarchy()
  const runner = new Runner({
    appName: 'google-adk-example',
    agent,
    sessionService
  })

  const events = []
  for await (const event of runner.runEphemeral({
    userId: 'test-user',
    newMessage: { role: 'user', parts: [{ text: message }] }
  })) {
    events.push(event)
  }

  const { traceId } = newrelic.getTraceMetadata()
  responses.set(traceId, { traceId })

  const finalEvent = events[events.length - 1]
  const finalContent = finalEvent?.content?.parts?.map((p) => p.text).join('') || 'No response'

  const agentNames = [...new Set(events.filter((e) => e.author).map((e) => e.author))]

  return reply.send({
    response: finalContent,
    agentsInvolved: agentNames,
    eventCount: events.length,
    feedbackId: traceId
  })
})

// Feedback endpoint
fastify.post('/feedback', (request, reply) => {
  const {
    category = 'feedback-test',
    rating = 1,
    message = 'Good response',
    metadata,
    id
  } = request.body || {}

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
