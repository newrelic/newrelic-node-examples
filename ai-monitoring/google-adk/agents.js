/*
 * Copyright 2026 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

const { LlmAgent } = require('@google/adk')
const { calculatorTool, weatherTool, searchTool } = require('./tools')

/**
 * Creates a single LlmAgent with tools.
 * Exercises: BaseAgent.prototype.runAsync, BaseTool.prototype.runAsync (via FunctionTool)
 */
function createToolAgent() {
  return new LlmAgent({
    name: 'ToolAgent',
    description: 'An agent that can perform calculations, check weather, and search for information.',
    model: 'gemini-2.5-flash',
    instruction: 'You are a helpful assistant. Use the available tools to answer user questions accurately.',
    tools: [calculatorTool, weatherTool, searchTool]
  })
}

/**
 * Creates a multi-agent hierarchy with a parent agent delegating to sub-agents.
 * Exercises: multiple BaseAgent.prototype.runAsync calls in a hierarchy
 */
function createMultiAgentHierarchy() {
  const mathAgent = new LlmAgent({
    name: 'MathAgent',
    description: 'An agent specialized in mathematical calculations.',
    model: 'gemini-2.5-flash',
    instruction: 'You are a math specialist. Use the calculator tool to solve math problems. Transfer back to the parent agent when done.',
    tools: [calculatorTool]
  })

  const researchAgent = new LlmAgent({
    name: 'ResearchAgent',
    description: 'An agent specialized in looking up information and weather.',
    model: 'gemini-2.5-flash',
    instruction: 'You are a research specialist. Use the search and weather tools to find information. Transfer back to the parent agent when done.',
    tools: [weatherTool, searchTool]
  })

  const orchestrator = new LlmAgent({
    name: 'OrchestratorAgent',
    description: 'A parent agent that delegates tasks to specialized sub-agents.',
    model: 'gemini-2.5-flash',
    instruction: 'You are an orchestrator. Route math questions to MathAgent and research/weather questions to ResearchAgent. Combine their results into a final answer.',
    subAgents: [mathAgent, researchAgent]
  })

  return orchestrator
}

module.exports = { createToolAgent, createMultiAgentHierarchy }
