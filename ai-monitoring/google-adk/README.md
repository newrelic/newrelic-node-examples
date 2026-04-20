# Google ADK Example App

A simple example application using the [Google Agent Development Kit (ADK)](https://github.com/google/adk-node) (`@google/adk`) with New Relic AI Monitoring.

This app demonstrates agent and tool ecosystems that exercise the following instrumentation points:

- **LlmAgent events** via direct instrumentation of `BaseAgent.prototype.runAsync`
- **LlmTool events** via direct instrumentation of `FunctionTool.prototype.runAsync`
- **LlmChatCompletionSummary / LlmChatCompletionMessage events** via instrumentation of the underlying LLM call path, in this case Gemini

## Setup

### Create a Google Cloud Project

You may skip this section if you already have a Google Cloud project created.

1. Download the [Google Cloud CLI](https://cloud.google.com/sdk/docs/install).
2. Create or select a [Google Cloud Project](https://console.cloud.google.com/). Make sure that project has billing enabled and has permissions for Vertex AI and ADK use.

### Run the Example Application

1. Copy `.env` and fill in `NEW_RELIC_LICENSE_KEY`, `NEW_RELIC_HOST` (if applicable), `GOOGLE_CLOUD_PROJECT` and `GOOGLE_CLOUD_LOCATION`. Double check `GOOGLE_CLOUD_LOCATION` because some LLMs are not available in all regions.

   For more information, you can see Google's guide for the Python version [here](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/live-api/get-started-adk).

   ```sh
   cp env.sample .env
   ```
3. Install dependencies:

   ```sh
   npm install
   ```
4. Start the app:

   ```sh
   npm start
   ```

## Endpoints

### `POST /agent`

Single `LlmAgent` with three `FunctionTool` instances (calculator, weather, search).

```sh
curl -X POST http://localhost:3000/agent \
  -H 'Content-Type: application/json' \
  -d '{"message": "What is 25 multiplied by 4?"}'
```

### `POST /agent-stream`

Streaming output from a single agent with tools, showing step-by-step execution.

```sh
curl -X POST http://localhost:3000/agent-stream \
  -H 'Content-Type: application/json' \
  -d '{"message": "Search for information about Google ADK and tell me the weather in Tokyo."}'
```

### `POST /multi-agent`

Multi-agent hierarchy: an `OrchestratorAgent` delegates to a `MathAgent` (with calculator tool) and a `ResearchAgent` (with weather + search tools). This exercises multiple `BaseAgent.prototype.runAsync` calls across parent and sub-agents.

The `/multi-agent` endpoint is particularly useful for testing hierarchical agent instrumentation — it triggers `runAsync` on the parent `OrchestratorAgent` which in turn triggers `runAsync` on `MathAgent` and `ResearchAgent` sub-agents, producing nested segments in a single transaction trace.

```sh
curl -X POST http://localhost:3000/multi-agent \
  -H 'Content-Type: application/json' \
  -d '{"message": "What is 15 plus 27, and what is the weather in London?"}'
```

### `POST /feedback`

Record LLM feedback events via New Relic.

```sh
curl -X POST http://localhost:3000/feedback \
  -H 'Content-Type: application/json' \
  -d '{"id": "<feedbackId from above>", "rating": 5, "category": "accuracy", "message": "Great response"}'
```

## Instrumentation details

### Instrumentation points

| ADK method                          | NR event type                | Key data captured                                 |
| ----------------------------------- | ---------------------------- | ------------------------------------------------- |
| `BaseAgent.prototype.runAsync`    | `LlmAgent`                 | agent name, description, conversation ID, error   |
| `FunctionTool.prototype.runAsync` | `LlmTool`                  | tool name, description, input args, output, error |
| LLM call path                       | `LlmChatCompletionSummary` | model, token counts, finish reason, duration      |
| LLM call path                       | `LlmChatCompletionMessage` | role, content, sequence, completion ID            |

### Subcomponent linking

Agent and tool spans carry a `subcomponent` span attribute that the NR UI uses to link events to their parent trace:

- Agent spans: `{"type": "APM-AI_AGENT", "name": "<agentName>"}`
- Tool spans: `{"type": "APM-AI_TOOL", "name": "<toolName>"}`
