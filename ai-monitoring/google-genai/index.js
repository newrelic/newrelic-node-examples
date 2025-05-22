'use strict';

const newrelic = require('newrelic');
const { GoogleGenAI } = require('@google/genai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION;
const GOOGLE_GENAI_USE_VERTEXAI = process.env.GOOGLE_GENAI_USE_VERTEXAI;

/**
 * Generate content using the given Google GenAI client
 * @param {GoogleGenAI} aiClient 
 */
async function generateContent(aiClient) {
  newrelic.startBackgroundTransaction('generateContent', async () => {
    const txn = newrelic.getTransaction();
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: 'why is the sky blue?',
    });
    console.log(response.text);
    txn.end();
    newrelic.shutdown({ collectPendingData: true }, () => {
      process.exit(0);
    });
  })
}

async function embedContent() {
  const aiClient = new GoogleGenAI({ vertexai: false, apiKey: GEMINI_API_KEY });
  newrelic.startBackgroundTransaction('embedContent', async () => {
    const txn = newrelic.getTransaction();
    const response = await aiClient.models.embedContent({
      model: 'gemini-embedding-exp-03-07',
      contents: 'What is the meaning of life?',
    });
    console.log(response.embeddings);
    txn.end();
    newrelic.shutdown({ collectPendingData: true }, () => {
      process.exit(0);
    });
  })
}

async function main() {
  // Determine which client to use
  let aiClient;
  if (GOOGLE_GENAI_USE_VERTEXAI) {
    aiClient = new GoogleGenAI({
      vertexai: true,
      project: GOOGLE_CLOUD_PROJECT,
      location: GOOGLE_CLOUD_LOCATION,
    });
  } else {
    aiClient = new GoogleGenAI({ vertexai: false, apiKey: GEMINI_API_KEY });
  }

  await generateContent(aiClient);
  // await embedContent();
}

main();