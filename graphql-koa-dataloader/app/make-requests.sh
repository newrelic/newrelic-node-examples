#!/bin/bash
shopt -s expand_aliases

alias http='http --print b --ignore-stdin'

echo "Starting request loop"
while true; do

  # Get all users
  echo "Fetching all users"
  http localhost:4000 query='{allUsers{age, email, hobbies, id, name, friends}}' | jq -C

  for id in {1..10}; do
    echo "Fetching user #${id}"
    http localhost:4000 query="{user(id:${id}){age, email, hobbies, id, name, friends}}" | jq -C
  done
  sleep 5
done
