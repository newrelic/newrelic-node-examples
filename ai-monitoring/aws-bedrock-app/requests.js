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
  'anthropic': (message) => ({
    modelId: 'anthropic.claude-v2',
    body: {
      prompt: `\n\nHuman: ${message}\n\nAssistant:`,
      max_tokens_to_sample: 200,
    },
  }),
  'ai21': (message) => ({
    modelId: 'ai21.j2-ultra-v1',
    body: { prompt: message },
  }),
  'cohere': (message) => ({
    modelId: 'cohere.command-text-v14',
    body: { prompt: message },
  }),
  'cohere-embed': (message) => ({
    modelId: 'cohere.embed-english-v3',
    body: { texts: message.split(' '), input_type: 'search_document' },
  }),
  'llama2': (message) => ({
    modelId: 'meta.llama2-13b-chat-v1',
    body: { prompt: message },
  }),
  'llama3': (message) => ({
    modelId: 'meta.llama3-8b-instruct-v1:0',
    body: { prompt: message },
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
