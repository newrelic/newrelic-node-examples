# Anthropic AI Monitoring Example

A simple Fastify application demonstrating New Relic AI monitoring with the Anthropic SDK.

## Setup

```sh
cp env.sample .env
```

Fill in your `ANTHROPIC_API_KEY`, `ANTHROPIC_BASE_URL` (if needed), `NEW_RELIC_LICENSE_KEY`, and  `NEW_RELIC_HOST` (if needed) in `.env`, then:

```sh
npm ci
npm start
```

## Endpoints

### Chat Completion

```sh
curl -X POST http://localhost:3000/chat-completion \
  -H 'Content-Type: application/json' \
  -d '{"message": "Write a haiku about coding"}'
```

### Streaming Chat Completion

```sh
curl -X POST http://localhost:3000/chat-completion-stream \
  -H 'Content-Type: application/json' \
  -d '{"message": "Write a short story about a developer who discovers their code has become sentient"}'
```

### Error Endpoints

Endpoints for testing error instrumentation. Each triggers a different Anthropic SDK error type:

- **UnprocessableEntityError (422)** — invalid model name
  ```sh
  curl -X POST http://localhost:3000/error/unprocessable
  ```
- **APIConnectionError** — non-routable host (will timeout)
  ```sh
  curl -X POST http://localhost:3000/error/connection
  ```

### Record Feedback

Use the `id` from a chat completion response:

```sh
curl -X POST http://localhost:3000/feedback \
  -H 'Content-Type: application/json' \
  -d '{"id": "<response_id>", "rating": 5, "message": "Great response"}'
```

## Inspecting in New Relic

Navigate to **AI Monitoring** in your New Relic account to see AI response data, traces, and feedback events.
