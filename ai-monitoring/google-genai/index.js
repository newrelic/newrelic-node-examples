'use strict';

const express = require('express');
const { GoogleGenAI } = require('@google/genai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION;
const GOOGLE_GENAI_USE_VERTEXAI = false || process.env.GOOGLE_GENAI_USE_VERTEXAI;

const app = express();
const port = 3000;

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

/**
 * Generate content route
 */
app.get('/', async (req, res) => {
  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: 'Why is the sky blue?',
      config: {
        candidateCount: 1,
        stopSequences: ['x'],
        maxOutputTokens: 100000,
        temperature: 1.0,
      },
    });
    res.json({ text: response.text });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating content');
  }
});

/**
 * Generate content stream route
 */
app.get('/stream', async (req, res) => {
  try {
    const response = await aiClient.models.generateContentStream({
      model: 'gemini-2.0-flash',
      contents: 'Write a story about a magic backpack.',
      config: {
        automaticFunctionCalling: {
          disable: true,
        },
      },
    });
    let text = '';
    for await (const chunk of response) {
      text += chunk.text;
    }
    res.json({ text });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating content stream');
  }
});

/**
 * Embed content route
 */
app.get('/embed', async (req, res) => {
  try {
    const result = await aiClient.models.embedContent({
      model: 'text-embedding-004',
      contents: [
        'What is your name?',
        'What is your favorite color?',
      ],
      config: {},
    });
    res.json({ embeddings: result.embeddings });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error embedding content');
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});