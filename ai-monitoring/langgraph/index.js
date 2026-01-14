/*
 * Copyright 2026 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const newrelic = require('newrelic')
const fastify = require('fastify')({ logger: true })
const { ChatOpenAI } = require('@langchain/openai')
const { StateGraph, START, END, MessagesAnnotation } = require('@langchain/langgraph')
const { createReactAgent } = require('@langchain/langgraph/prebuilt')
const { calculatorTool, weatherTool, searchTool } = require('./tools')

const defaultModel = 'gpt-4'
const defaultTemp = 0.7
const { PORT: port = 3000, HOST: host = '127.0.0.1', OPENAI_API_KEY: openAIApiKey = 'fake-key' } = process.env
const responses = new Map()

/**
 * Creates a LangGraph agent with tools using `createReactAgent`.
 * @param {string} model LLM id, e.g. 'gpt-4'
 * @param {number} temperature LLM temperature, e.g. 0.7
 * @returns {object} the compiled agent graph
 */
function createAgentGraph(model = defaultModel, temperature = defaultTemp) {
  const tools = [calculatorTool, weatherTool, searchTool]

  const llm = new ChatOpenAI({
    openAIApiKey,
    model,
    temperature,
    maxRetries: 2
  })

  // Use createReactAgent to build the agent graph with tools
  return createReactAgent({
    llm,
    tools,
    name: 'MyReactAgent'
  })
}

/**
 * Creates a simple chatbot workflow without tools.
 * @param {*} model LM id, e.g. 'gpt-4'
 * @param {*} temperature LLM temperature, e.g. 0.7
 * @returns {object} the compiled agent graph
 */
function createChatbotGraph(model = defaultModel, temperature = defaultTemp) {
  const llm = new ChatOpenAI({
    openAIApiKey,
    model,
    temperature,
    maxRetries: 2
  })

  async function callModel(state) {
    const response = await llm.invoke(state.messages)
    return { messages: [response] }
  }

  const workflow = new StateGraph(MessagesAnnotation)
    .addNode('chatbot', callModel)
    .addEdge(START, 'chatbot')
    .addEdge('chatbot', END)

  return workflow.compile()
}

fastify.listen({ host, port }, function (err) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})

// Agent endpoint with tools
fastify.post('/agent', async (request, reply) => {
  const {
    message = 'What is 25 multiplied by 4?',
    model = defaultModel,
    temperature = defaultTemp
  } = request.body || {}

  const graph = createAgentGraph(model, temperature)

  const result = await graph.invoke({
    messages: [{ role: 'user', content: message }]
  })

  const { traceId } = newrelic.getTraceMetadata()
  responses.set(traceId, { traceId })

  // Extract all messages and tool calls for the response
  const toolCalls = []

  for (const msg of result.messages) {
    if (msg.tool_calls && msg.tool_calls.length > 0) {
      toolCalls.push(...msg.tool_calls.map((tc) => {
        return {
          name: tc.name,
          args: tc.args
        }
      }))
    }
  }

  const finalResponse = result.messages[result.messages.length - 1].content

  return reply.send({
    response: finalResponse,
    toolCalls,
    messageCount: result.messages.length,
    feedbackId: traceId
  })
})

// Simple chatbot endpoint without tools
fastify.post('/chatbot', async (request, reply) => {
  const {
    message = 'Hello, how are you?',
    model = defaultModel,
    temperature = defaultTemp
  } = request.body || {}

  const graph = createChatbotGraph(model, temperature)

  const result = await graph.invoke({
    messages: [{ role: 'user', content: message }]
  })

  const { traceId } = newrelic.getTraceMetadata()
  responses.set(traceId, { traceId })

  return reply.send({
    response: result.messages[result.messages.length - 1].content,
    feedbackId: traceId
  })
})

// Multi-tool agent endpoint
fastify.post('/agent-multi', async (request, reply) => {
  const {
    message = 'What is the weather in London and what is 15 plus 27?',
    model = defaultModel,
    temperature = 0.5
  } = request.body || {}

  const graph = createAgentGraph(model, temperature)

  const result = await graph.invoke({
    messages: [{ role: 'user', content: message }]
  })

  const { traceId } = newrelic.getTraceMetadata()
  responses.set(traceId, { traceId })

  // Track tool usage
  const toolUsage = []
  for (const msg of result.messages) {
    if (msg.tool_calls && msg.tool_calls.length > 0) {
      for (const tc of msg.tool_calls) {
        toolUsage.push({
          tool: tc.name,
          input: tc.args
        })
      }
    }
  }

  return reply.send({
    response: result.messages[result.messages.length - 1].content,
    toolsUsed: toolUsage,
    executionSteps: result.messages.length,
    feedbackId: traceId
  })
})

// Streaming agent endpoint
fastify.post('/agent-stream', async (request, reply) => {
  const {
    message = 'Calculate 42 times 7 and tell me about New Relic',
    model = defaultModel,
    temperature = defaultTemp
  } = request.body || {}

  const graph = createAgentGraph(model, temperature)

  const { traceId } = newrelic.getTraceMetadata()
  responses.set(traceId, { traceId })

  reply.hijack()
  reply.raw.writeHead(200, { 'Content-Type': 'text/plain' })
  reply.raw.write('\n-------- AGENT EXECUTION ---------\n')

  let stepNumber = 0
  let finalMessage = null

  // Stream each step as it happens
  for await (const chunk of await graph.stream({
    messages: [{ role: 'user', content: message }]
  })) {
    // Each chunk contains the node name and the state update
    const nodeName = Object.keys(chunk)[0]
    const state = chunk[nodeName]

    if (state.messages && state.messages.length > 0) {
      const msg = state.messages[state.messages.length - 1]
      stepNumber++
      reply.raw.write(`\nStep ${stepNumber} (${nodeName}):\n`)

      if (msg.tool_calls && msg.tool_calls.length > 0) {
        reply.raw.write('Tool Calls:\n')
        for (const tc of msg.tool_calls) {
          reply.raw.write(`  - ${tc.name}(${JSON.stringify(tc.args)})\n`)
        }
      }

      if (msg.content) {
        reply.raw.write(`Content: ${msg.content}\n`)
        finalMessage = msg.content
      }
    }
  }

  reply.raw.write('\n-------- FINAL RESPONSE ---------\n')
  reply.raw.write(finalMessage || 'No response')
  reply.raw.write('\n\n-------- END ---------\n')
  reply.raw.write(`Use this id to record feedback: '${traceId}'\n`)
  reply.raw.end()
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
