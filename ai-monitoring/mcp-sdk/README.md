### MCP Example with OpenAI Agent

This example application demonstrates how an `@openai/agents` agent leverages the **Model Context Protocol (MCP)** via  **`@modelcontextprotocol/sdk`** . This AI agent accesses external weather-related **tools**, **resources**, and **prompts**. The Node.js agent will track relevant spans/segments (`client.callTool`, `client.readResource`, and `client.getPrompt` respectively).

## Getting started

**Note**: This application requires the use of Node.js v20+.

1. Clone or fork this repository.
2. Install dependencies and configure application environment variables.

   ```zsh
   npm ci
   cp env.sample .env
   # Fill out NEW_RELIC_LICENSE_KEY and OPENAI_API_KEY
   ```
3. Run the client, which will connect to the MCP server in the background.

   ```zsh
   npm run client
   ```

## Inspecting segments

More to come later...
