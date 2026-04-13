## AI Monitoring

Example applications that demonstrate [New Relic AI Monitoring](https://docs.newrelic.com/docs/ai-monitoring/intro-to-ai-monitoring/) across a variety of LLM SDKs and agentic AI frameworks.

### LLM SDKs

When you enable AI monitoring, the New Relic Node.js agent can give you end-to-end visibility into performance, cost, and quality of [supported models](https://docs.newrelic.com/docs/apm/agents/nodejs-agent/getting-started/compatibility-requirements-nodejs-agent/#ai-monitoring-support) from vendors like OpenAI, Bedrock and Google Gemini. Explore how users interact with an AI assistant, dig into trace-level details about a model's response to an AI event, and compare the performance of different models across app environments.

Learn more about this feature on [our docs website](https://docs.newrelic.com/docs/ai-monitoring/intro-to-ai-monitoring/).

* [Anthropic](./anthropic) - Anthropic SDK example for chat completions, streaming, error instrumentation, and feedback recording.
* [AWS Bedrock](./aws-bedrock-app) - Native AWS Bedrock SDK example for chat completions, streaming, embeddings, and the Converse API across multiple LLM models.
* [Gemini AI](./google-genai) - Google GenAI (`@google/genai`) example for chat completions and embeddings supporting both Gemini AI and Vertex AI.
* [LangChain + AWS](./langchain-aws) - LangChain.js (`@langchain/aws`) example using AWS Bedrock for chat completions, streaming, and embeddings via the Converse API.
* [LangChain + OpenAI](./langchain-openai) - LangChain.js example using OpenAI for chat completions, streaming, vector stores (in-memory and Elasticsearch), and tool use.
* [OpenAI](./openai) - OpenAI SDK example for chat completions (Chat Completions and Responses APIs), streaming, and embeddings.

### Agentic AI

Enabling AI monitoring also lets you observe the performance of your AI agents end-to-end. When your application runs a multi-step agentic workflow, New Relic captures the full execution, every agent invocation, every tool call, every handoff, so you can understand what happened, where it slowed down, and where something went wrong.

Learn more about this feature on [our docs website](https://docs.newrelic.com/docs/ai-monitoring/explore-ai-data/view-ai-agents/).

* [Google ADK](./google-adk) - Google Agent Development Kit (`@google/adk`) example with single-agent, multi-agent hierarchy, and streaming endpoints backed by Gemini.
* [LangGraph](./langgraph) - LangGraph example using OpenAI for agent-based workflows with tools, a simple chatbot, and streaming.
* [MCP SDK](./mcp-sdk) - Two `@modelcontextprotocol/sdk` examples: `stdio` uses `@openai/agents` with `StdioTransport`, and `streamable-http` demonstrates `StreamableHTTPTransport` directly and via `@openai/agents`.
