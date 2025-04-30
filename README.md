<a href="https://opensource.newrelic.com/oss-category/#example-code"><picture><source media="(prefers-color-scheme: dark)" srcset="https://github.com/newrelic/opensource-website/raw/main/src/images/categories/dark/Example_Code.png"><source media="(prefers-color-scheme: light)" srcset="https://github.com/newrelic/opensource-website/raw/main/src/images/categories/Example_Code.png"><img alt="New Relic Open Source example project banner." src="https://github.com/newrelic/opensource-website/raw/main/src/images/categories/Example_Code.png"></picture></a>

# New Relic Node.js Examples

This repository contains example applications and scripts that demonstrate functionality of the [New Relic Node.js Agent](https://github.com/newrelic/node-newrelic).

* [AI Monitoring](./ai-monitoring) - examples using supported 3rd party libraries to produce AI Monitoring (AIM) telemetry
* [Logs in Context](./application-logging) - examples using logging libraries to demonstrate agent log decoration and forwarding of logs to New Relic
* [Code Level Metrics](./code-level-metrics) - example demonstrating span attributes that help drive the [CodeStream](https://newrelic.com/codestream) integration
* [Custom Instrumentation](./custom-instrumentation) - examples demonstrating the use of the [Node.js agent API](https://newrelic.github.io/node-newrelic/API.html)
* [Elasticsearch](./elasticsearch) - example demonstrating elasticsearch with Node.js agent
* [Error Fingerprinting](./error-fingerprinting) - example using [setErrorCallback](https://newrelic.github.io/node-newrelic/API.html#setErrorGroupCallback) and [noticeError](https://newrelic.github.io/node-newrelic/API.html#noticeError) to [group errors](https://docs.newrelic.com/docs/errors-inbox/errors-inbox/#error-groups) produced in Node.js applications
* [ESM](./esm-app) - example demonstrating how to load the agent in an [ESM](https://nodejs.org/api/esm.html) application. It also demonstrates how to register custom instrumentation for an ESM package.
* [GraphQL Dataloader](./graphql-koa-dataloader) - example using Apollo Server, koa and GraphQL dataloader
* [Kafkajs](./kafkajs) - example demonstrating [kafkajs](https://kafka.js.org/) with the Node.js agent
* [Knex](./knex) - example demonstrating knex with the Node.js agent
* [Mock Infinite Tracing Server](./mock-infinite-tracing-server) - mock gRPC server to use to locally test [infinite tracing](https://docs.newrelic.com/docs/distributed-tracing/infinite-tracing/introduction-infinite-tracing/) with a Node.js applciation
* [Nest](./nestjs) - examples demonstrating NestJS with the Node.js agent
* [Next.js](./nextjs) - examples demonstrating Next.js with the Node.js agent
* [Prisma](./prisma-app) - example demonstrating Prisma with the Node.js agent
* [Sequelize](./sequelize-app) - example demonstrating sequelize with the Node.js agent
* [Express](./simple-express-app) - example demonstrating express with the Node.js agent
* [Source Maps](./source-maps) - typescript example using [--enable-source-maps](https://nodejs.org/dist/latest-v22.x/docs/api/cli.html#--enable-source-maps) to demonstrate proper stack traces the Node.js agent produces

## OpenTelemetry Bridge Examples

When the Node.js agent is configured for OpenTelemetry bridge mode, it can instrument all libraries OTel instruments.

* [GCP Pub/Sub](./gcp-pubsub) - example demonstrating [Google Cloud Pub/Sub](https://cloud.google.com/pubsub) with the Node.js agent in OTel bridge mode
* [GraphQL](./opentelemetry-graphql) - example demonstrating `apollo`, `express`, and namely `graphql` with the agent in OTel bridge mode
* [Messaging](./opentelemetry-messaging) - consumer/producer example demonstrating `amqplib` with the agent in OTel bridge mode
* [Web Example](./opentelemetry-example) - example demonstrating `knex`, `express`, and `fetch` in a simple web app with the agent in OTel bridge mode

## Contribute

We encourage your contributions to improve New Relic Node.js Examples. Please keep in mind that when you submit your pull request, you'll need to sign the CLA via the click-through using CLA-Assistant. You only have to sign the CLA one time per project.

If you have any questions, or to execute our corporate CLA (which is required if your contribution is on behalf of a company), drop us an email at opensource@newrelic.com.

**A note about vulnerabilities**

As noted in our [security policy](../../security/policy), New Relic is committed to the privacy and security of our customers and their data. We believe that providing coordinated disclosure by security researchers and engaging with the security community are important means to achieve our security goals.

If you believe you have found a security vulnerability in this project or any of New Relic's products or websites, we welcome and greatly appreciate you reporting it to New Relic through [our bug bounty program](https://docs.newrelic.com/docs/security/security-privacy/information-security/report-security-vulnerabilities/).

If you would like to contribute to this project, review [these guidelines](./CONTRIBUTING.md).

To [all contributors](https://github.com/newrelic/newrelic-node-examples/graphs/contributors), we thank you!

## License

New Relic Node.js Examples is licensed under the [Apache 2.0](http://apache.org/licenses/LICENSE-2.0.txt) License.
