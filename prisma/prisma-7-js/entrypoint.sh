#!/usr/bin/env bash

# Give the db server time to start
sleep 5

set -x

echo "Starting server"
npx prisma generate --config ./prisma-config.js
npx prisma migrate dev \
  --config ./prisma-config.js \
  --name init
npx prisma db seed --config ./prisma-config.js
npm run dev
