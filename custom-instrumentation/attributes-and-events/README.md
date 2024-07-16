# Sample Attributes & Events Application

This example provides an application to demonstrate how to share custom attributes and events. This application is helpful for users who want to send custom attributes and events in a web framework transaction.

## Getting Started

1. Clone or fork this repository.
2. Navigate to this example's sub directory
   ```
   cd newrelic-node-examples/custom-instrumentation/attributes-and-events
   ```
3. Install dependencies and run application.
   ```
   npm install
   cp env.sample .env
   # Fill out `NEW_RELIC_LICENSE_KEY` in .env and save 
   # Start the application
   npm start
   ```
4. Make requests to the application. See index.js for full list of accepted route names.
   ```
   curl -X POST http://localhost:3000/custom-attribute
   ```
