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
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: 'Why is the sky blue?',
      config: {
        candidateCount: 1,
        stopSequences: ['x'],
        maxOutputTokens: 20,
        temperature: 1.0,
      },
    });
    console.debug(response);
    console.log(response.text);
    txn.end();
    newrelic.shutdown({ collectPendingData: true }, () => {
      process.exit(0);
    });
  })
}

async function generateContentStream(aiClient) {
  newrelic.startBackgroundTransaction('generateContentStream', async () => {
    const txn = newrelic.getTransaction();
    const response = await aiClient.models.generateContentStream({
      model: 'gemini-2.0-flash',
      contents: 'Write a story about a magic backpack.',
      config: {
        // force to use generateContentStreamInternal?
        automaticFunctionCalling: {
          disable: true,
        }
      }
    });
    let text = "";
    for await (const chunk of response) {
      console.log(chunk.text);
      text += chunk.text;
    }
    txn.end();
    newrelic.shutdown({ collectPendingData: true }, () => {
      process.exit(0);
    });
  })
}

async function embedContent(aiClient) {
  newrelic.startBackgroundTransaction('embedContent', async () => {
    const txn = newrelic.getTransaction();
    const result = await aiClient.models.embedContent({
      model: 'text-embedding-004',
      contents: [
        'What is your name?',
        'What is your favorite color?',
      ],
      config: {
        /** config here */
      },
    });
    console.log(result.embeddings);
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
  // await generateContentStream(aiClient);
  // await embedContent(aiClient);
}

main();