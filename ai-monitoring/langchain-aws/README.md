# Sample AWS Bedrock Application

## Getting started

**Note**: This application requires the use of Node.js v20+.

1. Clone or fork this repository.
2. Install dependencies and run application

```sh
npm i
cp .env.sample .env
# Fill out `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `NEW_RELIC_LICENSE_KEY` in .env. Save your changes.
npm start
```

1. Make requests to application.

```sh
# chat completions
curl -XPOST -H 'Content-Type: application/json' http://localhost:3000/chat-invoke -d '{"message":"How much wood could a woodchuck chuck if a woodchuck could chuck wood?", "model": "us.amazon.nova-micro-v1:0"}'

# chat completions stream
curl -XPOST -H 'Content-Type: application/json' http://localhost:3000/chat-stream -d '{"message":"Explain the rules of jai alai", "model": "us.amazon.nova-micro-v1:0"}'

# embedding with vector search
curl -XPOST -H 'Content-type: application/json' http://localhost:3000/embedding -d '{"message":"Test embedding", "model": "amazon.titan-embed-text-v1"}'
```
