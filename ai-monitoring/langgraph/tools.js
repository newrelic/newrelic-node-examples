/*
 * Copyright 2026 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

const { DynamicStructuredTool } = require('@langchain/core/tools')
const { z } = require('zod')

const calculatorTool = new DynamicStructuredTool({
  name: 'calculator',
  description: 'Performs basic arithmetic operations. Use this to calculate mathematical expressions.',
  schema: z.object({
    operation: z.enum(['add', 'subtract', 'multiply', 'divide']).describe('The operation to perform'),
    a: z.number().describe('First number'),
    b: z.number().describe('Second number')
  }),
  func: async ({ operation, a, b }) => {
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
    return `Result: ${result}`
  }
})

const weatherTool = new DynamicStructuredTool({
  name: 'get_weather',
  description: 'Gets the current weather for a specified city. Returns temperature and conditions.',
  schema: z.object({
    city: z.string().describe('The city name to get weather for')
  }),
  func: async ({ city }) => {
    // Simulated weather data
    const weatherData = {
      'new york': { temp: 72, condition: 'Sunny' },
      london: { temp: 60, condition: 'Cloudy' },
      tokyo: { temp: 68, condition: 'Rainy' },
      paris: { temp: 65, condition: 'Partly Cloudy' }
    }
    const normalizedCity = city.toLowerCase()
    const weather = weatherData[normalizedCity] || { temp: 70, condition: 'Unknown' }
    return `Weather in ${city}: ${weather.temp}°F, ${weather.condition}`
  }
})

const searchTool = new DynamicStructuredTool({
  name: 'search',
  description: 'Searches for information about a topic. Use this when you need to look up facts or information.',
  schema: z.object({
    query: z.string().describe('The search query')
  }),
  func: async ({ query }) => {
    // Simulated search results
    const searchResults = {
      langgraph: 'LangGraph is a library for building stateful, multi-actor applications with LLMs. It extends LangChain with the ability to create cyclic graphs and manage state.',
      openai: 'OpenAI is an AI research company that created GPT models, DALL-E, and ChatGPT. Their mission is to ensure artificial general intelligence benefits humanity.',
      'new relic': 'New Relic is an observability platform that helps engineers monitor, debug, and improve their software. It provides AI monitoring capabilities for LLM applications.'
    }

    for (const [key, value] of Object.entries(searchResults)) {
      if (query.toLowerCase().includes(key)) {
        return value
      }
    }
    return `Search results for "${query}": Information about this topic is available through various sources.`
  }
})

module.exports = {
  calculatorTool,
  weatherTool,
  searchTool
}
