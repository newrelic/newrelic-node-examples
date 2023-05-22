#!/usr/bin/env bash

echo "Starting server"
npm start &

# Wait a bit before making requests
sleep 5

echo "Making requests"
./make-requests.sh
