#!/bin/bash
echo "Starting request loop"

while true; do
  curl --silent http://localhost:3000/named-mw
  curl --silent http://localhost:3000/anon
  curl --silent http://localhost:3000/arrow
  curl --silent http://localhost:3000/chained
  curl --silent http://localhost:3000/schedule-job
  curl --silent http://localhost:3000/run-job
  sleep 10
done
