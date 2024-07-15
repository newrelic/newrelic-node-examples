# Sample Attributes & Events Application

This example provides an application to demonstrate how to share custom attributes and events.

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
3. Make requests to the application. See index.js for full list of accepted route names.
   ```
   curl -X POST http://localhost:3000/custom-attribute
   ```
