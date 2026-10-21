# Lambda Tests
This application can be used two ways:

* [Deploy to AWS](#deploy-to-aws): deploys a hello world Node.js function (`hello-world.js`) to AWS Lambda, instrumented with the [New Relic Lambda layer](https://docs.newrelic.com/docs/serverless-function-monitoring/aws-lambda-monitoring/get-started/introduction-new-relic-monitoring-aws-lambda/) via the [Serverless Framework](https://www.serverless.com/) and [serverless-newrelic-lambda-layers](https://github.com/newrelic/serverless-newrelic-lambda-layers) plugin.
* [Run locally](#run-locally): uses a [lambda runtime container](https://gallery.ecr.aws/lambda/nodejs) to simulate running a Node.js function in Lambda with or without the New Relic Node.js agent.

## Deploy to AWS

### Prerequisites

* [AWS CLI v2](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
* An AWS account you can deploy Lambda functions and CloudFormation stacks to
* A New Relic account id and license key
* Serverless Framework v4 requires an account. Run `npx serverless login` once, or set `SERVERLESS_ACCESS_KEY`.

### 1. Log in to AWS

If you haven't set up an SSO profile yet, create one first (only needed once). This example names the profile `test`:

```sh
aws configure sso --profile test
# SSO session name: <anything, e.g. my-sso>
# SSO start URL: https://<your-org>.awsapps.com/start
# SSO region: <region your SSO is in, e.g. us-east-1>
# Then pick the account + role to use, and set the default region
```

Log in. Do this again whenever your session expires:

```sh
aws sso login --profile test

# Verify you're logged in to the right account
aws sts get-caller-identity --profile test

# Make the profile the default for the rest of this shell
export AWS_PROFILE=test
export AWS_REGION=us-east-1
```

If you use access keys instead of SSO, run `aws configure --profile test` and skip `aws sso login`.

### 2. Configure New Relic

```sh
cp env.sample .env
# Set NEW_RELIC_ACCOUNT_ID and NEW_RELIC_LICENSE_KEY in .env
```

Serverless Framework v4 loads `.env` automatically. You can also `export` these variables in your shell.

If you are a New Relic employee and want to use staging, set `NEW_RELIC_ENVIRONMENT=staging` and use your staging account id and license key.

### 3. Deploy

```sh
npm install
npm run deploy
# or pass the profile/region/stage explicitly
npx serverless deploy --aws-profile test --region us-east-1 --stage dev
```

To have the function invoked every minute by an EventBridge schedule, deploy with `ENABLE_SCHEDULE=true`:

```sh
ENABLE_SCHEDULE=true npm run deploy
```

Deploy again without it to turn the schedule off, or run `npm run remove` to delete everything.

This creates a CloudFormation stack `lambda-test-<stage>` with a function named `lambda-test-<stage>-hello`. The plugin adds the latest New Relic layer for your region and runtime, and points the function handler at the New Relic wrapper, which then calls `hello-world.handler`.

To deploy again after you change `hello-world.js`, use `npm run deploy` or, for a faster code-only update:

```sh
npx serverless deploy function --function hello
```

### 4. Invoke

```sh
npm run invoke
# or with the AWS CLI
aws lambda invoke \
  --function-name lambda-test-dev-hello \
  --payload '{"payload":"hello world!"}' \
  --cli-binary-format raw-in-base64-out \
  --profile test \
  --region us-east-1 \
  response.json && cat response.json
```

Tail the function logs:

```sh
npm run logs
```

After a few invocations, the function shows up in New Relic under **APM & Services** (or under **Serverless functions** if you comment out `apm: true` in [serverless.yml](./serverless.yml)).

### 5. Clean up

```sh
npm run remove
```

## Run locally

### Setup

```sh
cp env.sample .env
# If you want to change the type of handler invoked, change `FUNCTION_MODE`
# Supported values: `async`, `context`, `cb`, `streaming`.
# If you want to run lambda without the agent set `NEW_RELIC_ENABLED` to `false`
# Build container
docker build -t lambda-test .
```

### Run test

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

### Notes
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

To verify that OTEL metrics data was actually delivered, as of 2026-10, you 
must use an API key to issue the following query as the UI for this has not
yet been built (adjust accordingly):

```sh
curl -s https://staging-api.newrelic.com/graphql \
  -H "API-Key: <NRAK-user-key>" -H 'Content-Type: application/json' \
  -d '{"query":"{ actor { account(id: 310705) { nrql(query: \"SELECT count(*) FROM Transaction WHERE appName = '\''jsumners-playground'\'' SINCE 30 minutes ago\") { results } } } }"}'
```
