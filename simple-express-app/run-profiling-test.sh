#!/bin/bash
RUN_TIME=1
commands=("start:perf:no-agent" "start:perf:agent-no-profiling" "start:perf:agent-profiling")

echo "Removing leftover monitoring files from past runs"
rm monitor-data/*

for cmd in "${commands[@]}"; do
  # Start the app in the background
  echo "Starting app with $cmd"
  npm run "$cmd" &
  APP_PID=$!

  # Wait for the server to start (adjust as needed)
  sleep 10

  echo "Injecting traffic for $RUN_TIME minutes"
  hey -z "$RUN_TIME"m http://localhost:3000/named-route

  # After hey completes, stop the app
  kill $APP_PID
  # Determine output filename
  case "$cmd" in
    "start:perf:no-agent") out="perf-data-no-agent.csv" ;;
    "start:perf:agent-no-profiling") out="perf-data-agent-no-profiling.csv" ;;
    "start:perf:agent-profiling") out="perf-data-agent-profiling.csv" ;;
  esac

  echo "moving file to $out"
  # Find the most recent CSV file in monitor-data and rename it
  # Using /bin/ls because my shell alias ls to some other cli tool
  CSV_FILE=$(/bin/ls -t monitor-data/*.csv | head -n 1)
  mv "$CSV_FILE" monitor-data/"$out"
  echo "done, onto the next"
done
