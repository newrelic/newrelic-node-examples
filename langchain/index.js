'use strict'
const newrelic = require('newrelic')
const fastify = require('fastify')({ logger: true })

const { OpenAI, ChatOpenAI, OpenAIEmbeddings } = require('@langchain/openai')
const { LLMChain, BaseChain } = require('langchain/chains')
const { ChatPromptTemplate } = require('@langchain/core/prompts')
const { StringOutputParser } = require('@langchain/core/output_parsers')

const { PORT: port = 3000, HOST: host = '127.0.0.1' } = process.env

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
  const embeddings = new OpenAIEmbeddings({modelName: model});

  const embedding = await embeddings.embedQuery(input)
  return reply.send(embedding)
})

fastify.post('/chat-completion', async(request, reply) => {
  const {
    message = 'Say this is a test.',
    model = 'gpt-4',
    temperature = 0.5
  } = request.body || {}

  const chatModel = new ChatOpenAI({
    model,
    temperature
  })

  // assign conversation_id via custom attribute API
  const conversationId = uuid()
  newrelic.addCustomAttribute('llm.conversation_id', conversationId)

  const res = await chatModel.invoke(message)
  console.log(res)
  return reply.send(res)
})

fastify.post('/chat-completion-stream', async(request, reply) => {
  const {
    message = 'Say this is a test.',
    model = 'gpt-4',
    temperature = 0.5
  } = request.body || {}

  const chatModel = new ChatOpenAI({
    model,
    temperature
  })

  const stream = await chatModel.stream(message)
  let chunkContent = []
  for await (const chunk of stream) {
    chunkContent.push(chunk.content)
  }

  reply.raw.writeHead(200, { 'Content-Type': 'text/plain'})
  reply.raw.write('\n-------- MESSAGE ---------\n')
  reply.raw.write(`'${chunkContent.join('')}'\n`)
  reply.raw.write('\n-------- END OF MESSAGE ---------\n')
  reply.raw.end()

  return reply
})
