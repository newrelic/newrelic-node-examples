'use strict'
const newrelic = require('newrelic')
const fastify = require('fastify')({ logger: true })
const OpenAI = require('openai')
const { PORT: port = 3000, HOST: host = '127.0.0.1', OPENAI_API_KEY: apiKey } = process.env
const openai = new OpenAI({
  apiKey
})
const { randomUUID: uuid } = require('node:crypto')

const responses = new Map()


fastify.listen({ host, port }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})

fastify.post('/embedding', async (request, reply) => {
  const { input = 'Test embedding', model = 'text-embedding-ada-002' } = request.body || {}
  const embedding = await openai.embeddings.create({
    input,
    model
  })
  return reply.send(embedding)
})

fastify.post('/chat-completion', async(request, reply) => {
  const { message = 'Say this is a test', model = 'gpt-4' } = request.body || {}

  // assign conversation_id via custom attribute API
  const conversationId = uuid()
  newrelic.addCustomAttribute('conversation_id', conversationId)

  // set metadata to be added to all LLM events
  const meta = { test_meta: 'value of meta key', ctx: 'sample app', id: 'bogus' }
  newrelic.setLlmMetadata(meta)

  const chatCompletion = await openai.chat.completions.create({
    temperature: 0.5,
    messages: [{ role: 'user', content: message }],
    model
  });

  const ids = newrelic.getLlmMessageIds({ responseId: chatCompletion.id })
  responses.set(chatCompletion.id, ids)
  return reply.send(chatCompletion)
})

fastify.post('/chat-completion-stream', async(request, reply) => {
  const { message = 'Say this is a test', model = 'gpt-4' } = request.body || {}
  const stream = await openai.chat.completions.create({
    stream: true,
    temperature: 0.5,
    messages: [{ role: 'user', content: message }],
    model
  });
    
  reply.raw.writeHead(200, { 'Content-Type': 'text/plain'})
  let chunk
  for await (chunk of stream) {
    if (chunk.choices[0]?.delta?.content) {
      reply.raw.write(chunk.choices[0].delta.content)
    }
  }

  const ids = newrelic.getLlmMessageIds({ responseId: chunk.id })
  responses.set(chunk.id, ids)
  reply.raw.write('\n-------- END OF MESSAGE ---------\n')
  reply.raw.write(`Use this id to record feedback '${chunk.id}'\n`)
  reply.raw.end()
  
  return reply
})

fastify.post('/feedback', (request, reply) => {
  const { category = 'feedback-test', rating = 1, message = 'Good talk', metadata, id } = request.body || {}
  const ids = responses.get(id)
  if (!ids) {
    return reply.code(404).send(`No message ids found for ${message}`)
  }

  newrelic.recordLlmFeedbackEvent({
    conversationId: ids.conversation_id,
    requestId: ids.request_id,
    messageId: ids.message_ids[0],
    category,
    rating,
    message,
    metadata
  })

  return reply.send('Feedback recorded')
})
