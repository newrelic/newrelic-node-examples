# Sample Kafkajs application 

This example provides both a kafkajs producer and a background consumer.

## Getting started
**Note**: This application requires the use of Node.js v20+ and docker.

 1. Clone or fork this repository.

 1. Setup the kafka containers

```sh
docker compose up -d 
```

 1. Install dependencies and run application

```sh
npm ci
cp env.sample .env
# Fill out `NEW_RELIC_LICENSE_KEY` in .env and save 
# Start the producer
npm start
# Start the consumer in a different shell
npm run start:consumer
```

 1. Make requests to application. The consumer subscribes to two topics: `test-topic` and `other-topic`.

 ```sh
curl --location 'http://localhost:3000/message' \
--header 'Content-Type: application/json' \
--data '{
    "topic": "test-topic",
    "messages": [
        {
            "key":"key1",
            "value":"This is a sample message",
            "headers": {
                "x-custom-header": "custom-value"
            }
        },
        {
            "key": "key1",
            "value": "Hello from the other side"
        },
        {
            "key": "key2",
            "value": "Greetings!"
        }
    ]
}'
```

***You can change the number of messages sent by editing the curl post above.*** 

## Exploring Telemetry
After sending a few requests, navigate to your application in `APM & Services`.  Select `Distributed tracing`. The producer is run within a fastify handler. A transaction will be created and spans for the middleware handler as well as the sending of messages. Since the consumer is running and handling message consumption, Distributed Tracing will link the two entities.

![Producers spans](./images/producer-spans.png?raw=true "Producer spans")

For every consumption of a message a transaction is created.

![Consumer transaction](./images/consumer-tx.png?raw=true "Consumer transaction")

### Metric exploration
Metrics are captured for the number of messages and byte size of messages by running this query

```
SELECT count(newrelic.timeslice.value) FROM Metric WHERE metricTimesliceName LIKE 'Message/Kafka/Topic/Named/%/Received/%' AND `entity.guid` = '<entity-guid>' FACET metricTimesliceName TIMESERIES SINCE 1 day ago
```

![message metrics](./images/message-metrics.png?raw=true "Message metrics")

### Transaction attributes
`kafka.consume.byteCount` and `kafka.consume.client_id` are tracked per transaction. Run this query:

```
FROM Transaction select name, kafka.consume.byteCount, kafka.consume.client_id where appName = 'kafka-consumer'
```
