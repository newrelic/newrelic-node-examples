# Sample LangChain/OpenAI Application
This application demonstrates using the agent to instrument langchain and record spans for chat completions and embeddings.  It also will generate LlmChatCompletionMessage, LlmChatCompletionSummary, LlmEmbedding, and LlmFeedbackMessage to be used in the [New Relic AI Monitoring](https://newrelic.com/platform/ai-monitoring).


## Getting started
**Note**: This application requires the use of Node.js v20+.

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

curl -XPOST -H 'Content-Type: application/json' http://localhost:3000/chat-completion -d '{"message":"How much wood could a woodchuck chuck if a woodchuck could chuck wood?"}'

curl -XPOST -H 'Content-Type: application/json' http://localhost:3000/chat-completion-stream -d '{"message":"Explain the rules of jai alai"}'

curl -X POST -H "Content-Type: application/json" http://localhost:3000/memory_vector -d '{"message":"Describe a bridge", "results": 1}' 

curl -X POST -H "Content-Type: application/json" http://localhost:3000/memory_vector -d '{"message":"Describe a tunnel", "results": 1}'

curl -X POST -H "Content-Type: application/json" http://localhost:3000/tools -d '{"message":"midge"}'

curl -X POST -H "Content-Type: application/json" http://localhost:3000/tools -d '{"message":"chunnel"}'

# start an ElasticSearch container and make requests to the vector store: 

docker-compose up -d --build 

curl -X POST -H "Content-Type: application/json" http://localhost:3000/elastic_vector -d '{"message":"Describe a bridge", "results": 1}'

curl -X POST -H "Content-Type: application/json" http://localhost:3000/elastic_vector -d '{"message":"Describe a bridge", "results": 1}'

# To leave feedback for any of the above, copy the feedback id from response
curl -XPOST -H 'Content-Type: application/json' http://localhost:3000/feedback -d '{"id":"<response_id>"}'
 
```

## Inspecting AI Responses
After sending a few requests, navigate to your application in `APM & Services`.  Select `AI Monitoring` > `AI Responses`:

![AI Responses Landing](./images/ai-home.png?raw=true "AI Responses Landing")

If you click the details of a response you will see metrics, trace information and LLM specific information:


![AI Response](./images/response-details.png?raw=true "AI Response Details")

Click the metadata tab to see more information about the raw events:


![AI Response Meta](./images/response-metadata.png?raw=true "AI Response Meta")

