/*
 * Copyright 2025 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'
const newrelic = require('newrelic')
const fastify = require('fastify')({ logger: true })
const { PORT: port = 3000, HOST: host = '127.0.0.1' } = process.env
const { Client } = require('@elastic/elasticsearch')
const { ChatBedrockConverse, BedrockEmbeddings } = require('@langchain/aws')
const { ChatPromptTemplate } = require('@langchain/core/prompts')
const { Document } = require('@langchain/core/documents')
const { ElasticVectorSearch } = require('@langchain/community/vectorstores/elasticsearch')
const responses = new Map()

const chatModel = 'us.amazon.nova-micro-v1:0'

const modelAuth = {
  region: process.env.AWS_REGION ?? 'us-east-1',
  credentials: {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    sessionToken: process.env.AWS_SESSION_TOKEN
  }
}

const elasticClientArgs = {
  client: new Client({
    node: `http://${process.env.ELASTIC_HOST ?? 'localhost'}:${process.env.ELASTIC_PORT ?? '9200'}`
  })
}

fastify.listen({ host, port }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})

fastify.post('/chat-invoke', async (request, reply) => {
  const { message = 'Hello world!', model = chatModel } = request.body || {}

  try {
    const llm = new ChatBedrockConverse({ model, ...modelAuth })
    const prompt = ChatPromptTemplate.fromMessages([['user', message]])
    const chain = prompt.pipe(llm)
    const response = await chain.invoke()
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
  const { message = 'Hello world!', model = chatModel } = request.body || {}
  try {
    const llm = new ChatBedrockConverse({ model, ...modelAuth })
    const prompt = ChatPromptTemplate.fromMessages([['user', message]])
    const chain = prompt.pipe(llm)
    const response = await chain.stream()
    reply.raw.writeHead(200, { 'Content-Type': 'text/plain' })

    let traceId
    let requestId

    if (response?.response_metadata?.$metadata?.requestId) {
      requestId = response?.response_metadata?.$metadata?.requestId
    }

    for await (const chunk of response) {
      reply.raw.write(chunk)
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
  try {
    const embedding = new BedrockEmbeddings({ model, ...modelAuth })
    const docs = [
      new Document({
        metadata: { id: '2' },
        pageContent: message
      })
    ]
    const vectorStore = new ElasticVectorSearch(embedding, elasticClientArgs)
    await vectorStore.deleteIfExists()
    await vectorStore.addDocuments(docs)
    const response = await vectorStore.similaritySearch(message, 1)

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
