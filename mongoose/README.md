# Mongoose App

This application demonstrates mongoose with the Node.js agent.

## Setup
```sh
docker compose up -d
npm install
# Seed some data
npm run seed

cp env.sample .env
# Fill out out `NEW_RELIC_LICENSE_KEY` with your ingest key
npm start
```

## Make requests
```sh
curl http://localhost:3000/mongoose
```
