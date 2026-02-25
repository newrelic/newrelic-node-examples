# Example OpenAI Application

This application demonstrates using the agent to instrument OpenAI and record spans for chat completions and embeddings.  It also will generate `LlmChatCompletionMessage`, `LlmChatCompletionSummary`, `LlmEmbedding`, and `LlmFeedbackMessage` events to be used in the [New Relic AI Monitoring](https://newrelic.com/platform/ai-monitoring) experience.

## Getting started

**Note**: This application requires the use of Node.js v20+.

1. Clone or fork this repository.
2. Install dependencies and run application

```sh
npm ci
cp .env.sample .env
# Fill out `OPENAI_API_KEY` and `NEW_RELIC_LICENSE_KEY` in .env and save 
npm start
```



## Make requests to application

### Chat Completions API

**Note**: The default chat model is `gpt-5.2`. GPT-5 family models do not support the `temperature` parameter; if you pass it, the API will return an error. Only use `temperature` with models that support it (e.g. `gpt-4`).

`POST /chat-completion` - Accepts `{ message, model, temperature }`

```sh
curl -XPOST -H 'Content-Type: application/json' http://localhost:3000/chat-completion \
  -d '{"message":"How much wood could a woodchuck chuck if a woodchuck could chuck wood?"}'
```

With a model that supports `temperature`:

```sh
curl -XPOST -H 'Content-Type: application/json' http://localhost:3000/chat-completion \
  -d '{"message":"Tell me a joke", "model":"gpt-4o", "temperature":0.5}'
```

`POST /chat-completion-stream` - Accepts `{ message, model, temperature }`

```sh
curl -XPOST -H 'Content-Type: application/json' http://localhost:3000/chat-completion-stream \
  -d '{"message":"Explain the rules of jai alai"}'
```

### Responses API

`POST /responses-create` - Accepts `{ message, model }`

```sh
curl -XPOST http://localhost:3000/responses-create
curl -XPOST -H 'Content-Type: application/json' http://localhost:3000/responses-create \
  -d '{"message":"What is the capital of France?"}'
```

`POST /responses-create-stream` - Accepts `{ message, model }`

```sh
curl -XPOST http://localhost:3000/responses-create-stream
curl -XPOST -H 'Content-Type: application/json' http://localhost:3000/responses-create-stream \
  -d '{"message":"Tell me a story", "model":"gpt-5.2"}'
```

### Embeddings

`POST /embedding` - Accepts `{ input, model }`

```sh
curl -XPOST http://localhost:3000/embedding
curl -XPOST -H 'Content-Type: application/json' http://localhost:3000/embedding \
  -d '{"input":"Hello world", "model":"text-embedding-3-small"}'
```

### Feedback

`POST /feedback` - Accepts `{ id, category, rating, message, metadata }`

After making a chat completion or response request, copy the `id` from the response to submit feedback:

```sh
curl -XPOST -H 'Content-Type: application/json' http://localhost:3000/feedback \
  -d '{"id":"<response_id>"}'
curl -XPOST -H 'Content-Type: application/json' http://localhost:3000/feedback \
  -d '{"id":"<response_id>", "category":"feedback-test", "rating":1, "message":"Good talk"}'
```

## Inspecting AI Responses

After sending a few requests, navigate to your application in `APM & Services`.  Select `AI Monitoring` > `AI Responses`:

![AI Responses Landing](./images/ai-home.png?raw=true "AI Responses Landing")

If you click the details of a response you will see metrics, trace information and LLM specific information:

![AI Response](./images/response-details.png?raw=true "AI Response Details")

Click the metadata tab to see more information about the raw events:

![AI Response Meta](./images/response-metadata.png?raw=true "AI Response Meta")
