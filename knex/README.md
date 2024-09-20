# Knex/Express Example Application 

This is an example app that uses the [New Relic hybrid agent](https://github.com/newrelic/newrelic-node-opentelemetry-integration) to demonstrate how to create both New Relic and OpenTelemetry spans.  


## Setup
**Note**: This is used to demonstrate behavior between the New Relic Node.js agent and hybrid agent. The hybrid agent is currently only available to New Relic employees.

### Get hybrid agent

```sh
git clone git@github.com:newrelic/newrelic-node-opentelemetry-integration.git 
npm install
npm link
```

```sh
npm install
cp env.sample .env
# Fill out `NEW_RELIC_LICENSE_KEY`
npm link @newrelic/opentelemetry-integration
docker compose up -d
npm run db:migrate
npm run db:seed
npm start
```

## Exploring Telemetry
More to come later...
