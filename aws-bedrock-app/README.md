# Sample AWS Bedrock Application

## Getting started
**Note**: This application requires the use of Node.js v20+.

 1. Clone or fork this repository.

 1. Install dependencies and run application

```sh
npm ci
cp .env.sample .env
# Fill out `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in .env and save 
npm start
```

 1. Make requests to application.

 ```sh
# make a request to chat completions - provide a model to use or the default amazon-titan model will be used
# model options are: amazon-titan, anthropic, ai21, cohere
curl -XPOST -H 'Content-Type: application/json' http://localhost:3000/chat-completion -d '{"message":"How much would could a woodchuck chuck if a woodchuck could chuck wood?", "model": "amazon-titan"}'

# model options are: amazon-titan, anthropic, cohere
curl -XPOST -H 'Content-Type: application/json' http://localhost:3000/chat-completion-stream -d '{"message":"Explain the rules of jai alai"}'

curl -XPOST http://localhost:3000/embedding
```