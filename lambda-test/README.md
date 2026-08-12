# Local Lambda Tests
This application uses a [lambda runtime container](https://gallery.ecr.aws/lambda/nodejs)
to simulate running a Node.js function in Lambda with or without the New Relic
Node.js agent.

## Setup

```sh
cp env.sample .env
# If you want to change the type of handler invoked, change `FUNCTION_MODE`
# Supported values: `async`, `context`, `cb`, `streaming`. 
# If you want to run lambda without the agent set `NEW_RELIC_ENABLED` to `false`
# Build container
docker build -t lambda-test .
```

## Run test

Start container and make a request to it.

```sh
docker run -p 9900:8080 -p 9229:9229 --env-file .env lambda-test:latest
```

```sh
curl -XPOST "http://localhost:9900/2015-03-31/functions/function/invocations" -d '{"payload":"hello world!"}'
```

Or, as a complete example:

```sh
docker build --tag lambda-test . && \
docker run --rm -p 9900:8080 -p 9229:9229 --name lambda --env-file .env lambda-test:latest && \
docker image rm lambda-test
```

Running the above will compile the image, start the container, and then
remove the container plus image once <kbd>ctrl</kbd>+<kbd>c</kbd> is pressed.

## Notes
If you want to install the latest agent and not rely on a locally installed
agent, uncomment the following line from Dockerfile.

```sh
#RUN npm install
```

## Testing Open Telemetry Metrics

To test that the New Relic agent's Open Telemetry (OTEL) metrics support works,
the following environment variables must be added to the `.env` file:

```sh
NEW_RELIC_OPENTELEMETRY_ENABLED=true
NEW_RELIC_OPENTELEMETRY_METRICS_ENABLED=true
```
Additionally, the `async` handler must be used (`FUNCTION_MODE=async`).
