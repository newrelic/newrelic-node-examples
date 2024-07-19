# Sample distributed tracing application 

This example provides both a BullMQ producer and consumer with a redis instance. 

The producer starts a transaction, adds headers into the transaction and then adds those headers as part of the job data to be added to the queue. The producer and the new relic agent will shutdown after 10 seconds. 

The consmers start a transaction, processes the jobs from the queue and links the transaction from the producer by accepting its headers that were added as part of the job data. The producer and the new relic agent will shutdown after 60 seconds. 

## Getting started
**Note**: This application requires the use of Node.js v20+ and docker.

 1. Clone or fork this repository.

 2. Setup the redis container

    ```sh
    docker compose up -d 
    ```

 3. Install dependencies and run application

    ```sh
    npm ci
    cp env.sample .env
    # Fill out `NEW_RELIC_LICENSE_KEY` in .env and save 
    # Start the consumer
    npm run start:consumer
    # Start the producer in a different shell
    npm run start:producer
    ```
***You can change the number of messages sent by editing the time in setTimeout in both the producer and the consumer.*** 

## Exploring Telemetry
After the producers sends a few messages and the consumers processes them, navigate to your application in `APM & Services`.  Select `Distributed tracing`. A transaction will be created and spans for the messages sent and processed. Since the consumer is running and handling message consumption, Distributed Tracing will link the two entities.

![Producer distributed tracing](./images/producer-dt.png?raw=true "Producer distributed tracing")
![Producer distributed trace](./images/producer-dt-trace.png?raw=true "Producer distributed trace")

The producer service map shows two entities: the producer and consumer. 
![Producer service map](./images/producer-service-map.png?raw=true "Producer service map")

You will see a distributed trace and a service map for the consumer as well. 

![Consumer distributed tracing](./images/consumer-dt.png?raw=true "Consumer distributed tracing")

The consumer service map shows two entities (the producer and the consumer) and a redis instance. 
![Consumer service map](./images/consumer-service-map.png?raw=true "Consumer service map")