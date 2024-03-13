'use strict'
const newrelic = require('newrelic')
const fastify = require('fastify')({ logger: true })

const { ChatOpenAI, OpenAIEmbeddings } = require('@langchain/openai')
const { MemoryVectorStore } = require("langchain/vectorstores/memory")
const TestTool = require('./custom-tool')

const { Client } = require("@elastic/elasticsearch")
const { createRetrievalChain } = require("langchain/chains/retrieval")

const {
  ElasticVectorSearch
} = require("@langchain/community/vectorstores/elasticsearch")
const { Document } = require("@langchain/core/documents")
const { createStuffDocumentsChain } = require("langchain/chains/combine_documents")
const { ChatPromptTemplate } = require("@langchain/core/prompts")


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
  const embeddings = new OpenAIEmbeddings({modelName: model})

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

  const response = await chatModel.invoke(message)
  const { traceId } = newrelic.getTraceMetadata()
  response.feedbackId = traceId
  responses.set(response.feedbackId, { traceId })

  return reply.send({...response})
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
  const chunkContent = []
  for await (const chunk of stream) {
    chunkContent.push(chunk.content)
  }

  const { traceId } = newrelic.getTraceMetadata()
  responses.set(traceId, { traceId })

  reply.raw.writeHead(200, { 'Content-Type': 'text/plain'})
  reply.raw.write('\n-------- MESSAGE ---------\n')
  reply.raw.write(`'${chunkContent.join('')}'\n`)
  reply.raw.write('\n-------- END OF MESSAGE ---------\n')
  reply.raw.write(`Use this id to record feedback: '${traceId}'\n`)
  reply.raw.end()

  return reply
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


fastify.post('/tools', async (request, reply) => {
  const {
    message = 'Say this is a test.',
    temperature = 0.5
  } = request.body || {}

  const baseUrl = 'http://httpbin.org'
  const tool = new TestTool({
    baseUrl
  })

  const result = await tool.call(message)

  const { traceId } = newrelic.getTraceMetadata()
  result.feedbackId = traceId
  responses.set(result.feedbackId, { traceId })
console.log("RESULT", result)
  return reply.send({...result})
})

fastify.post('/memory_vector', async (request, reply) => {
  const {
    message = 'Describe a bridge',
    results = 1
  } = request.body || {}

  const vectorStore = await MemoryVectorStore.fromTexts(
      [
          "A bridge is a structure linking two places elevated over another.",
          "A smidge is a small amount of something.",
          "A midge is a tiny flying insect.",
          "A tunnel is a passage which allows access underground or through an elevated geographic feature or human-made structure.",
          "The Chunnel is a tunnel under the English Channel.",
          "A funnel is a shape consisting of a partial cone and a cylinder, for directing solids or fluids from a wider to a narrower opening."
      ],
      [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }],
      new OpenAIEmbeddings()
  )

  const response = await vectorStore.similaritySearch(message, results)

  const { traceId } = newrelic.getTraceMetadata()
  responses.set(traceId, { traceId })
  response.feedbackId = traceId

  return reply.send({...response})
})

// Before running this endpoint, make sure to start an ElasticSearch container with `docker-compose up -d --build`.
fastify.post('/elastic_vector', async (request, reply) => {
  const {
    message = 'Describe Elasticsearch.',
    results = 1
  } = request.body || {}

  const config = {
    node: process.env.ELASTIC_URL ?? "http://localhost:9200",
  }
  const clientArgs = {
    client: new Client(config),
    indexName: process.env.ELASTIC_INDEX ?? "test_vectorstore",
  }

  const embeddings = new OpenAIEmbeddings()
  const vectorStore = new ElasticVectorSearch(embeddings, clientArgs)

  const documentSource = [
    "A bridge is a structure linking two places elevated over another.",
    "A smidge is a small amount of something.",
    "A midge is a tiny flying insect.",
    "A tunnel is a passage which allows access underground or through an elevated geographic feature or human-made structure.",
    "The Chunnel is a tunnel under the English Channel.",
    "A funnel is a shape consisting of a partial cone and a cylinder, for directing solids or fluids from a wider to a narrower opening.",
    "Elasticsearch is a powerful vector db.",
    "the quick brown fox jumped over the lazy dog",
    "lorem ipsum dolor sit amet",
    "Elasticsearch a distributed, RESTful search engine optimized for speed and relevance on production-scale workloads."
  ]

  const docs = []
  for await (const doc of documentSource) {
    const id = (docs.length + 1)
    const d = new Document({
      metadata: { id: id },
      pageContent: doc,
    })
    docs.push(d)
  }

  const ids = await vectorStore.addDocuments(docs)
  const vectorResults = await vectorStore.similaritySearch(message, results)

  const prompt =
      ChatPromptTemplate.fromTemplate(`Answer the following question based only on the provided context:

<context>
{context}
</context>

Question: {input}`)

  const documentChain = await createStuffDocumentsChain({
    llm: new ChatOpenAI(),
    prompt,
  })

  const chain = await createRetrievalChain({
    combineDocsChain: documentChain,
    retriever: vectorStore.asRetriever()
  })
  const response1 = await chain.invoke({ input: message })

  await vectorStore.delete({ ids })

  const response2 = await chain.invoke({ input: message })

  const { traceId } = newrelic.getTraceMetadata()
  responses.set(traceId, { traceId })
  const feedbackId = traceId

  return reply.send({feedbackId, vectorResults, response1, response2})
})


