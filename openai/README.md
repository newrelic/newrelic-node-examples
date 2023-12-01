# Sample OpenAI Application
This application demonstrates using the agent to instrument openai and record spans for chat completions and embeddings.  It also will generate LlmChatCompletionMessage, LlmChatCompletionSummary, LlmEmbedding, and LlmFeedbackMessage to be used in the [New Relic AI Monitoring](https://newrelic.com/platform/ai-monitoring).


## Getting started

 1. Clone or fork this repository.

 1. Install dependencies and run application

```sh
npm ci
cp .env.sample .env
# Fill out `OPENAI_API_KEY` and `NEW_RELIC_LICENSE_KEY` in .env and save 
npm start
```

 1. Make requests to application.

```sh
curl -XPOST http://localhost:3000/embedding

curl -XPOST -H 'Content-Type: application/json' http://localhost:3000/chat-completion -d '{"message":"How much would could a woodchuck chuck if a woodchuck could chuck wood?"}'

# To leave feedback copy the id from response
curl -XPOST -H 'Content-Type: application/json' http://localhost:3000/feedback -d '{"id":"<response_id>"}'

curl -XPOST -H 'Content-Type: application/json' http://localhost:3000/chat-completion-stream -d '{"message":"Explain the rules of jai alai"}'

# To leave feedback copy the id from response
curl -XPOST -H 'Content-Type: application/json' http://localhost:3000/feedback -d '{"id":"<response_id>"}'
```

## Inspecting AI Responses
After sending a few requests, navigate to your application in `APM & Services`.  Select `AI Monitoring` > `AI Responses`:

![AI Responses Landing](./images/ai-home.png?raw=true "AI Responses Landing")

If you click the details of a response you will see metrics, trace information and LLM specific information:


![AI Response](./images/response-details.png?raw=true "AI Response Details")

Click the metadata tab to see more information about the raw events:


![AI Response Meta](./images/response-metadata.png?raw=true "AI Response Meta")

