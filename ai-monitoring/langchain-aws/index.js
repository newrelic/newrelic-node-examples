/*
 * Copyright 2025 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'
const newrelic = require('newrelic')
const fastify = require('fastify')({ logger: true })
const { PORT: port = 3000, HOST: host = '127.0.0.1' } = process.env
const { ChatBedrockConverse, BedrockEmbeddings } = require('@langchain/aws')
const responses = new Map()

const modelAuth = {
  region: process.env.AWS_REGION ?? 'us-east-1',
  credentials: {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    sessionToken: process.env.AWS_SESSION_TOKEN
  }
}

fastify.listen({ host, port }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})

fastify.post('/chat-invoke', async (request, reply) => {
  const { message = 'Hello world!', model = 'us.amazon.nova-micro-v1:0' } = request.body || {}
  const modelConfig = {
    model,
    temperature: 0,
    maxTokens: undefined,
    timeout: undefined,
    maxRetries: 2,
  }
  try {
    const llm = new ChatBedrockConverse({ ...modelConfig, ...modelAuth })
    const response = await llm.invoke(message)
    const responseText = response?.content
    const { requestId, httpStatusCode } = response?.response_metadata?.$metadata
    const { traceId } = newrelic.getTraceMetadata()
    responses.set(requestId, { traceId })

    return reply.code(httpStatusCode).send({ requestId, responseText })
  } catch (error) {
    const code = error?.response_metadata?.$metadata?.httpStatusCode || 500
    return reply.code(code).send(error)
  }
})

fastify.post('/chat-stream', async (request, reply) => {
  const { message = 'Hello world!', model = 'us.amazon.nova-micro-v1:0' } = request.body || {}
  try {
    const modelConfig = {
      model,
      temperature: 0,
      maxTokens: undefined,
      timeout: undefined,
      maxRetries: 2,
    }

    const llm = new ChatBedrockConverse({ ...modelConfig, ...modelAuth })

    let traceId
    const response = await llm.stream(message)
    reply.raw.writeHead(200, { 'Content-Type': 'text/plain' })
    let requestId

    if (response?.response_metadata?.$metadata?.requestId) {
      requestId = response?.response_metadata?.$metadata?.requestId
    }

    for await (const chunk of response) {
      reply.raw.write(chunk?.content)
      if (!traceId) {
        traceId = newrelic.getTraceMetadata().traceId
      }
      if (chunk?.response_metadata?.$metadata?.requestId) {
        requestId = chunk?.response_metadata?.$metadata?.requestId
      }
    }

    if (requestId) {
      responses.set(requestId, { traceId })
      reply.raw.write(`\nrequestId: ${requestId}\n`)
    } else if (traceId) {
      responses.set(traceId, { traceId })
      reply.raw.write(`\ntraceId: ${traceId}\n`)
    }

    reply.raw.end()
    return reply
  } catch (error) {
    const code = error?.response_metadata?.$metadata?.httpStatusCode || 500
    return reply.code(code).send(error)
  }
})

fastify.post('/embedding', async (request, reply) => {
  const { message = 'Hello world!', model = 'amazon.titan-embed-text-v1' } = request.body || {}
  const modelConfig = {
    model,
    temperature: 0,
    maxTokens: undefined,
    timeout: undefined,
    maxRetries: 2,
  }
  try {
    const llm = new BedrockEmbeddings({ ...modelConfig, ...modelAuth })
    const response = await llm.embedQuery(message)

    const { traceId } = newrelic.getTraceMetadata()
    responses.set('requestId', { traceId })

    return reply.code(200).send({ response })
  } catch (error) {
    const code = error?.httpStatusCode || 500
    return reply.code(code).send(error)
  }
})

fastify.post('/feedback', (request, reply) => {
  const { category = 'feedback-test', rating = 1, message = 'Good talk', metadata, id } = request.body || {}
  const { traceId } = responses.get(id)
  if (!traceId) {
    return reply.code(404).send(`No trace id found for ${message}`)
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
