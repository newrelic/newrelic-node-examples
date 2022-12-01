#!/usr/bin/env bash

echo "Starting server"
node -r newrelic index.js &

echo "Make requests"
# make requests 
./make-requests.sh
