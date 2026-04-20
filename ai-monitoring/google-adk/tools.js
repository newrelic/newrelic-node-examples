/*
 * Copyright 2026 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const { FunctionTool } = require('@google/adk')
const { z } = require('zod')

const calculatorTool = new FunctionTool({
  name: 'calculator',
  description: 'Performs basic arithmetic operations. Use this to calculate mathematical expressions.',
  parameters: z.object({
    operation: z.enum(['add', 'subtract', 'multiply', 'divide']).describe('The operation to perform'),
    a: z.number().describe('First number'),
    b: z.number().describe('Second number')
  }),
  execute: async ({ operation, a, b }) => {
    let result
    switch (operation) {
      case 'add':
        result = a + b
        break
      case 'subtract':
        result = a - b
        break
      case 'multiply':
        result = a * b
        break
      case 'divide':
        result = b !== 0 ? a / b : 'Error: Division by zero'
        break
    }
    return { result: `${a} ${operation} ${b} = ${result}` }
  }
})

const weatherTool = new FunctionTool({
  name: 'get_weather',
  description: 'Gets the current weather for a specified city. Returns temperature and conditions.',
  parameters: z.object({
    city: z.string().describe('The city name to get weather for')
  }),
  execute: async ({ city }) => {
    const weatherData = {
      'new york': { temp: 72, condition: 'Sunny' },
      london: { temp: 60, condition: 'Cloudy' },
      tokyo: { temp: 68, condition: 'Rainy' },
      paris: { temp: 65, condition: 'Partly Cloudy' }
    }
    const normalizedCity = city.toLowerCase()
    const weather = weatherData[normalizedCity] || { temp: 70, condition: 'Unknown' }
    return { city, temperature: `${weather.temp}°F`, condition: weather.condition }
  }
})

const searchTool = new FunctionTool({
  name: 'search',
  description: 'Searches for information about a topic. Use this when you need to look up facts or information.',
  parameters: z.object({
    query: z.string().describe('The search query')
  }),
  execute: async ({ query }) => {
    const searchResults = {
      'google adk': 'Google Agent Development Kit (ADK) is a framework for building AI agent ecosystems. It supports LlmAgent, SequentialAgent, LoopAgent, and ParallelAgent types.',
      'new relic': 'New Relic is an observability platform that helps engineers monitor, debug, and improve their software. It provides AI monitoring capabilities for LLM applications.',
      gemini: 'Gemini is a family of multimodal AI models developed by Google DeepMind. It can process text, images, audio, and video.'
    }

    for (const [key, value] of Object.entries(searchResults)) {
      if (query.toLowerCase().includes(key)) {
        return { query, result: value }
      }
    }
    return { query, result: `Search results for "${query}": Information about this topic is available through various sources.` }
  }
})

module.exports = {
  calculatorTool,
  weatherTool,
  searchTool
}
