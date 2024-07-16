# Sample Background Transactions Application

This example provides an application with background transactions. This application is useful for users who want to learn about how to handle results, promises, and groups within background transactions.

## Getting Started

1. Clone or fork this repository.
2. Navigate to this example's sub directory
   ```
   cd newrelic-node-examples/custom-instrumentation/background-transactions
   ```
3. Install dependencies and run application.
   ```
   npm install
   cp env.sample .env
   # Fill out `NEW_RELIC_LICENSE_KEY` in .env and save 
   # Start the application
   npm start
   ```
4. The application will automatically start running background transactions. Modify main() in index.js to include/omit more transactions.
