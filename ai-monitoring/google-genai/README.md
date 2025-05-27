# Sample Google GenAI Application

This application demonstrates using the agent to instrument `@google/gen-ai` and record spans for chat completions and embeddings.  It also will generate LlmChatCompletionMessage, LlmChatCompletionSummary, LlmEmbedding, and LlmFeedbackMessage to be used in the [New Relic AI Monitoring](https://newrelic.com/platform/ai-monitoring).

This app supports both Gemini AI and Vertex AI. Specify with one you want with environment variable `GOOGLE_GENAI_USE_VERTEXAI`.

## Getting started

**Note**: This application requires the use of Node.js v20+.

1. Clone or fork this repository.
2. Install dependencies and run application

```sh
npm i
cp env.sample .env
# Fill out `GEMINI_API_KEY`, `GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION`, `NEW_RELIC_LICENSE_KEY` in .env and save 
npm start
```

1. Make requests to application.

```sh
curl http://localhost:3000/ # Basic generate content example
curl http://localhost:3000/stream # Generate content stream example
curl http://localhost:3000/embed # Embed content example
```
