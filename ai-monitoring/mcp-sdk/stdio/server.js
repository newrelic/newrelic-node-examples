/*
 * Copyright 2025 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js')
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js')
const { registerWeatherTools, registerWeatherPrompts, registerWeatherResources } = require('./weather-setup.js')

async function main() {
  // Create server instance
  const server = new McpServer({
    name: 'weather',
    version: '1.0.0',
    capabilities: {
      resources: {},
      tools: {},
      prompts: {}
    },
  })

  registerWeatherTools(server)
  registerWeatherPrompts(server)
  registerWeatherResources(server)

  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('Weather MCP Server running on stdio')
}

main().catch((error) => {
  console.error('Fatal error in main():', error)
  process.exit(1)
})
