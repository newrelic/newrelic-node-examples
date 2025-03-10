# Local Lambda Tests
This application uses a lambda runtime container to simulate running a Node.js function in Lambda with(out) the New Relic Node.js agent.

## Setup

```sh
cp env.sample .env
# If you want to change the type of handler invoked, change `FUNCTION_MODE`
# Supported values: `async`, `context`, `cb`, `streaming`. 
# If you want to run lambda without agent set `NEW_RELIC_ENABLED` to `false`
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

## Notes
If you want to install the latest agent and not rely on a locally installed agent, uncomment the following line from Dockerfile.

```sh
#RUN npm install
```
