# MCP StreamableHTTP

`@modelcontextprotocol/sdk` streaming is typically used in two ways: directly through `StreamableHTTPClientTransport` and `StreamableHTTPServerTransport`, or indirectly as a dependency of an AI agent library, like `@openai/agents`.

## Setup

```zsh
npm ci
cp env.sample .env
# Fill out NEW_RELIC_LICENSE_KEY and OPENAI_API_KEY
```

## AI Agent Example

One use case of the MCP StreamableHTTP transport is using an agentic AI library, like `@openai/agents`. Included in this repo is a small `@openai/agents` example that connects to a remote server and calls a tool.

```zsh
npm run openai
```

## Local Server Example

To test the other MCP client methods, like `readResource` and `getPrompt`, use the stateless StreamableHTTP server and client with a robust command-line interface.

```zsh
npm run server
# In a seperate terminal
npm run client
# When client CLI prompts you, enter:
call-tool start-notification-stream # to test client.callTool
get-prompt greeting-template {"name":"World"} # to test client.getPrompt
read-resource https://example.com/greetings/default # to test client.readResource
```
