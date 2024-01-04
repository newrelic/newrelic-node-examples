'use strict'
require('dotenv').config();
const newrelic = require('newrelic');
const fastify = require('fastify')({ logger: true });
const { PORT: port = 3000, HOST: host = '127.0.0.1' } = process.env
const {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelWithResponseStreamCommand
} = require('@aws-sdk/client-bedrock-runtime');

const responses = new Map();

const client = new BedrockRuntimeClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
})

fastify.listen({ host, port }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})

fastify.post('/chat-completion', async (request, reply) => {
  const { message = 'Say this is a test', model = 'amazon-titan' } = request.body || {};

  // Model configurations
  const modelConfigurations = {
    // amazon titan text
    'amazon-titan': {
      modelId: 'amazon.titan-text-express-v1',
      body: { inputText: message },
    },
    // anthropic claude
    'anthropic': {
      modelId: 'anthropic.claude-v2',
      body: {
        prompt: `\n\nHuman: ${message}\n\nAssistant:`,
        max_tokens_to_sample: 200,
      },
    },
    // ai21 labs jurassic 2
    'ai21': {
      modelId: 'ai21.j2-ultra-v1',
      body: { prompt: message },
    },
    // cohere
    'cohere': {
      modelId: 'cohere.command-text-v14',
      body: { prompt: message },
    },
  };

  const modelConfig = modelConfigurations[model];
  if (!modelConfig) {
    return reply.code(400).send({ error: 'Invalid model' });
  }

  const command = new InvokeModelCommand({
    body: JSON.stringify(modelConfig.body),
    modelId: modelConfig.modelId,
    contentType: 'application/json',
    accept: 'application/json',
  });

  try {
    const response = await client.send(command);
    const resBody = new TextDecoder('utf-8').decode(response.body);
    const parsedResBody = JSON.parse(resBody);

    let outputText;

    switch (model) {
      case 'amazon-titan':
        outputText = parsedResBody.results[0].outputText;
        break;
      case 'anthropic':
        outputText = parsedResBody.completion;
        break;
      case 'ai21':
        outputText = parsedResBody.completions[0].data.text;
        break;
      case 'cohere':
        outputText = parsedResBody.generations[0].text;
        break;
    }

    return reply.send({"requestId": response.$metadata.requestId, outputText});
  } catch (error) {
    return reply.code(500).send({ error: error });
  }
});

fastify.post('/chat-completion-stream', async(request, reply) => {
  const { message = 'Say this is a test', model = 'amazon-titan' } = request.body || {};

  // Model configurations
  const modelConfigurations = {
    // amazon titan text
    'amazon-titan': {
      modelId: 'amazon.titan-text-express-v1',
      body: { inputText: message },
    },
    // anthropic claude
    'anthropic': {
      modelId: 'anthropic.claude-v2',
      body: {
        prompt: `\n\nHuman: ${message}\n\nAssistant:`,
        max_tokens_to_sample: 200,
      },
    },
    // cohere
    'cohere': {
      modelId: 'cohere.command-text-v14',
      body: { prompt: message },
    },
  };

  const modelConfig = modelConfigurations[model];
  if (!modelConfig) {
    return reply.code(400).send({ error: 'Invalid model' });
  }

  const command = new InvokeModelWithResponseStreamCommand({
    body: JSON.stringify(modelConfig.body),
    modelId: modelConfig.modelId,
    contentType: 'application/json',
    accept: 'application/json',
  });

  try {
    const response = await client.send(command);

    reply.raw.writeHead(200, { 'Content-Type': 'text/plain'});
    reply.raw.write(`requestId": ${response.$metadata.requestId}`);
    for await (const chunk of response.body) {
      if (chunk.chunk.bytes) {
        reply.raw.write(chunk.chunk.bytes);
      }
    }
  
    reply.raw.write('\n-------- END OF MESSAGE ---------\n');
    reply.raw.end();
    
    return reply;
  } catch (error) {
    return reply.code(500).send({ error: error });
  }
})

fastify.post('/embedding', async (request, reply) => {
  const { message = 'Test embedding', model = 'amazon-titan-embed' } = request.body || {}

  const prompt = {
    body: JSON.stringify({
      inputText: message,
    }),
    modelId: 'amazon.titan-embed-text-v1',
    contentType: 'application/json',
    accept: 'application/json'
  }

  const command = new InvokeModelCommand(prompt);

  try {
    const response = await client.send(command);
    const resBody = new TextDecoder('utf-8').decode(response.body);
    const parsedResBody = JSON.parse(resBody);
    const embedding = parsedResBody.embedding;

    return reply.send({"requestId": response.$metadata.requestId, embedding});
  } catch (error) {
    return reply.code(500).send({ error: error });
  }
})

fastify.post('/feedback', (request, reply) => {
  const { category = 'feedback-test', rating = 1, message = 'Good talk', metadata, id } = request.body || {}
  const ids = responses.get(id);
  if (!ids) {
    return reply.code(404).send(`No message ids found for ${message}`);
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

  return reply.send('Feedback recorded');
})

