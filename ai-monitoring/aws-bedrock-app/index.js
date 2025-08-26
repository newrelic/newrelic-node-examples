/*
 * Copyright 2025 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'
const newrelic = require('newrelic')
const fastify = require('fastify')({ logger: true })
const { PORT: port = 3000, HOST: host = '127.0.0.1' } = process.env
const {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelWithResponseStreamCommand,
  ConverseCommand,
  ConverseStreamCommand
} = require('@aws-sdk/client-bedrock-runtime')

const requests = require('./requests')
const responses = new Map()

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN
  }
})

fastify.listen({ host, port }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})

fastify.post('/chat-completion', async (request, reply) => {
  const { message = 'Say this is a test', model = 'amazon-titan' } = request.body || {}

  const modelConfig = requests[model]
  if (!modelConfig) {
    return reply.code(400).send({ error: 'Invalid model' })
  }

  const data = modelConfig(message)

  const command = new InvokeModelCommand({
    body: JSON.stringify(data.body),
    modelId: data.modelId,
    contentType: 'application/json',
    accept: 'application/json',
  })

  try {
    const response = await client.send(command)
    const resBody = new TextDecoder('utf-8').decode(response.body)
    const parsedResBody = JSON.parse(resBody)

    let outputText

    switch (model) {
      case 'amazon-titan':
        outputText = parsedResBody.results[0].outputText
        break
      case 'anthropic':
      case 'claude3':
        outputText = parsedResBody.content[0].text
        break
      case 'ai21':
        outputText = parsedResBody.completions[0].data.text
        break
      case 'llama3':
        outputText = parsedResBody.generation
        break
      case 'nova-micro':
        outputText = parsedResBody?.output?.message?.content[0].text
        break
    }

    const { requestId } = response.$metadata
    const { traceId } = newrelic.getTraceMetadata()
    responses.set(requestId, { traceId })

    return reply.send({ requestId, outputText })
  } catch (error) {
    const code = error?.$metadata?.httpStatusCode || 500
    return reply.code(code).send({ error })
  }
})

fastify.post('/chat-completion-stream', async (request, reply) => {
  const { message = 'Say this is a test', model = 'amazon-titan' } = request.body || {}

  const modelConfig = requests[model]
  if (!modelConfig) {
    return reply.code(400).send({ error: 'Invalid model' })
  }

  const data = modelConfig(message)

  const command = new InvokeModelWithResponseStreamCommand({
    body: JSON.stringify(data.body),
    modelId: data.modelId,
    contentType: 'application/json',
    accept: 'application/json',
  })

  try {
    const response = await client.send(command)

    reply.raw.writeHead(200, { 'Content-Type': 'text/plain' })
    reply.raw.write(`requestId": ${response.$metadata.requestId}`)
    for await (const chunk of response.body) {
      if (chunk.chunk.bytes) {
        reply.raw.write(chunk.chunk.bytes)
      }
    }

    reply.raw.write('\n-------- END OF MESSAGE ---------\n')
    reply.raw.end()

    return reply
  } catch (error) {
    const code = error?.$metadata?.httpStatusCode || 500
    return reply.code(code).send({ error })
  }
})

fastify.post('/embedding', async (request, reply) => {
  const { message = 'Test embedding', model = 'amazon-titan-embed' } = request.body || {}

  const modelConfig = requests[model]

  if (!modelConfig) {
    return reply.code(400).send({ error: 'Invalid model' })
  }

  const data = modelConfig(message)

  const prompt = {
    body: JSON.stringify(data.body),
    modelId: data.modelId,
    contentType: 'application/json',
    accept: 'application/json'
  }

  const command = new InvokeModelCommand(prompt)

  try {
    const response = await client.send(command)
    const resBody = new TextDecoder('utf-8').decode(response.body)
    const parsedResBody = JSON.parse(resBody)
    const embedding = parsedResBody.embedding

    return reply.send({ requestId: response.$metadata.requestId, embedding })
  } catch (error) {
    const code = error?.$metadata?.httpStatusCode || 500
    return reply.code(code).send({ error })
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

fastify.post('/converse', async (request, reply) => {
  try {
    const { message = 'Say this is a test', modelId = 'anthropic.claude-instant-v1' } = request.body || {}
    const conversation = [
      {
        role: 'user',
        content: [{ text: message }]
      }
    ]
    const response = await client.send(
      new ConverseCommand({ modelId, messages: conversation })
    )
    const responseText = response.output.message.content[0].text
    const { requestId } = response.$metadata
    const { traceId } = newrelic.getTraceMetadata()
    responses.set(requestId, { traceId })

    return reply.send({ requestId, responseText })
  } catch (error) {
    const code = error?.$metadata?.httpStatusCode || 500
    return reply.code(code).send({ error })
  }
})

fastify.post('/converse-stream', async (request, reply) => {
  try {
    const { message = 'Say this is a test.', modelId = 'anthropic.claude-instant-v1' } = request.body || {}
    const conversation = [
      { role: 'user', content: [{ text: message }] }
    ]

    const command = new ConverseStreamCommand({
      modelId,
      messages: conversation
    })
    const response = await client.send(command)

    reply.raw.writeHead(200, { 'Content-Type': 'text/plain' })
    reply.raw.write(`requestId: ${response.$metadata.requestId}\n`)

    let traceId
    for await (const event of response.output.message.content) {
      if (event.contentBlockDelta && event.contentBlockDelta.delta.text) {
        const text = event.contentBlockDelta.delta.text
        reply.raw.write(text)
      }

      if (!traceId) {
        traceId = newrelic.getTraceMetadata().traceId
      }
    }

    responses.set(response.$metadata.requestId, { traceId })
    reply.raw.end()
    return reply
  } catch (error) {
    const code = error?.$metadata?.httpStatusCode || 500
    return reply.code(code).send({ error })
  }
})
