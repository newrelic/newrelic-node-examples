'use strict'

module.exports = {
  'amazon-titan': (message) => ({
    modelId: 'amazon.titan-text-express-v1',
    body: { inputText: message },
  }),
  'amazon-titan-embed': (message) => ({
    modelId: 'amazon.titan-embed-text-v1',
    body: { inputText: message },
  }),
  'ai21': (message) => ({
    modelId: 'ai21.j2-ultra-v1',
    body: { prompt: message },
  }),
  'claude3': (message) => ({
    modelId: 'us.anthropic.claude-3-haiku-20240307-v1:0',
    body: {
      'anthropic_version': "bedrock-2023-05-31",
      'max_tokens': 256,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: message
            }
          ]
        }
      ]
    },
  }),
  'llama3': (message) => ({
    modelId: 'us.meta.llama3-3-70b-instruct-v1:0',
    body: { prompt: message },
  }),
  'nova-micro': (message) => ({
    modelId: 'us.amazon.nova-micro-v1:0',
    body: {
      messages: [
        {
          role: 'user',
          content: [
            {
              text: message
            }
          ]
        }
      ]
    }
  }),
  'amazon-invalid': (message) => ({
    modelId: 'amazon.titan-text-express-v1',
    body: { message },
  }),
  'anthropic-invalid': (message) => ({
    modelId: 'anthropic.claude-v2',
    body: {
      inputText: `\n\nHuman: ${message}\n\nAssistant:`,
      max_tokens_to_sample: 200,
    },
  }),
  'ai21-invalid': (message) => ({
    modelId: 'ai21.j2-ultra-v1',
    body: { inputText: message },
  }),
  'cohere-invalid': (message) => ({
    modelId: 'cohere.command-text-v14',
    body: { inputText: message },
  }),
  'llama2-invalid': (message) => ({
    modelId: 'meta.llama2-13b-chat-v1',
    body: { inputText: message },
  }),
  'llama3-invalid': (message) => ({
    modelId: 'meta.llama3-8b-instruct-v1:0',
    body: { inputText: message },
  }),
}
