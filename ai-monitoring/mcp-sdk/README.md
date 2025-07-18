### MCP Example with OpenAI Agent

This example application demonstrates how an `@openai/agents` agent leverages the **Model Context Protocol (MCP)** via  **`@modelcontextprotocol/sdk`** . This AI agent accesses external weather-related **tools**, **resources**, and **prompts**. The Node.js agent will track relevant spans/segments (`client.callTool`, `client.readResource`, and `client.getPrompt` respectively).


## Getting started

**Note**: This application requires the use of Node.js v20+.

1. Clone or fork this repository.
2. Install dependencies and run application
