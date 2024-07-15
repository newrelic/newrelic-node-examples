# Sample Background Transactions Application

This example provides an application with background transactions.

## Getting Started

1. Clone or fork this repository.
2. Install dependencies and run application.
   ```bash
   npm install
   cp env.sample .env
   # Fill out `NEW_RELIC_LICENSE_KEY` in .env and save 
   # Start the application
   npm start
   ```
3. The application will automatically start running background transactions. Modify index.js to include/omit more transactions.