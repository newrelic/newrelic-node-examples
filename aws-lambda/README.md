# AWS Lambda Examples

* [Serverless Framework](./serverless-framework) - deploys a hello world function to AWS Lambda with the [Serverless Framework](https://www.serverless.com/), instrumented with the [New Relic Lambda layer](https://docs.newrelic.com/docs/serverless-function-monitoring/aws-lambda-monitoring/get-started/introduction-new-relic-monitoring-aws-lambda/). It also reports an OpenTelemetry counter through the agent's OpenTelemetry bridge.
* [Local container](./local-container) - runs Node.js Lambda handlers locally in a [Lambda runtime container](https://gallery.ecr.aws/lambda/nodejs), with or without the New Relic Node.js agent and Lambda extension. Used by the Node.js agent team for testing.
