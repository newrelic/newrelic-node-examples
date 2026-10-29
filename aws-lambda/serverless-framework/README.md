# AWS Lambda with the Serverless Framework

This example deploys a hello world Node.js function ([hello-world.js](./hello-world.js)) to AWS Lambda with the [Serverless Framework](https://www.serverless.com/). The [serverless-newrelic-lambda-layers](https://github.com/newrelic/serverless-newrelic-lambda-layers) plugin instruments it with the [New Relic Lambda layer](https://docs.newrelic.com/docs/serverless-function-monitoring/aws-lambda-monitoring/get-started/introduction-new-relic-monitoring-aws-lambda/), which includes the Node.js agent and the New Relic Lambda extension.

The function also increments an [OpenTelemetry](https://opentelemetry.io/) counter on every invocation, which the agent reports to New Relic through its OpenTelemetry bridge.

## Prerequisites

* [AWS CLI v2](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
* An AWS account you can deploy Lambda functions and CloudFormation stacks to
* Node.js and npm
* A New Relic account id and license key
* Serverless Framework v4 requires an account. Run `npx serverless login` once, or set `SERVERLESS_ACCESS_KEY`.

## 1. Log in to AWS

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

## 2. Configure New Relic

```sh
cp env.sample .env
# Set NEW_RELIC_ACCOUNT_ID and NEW_RELIC_LICENSE_KEY in .env
```

Serverless Framework v4 loads `.env` automatically. You can also `export` these variables in your shell.

If you are a New Relic employee and want to use staging, set `NEW_RELIC_ENVIRONMENT=staging` and use your staging account id and license key.

## 3. Deploy

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

## 4. Invoke

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

## 5. Clean up

```sh
npm run remove
```

## OpenTelemetry metrics

[serverless.yml](./serverless.yml) enables the agent's OpenTelemetry bridge and metrics with `NEW_RELIC_OPENTELEMETRY_ENABLED` and `NEW_RELIC_OPENTELEMETRY_METRICS_ENABLED`. [hello-world.js](./hello-world.js) adds 1 to the `integers` counter of the `lambda-meter` meter on every invocation.

`@opentelemetry/api` is a dev dependency and is not packaged with the function. At runtime it resolves from the New Relic layer, so the handler uses the same copy of the API that the agent registers its meter provider on. If you package your own copy, make sure its version is not newer than the one in the layer, or the counter will be a no-op.
