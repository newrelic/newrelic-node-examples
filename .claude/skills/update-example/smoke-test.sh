#!/usr/bin/env bash
#
# Smoke-tests one example app using the app's smoke-test.json recipe.
#
# Usage: smoke-test.sh <app-dir> [--keep-running]
#
# Starts the app, waits for its port, requests each route, and checks the
# agent log for a collector connection and for errors. Prints one line per
# check and ends with "RESULT: pass" or "RESULT: fail" (exit code 0 or 1).
# With --keep-running the app is left running after a pass, and its PID is
# printed so it can be stopped later.

set -uo pipefail

APP_DIR=${1:?usage: smoke-test.sh <app-dir> [--keep-running]}
KEEP_RUNNING=${2:-}
STARTUP_TIMEOUT=${STARTUP_TIMEOUT:-30}
CONNECT_TIMEOUT=${CONNECT_TIMEOUT:-30}

cd "$APP_DIR" || { echo "FAIL app dir not found: $APP_DIR"; exit 1; }
if [ ! -f smoke-test.json ]; then
  echo "FAIL no smoke-test.json in $APP_DIR"
  exit 1
fi

# Read a field from the recipe. Arrays come back one item per line.
recipe() {
  node -e '
    const r = require("./smoke-test.json")
    const v = r[process.argv[1]]
    if (Array.isArray(v)) console.log(v.join("\n"))
    else if (v !== undefined && v !== null) console.log(v)
  ' "$1"
}

START=$(recipe start)
PORT=$(recipe port)
ENV_FILE=$(recipe env_file)
CI_MODE=$(recipe ci)

if [ "$CI_MODE" = "skip" ]; then
  echo "SKIP recipe has ci=skip"
  echo "RESULT: skip"
  exit 0
fi

# Every secret must be available, either in the env file or the environment.
# In CI there is no env file, so write one from the environment.
MISSING=0
for s in $(recipe secrets); do
  if [ -n "$ENV_FILE" ] && [ -f "$ENV_FILE" ] && grep -q "^$s=." "$ENV_FILE"; then
    continue
  fi
  if [ -z "${!s:-}" ]; then
    echo "FAIL secret $s is not set"
    MISSING=1
  elif [ -n "$ENV_FILE" ]; then
    echo "$s=${!s}" >> "$ENV_FILE"
  fi
done
[ "$MISSING" = 1 ] && { echo "RESULT: fail"; exit 1; }

if [ "$CI_MODE" = "install-only" ]; then
  if npm install --no-audit --no-fund > /dev/null 2>&1; then
    echo "PASS npm install"
    echo "RESULT: pass"
    exit 0
  fi
  echo "FAIL npm install"
  echo "RESULT: fail"
  exit 1
fi

if lsof -ti:"$PORT" > /dev/null 2>&1; then
  echo "FAIL port $PORT is already in use"
  echo "RESULT: fail"
  exit 1
fi

# Only look at agent log lines written by this run.
AGENT_LOG=newrelic_agent.log
LOG_START=$( [ -f "$AGENT_LOG" ] && wc -l < "$AGENT_LOG" | tr -d ' ' || echo 0)
APP_OUT=$(mktemp)

kill_tree() {
  local pid=$1
  for child in $(pgrep -P "$pid" 2>/dev/null); do
    kill_tree "$child"
  done
  kill "$pid" 2>/dev/null
}

bash -c "$START" > "$APP_OUT" 2>&1 &
APP_PID=$!

cleanup() {
  if [ "$RESULT" = pass ] && [ "$KEEP_RUNNING" = "--keep-running" ]; then
    echo "RUNNING pid=$APP_PID port=$PORT"
  else
    kill_tree "$APP_PID"
    wait "$APP_PID" 2> /dev/null
  fi
  rm -f "$APP_OUT"
}
RESULT=fail
trap cleanup EXIT

# Wait for the port to accept connections.
UP=0
for _ in $(seq 1 $((STARTUP_TIMEOUT * 2))); do
  if ! kill -0 "$APP_PID" 2> /dev/null; then
    break
  fi
  if curl -s -o /dev/null "http://localhost:$PORT/"; then
    UP=1
    break
  fi
  sleep 0.5
done

if [ "$UP" != 1 ]; then
  echo "FAIL app did not start on port $PORT within ${STARTUP_TIMEOUT}s"
  echo "--- app output"
  tail -20 "$APP_OUT"
  echo "RESULT: fail"
  exit 1
fi
echo "PASS app started on port $PORT"

FAILED=0
check_route() {
  local route=$1 required=$2 code
  code=$(curl -s -m 10 -o /dev/null -w '%{http_code}' "http://localhost:$PORT$route")
  if [[ "$code" =~ ^2 ]]; then
    echo "PASS route $route $code"
  elif [ "$required" = 1 ]; then
    echo "FAIL route $route $code"
    FAILED=1
  else
    echo "WARN optional route $route $code"
  fi
}

check_alive() {
  # Give a crashing app a moment to exit before checking.
  sleep 1
  if ! kill -0 "$APP_PID" 2> /dev/null || ! lsof -ti:"$PORT" > /dev/null 2>&1; then
    echo "FAIL app exited after $1"
    echo "--- app output"
    tail -20 "$APP_OUT"
    FAILED=1
    return 1
  fi
}

for r in $(recipe routes); do check_route "$r" 1; done
check_alive "required routes"
ALIVE=$?

# Wait for the agent to connect before requesting optional routes, since
# those may crash the app.
CONNECTED=0
if [ "$ALIVE" = 0 ]; then
  for _ in $(seq 1 "$CONNECT_TIMEOUT"); do
    if [ -f "$AGENT_LOG" ] && tail -n +"$((LOG_START + 1))" "$AGENT_LOG" | grep -q 'Connected to'; then
      CONNECTED=1
      break
    fi
    kill -0 "$APP_PID" 2> /dev/null || break
    sleep 1
  done
fi

if [ "$CONNECTED" = 1 ]; then
  echo "PASS agent connected to collector"
else
  echo "FAIL agent did not connect within ${CONNECT_TIMEOUT}s"
  FAILED=1
fi

if [ "$ALIVE" = 0 ]; then
  for r in $(recipe optional_routes); do check_route "$r" 0; done
  [ -n "$(recipe optional_routes)" ] && check_alive "optional routes"
fi

if [ -f "$AGENT_LOG" ]; then
  tail -n +"$((LOG_START + 1))" "$AGENT_LOG" \
    | grep -E '"level":(50|60)' \
    | sed -E 's/.*"msg":"([^"]*)".*/\1/' \
    | grep -v 'Failed to get information about vendor' \
    | sort -u \
    | head -10 \
    | sed 's/^/WARN agent error: /'
fi

if [ "$FAILED" = 0 ]; then
  RESULT=pass
fi
echo "RESULT: $RESULT"
[ "$RESULT" = pass ]
