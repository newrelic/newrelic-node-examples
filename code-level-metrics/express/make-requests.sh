#!/bin/bash
echo "Starting request loop"

while true; do
  curl --silent http://localhost:3000/named-mw
  curl --silent http://localhost:3000/anon
  curl --silent http://localhost:3000/arrow
  curl --silent http://localhost:3000/chained
  sleep 10
done
