#!/usr/bin/env bash
#
# Smoke-tests every route in the app: static pages, dynamic GitHub-backed
# pages, and both not-found variants. Checks HTTP status and a marker string
# in the response body.
#
# Usage:
#   ./scripts/smoke-test.sh                  # build + start a server, test, tear down
#   BASE_URL=http://localhost:3000 ./scripts/smoke-test.sh   # test an already-running server
#   PORT=4000 ./scripts/smoke-test.sh        # pick the port for the managed server
#
# The dynamic routes call the live GitHub API, so a network connection is
# required. Set GITHUB_TOKEN to avoid unauthenticated rate limits.

set -uo pipefail

PORT="${PORT:-3000}"
BASE_URL="${BASE_URL:-http://localhost:$PORT}"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# A repo/user that definitely won't exist, so the not-found paths are exercised.
MISSING="nope-$(date +%s)-doesnotexist"

red()   { printf '\033[31m%s\033[0m' "$1"; }
green() { printf '\033[32m%s\033[0m' "$1"; }
dim()   { printf '\033[2m%s\033[0m' "$1"; }

PASS=0
FAIL=0
MANAGED_PID=""

cleanup() {
  if [ -n "$MANAGED_PID" ]; then
    echo
    dim "Stopping managed server on port $PORT"; echo
    lsof -ti "tcp:$PORT" | xargs kill 2>/dev/null || true
  fi
}
trap cleanup EXIT

# check NAME EXPECTED_STATUS PATH EXPECTED_SUBSTRING
check() {
  local name="$1" want_status="$2" path="$3" want_text="$4"
  local body status

  body="$(curl -s -m 20 -w $'\n%{http_code}' "$BASE_URL$path")"
  status="${body##*$'\n'}"
  body="${body%$'\n'*}"

  if [ "$status" != "$want_status" ]; then
    printf '  %s %-26s %s\n' "$(red FAIL)" "$name" "expected HTTP $want_status, got $status ($path)"
    FAIL=$((FAIL + 1))
    return
  fi
  if ! grep -qF "$want_text" <<<"$body"; then
    printf '  %s %-26s %s\n' "$(red FAIL)" "$name" "HTTP $status but missing text: \"$want_text\" ($path)"
    FAIL=$((FAIL + 1))
    return
  fi
  printf '  %s %-26s %s\n' "$(green PASS)" "$name" "$(dim "HTTP $status  $path")"
  PASS=$((PASS + 1))
}

# Start a server ourselves unless one is already answering at BASE_URL.
if curl -sf -m 3 -o /dev/null "$BASE_URL/repos"; then
  dim "Using server already running at $BASE_URL"; echo
else
  echo "No server at $BASE_URL — building and starting one on port $PORT..."
  ( cd "$PROJECT_ROOT" && npm run build ) || { red "build failed"; echo; exit 1; }
  ( cd "$PROJECT_ROOT" && PORT="$PORT" npm run start >/tmp/smoke-server.log 2>&1 & )
  MANAGED_PID="started"
  printf 'Waiting for server'
  for _ in $(seq 1 60); do
    curl -sf -m 2 -o /dev/null "$BASE_URL/repos" && break
    printf '.'; sleep 0.5
  done
  echo
  if ! curl -sf -m 3 -o /dev/null "$BASE_URL/repos"; then
    red "Server never became ready — see /tmp/smoke-server.log"; echo
    exit 1
  fi
fi

echo
echo "Testing routes at $BASE_URL"
echo

# Static / DB-backed pages
check "home"            200 "/"                          "View Watchlist"
check "watchlist"       200 "/repos"                     "Watchlist"

# Dynamic pages (live GitHub API + SQLite)
check "repo detail"     200 "/repos/vercel/next.js"      "Page views"
check "user profile"    200 "/users/vercel"              "Recently updated"

# Not-found variants
#   - repo route has a colocated not-found.tsx -> rendered inline as HTTP 200
#   - user route has none -> falls back to the root 404 page as HTTP 404
check "repo not-found"  200 "/repos/vercel/$MISSING"     "Repository not found"
check "user not-found"  404 "/users/$MISSING"            "could not be found"

echo
if [ "$FAIL" -eq 0 ]; then
  green "All $PASS checks passed"; echo
  exit 0
else
  red "$FAIL failed"; printf ', '; green "$PASS passed"; echo
  exit 1
fi
