#!/usr/bin/env bash
#
# Runs the update-example skill on every example app that has a
# smoke-test.json.
#
# Usage: update-all.sh [app-dir ...]
#
# With no arguments, every app with a smoke-test.json is updated. Apps run one
# at a time, because many listen on the same port and each run switches git
# branches. A failed run doesn't stop the others. Each app's output is saved
# to a log, and the script ends with one summary line per app. Exits 1 if any
# run failed (an opened issue counts as a successful run).

set -uo pipefail

cd "$(git rev-parse --show-toplevel)" || exit 1

APPS=()
if [ $# -gt 0 ]; then
  APPS=("$@")
else
  while IFS= read -r dir; do
    APPS+=("$dir")
  done < <(find . -name smoke-test.json -not -path '*/node_modules/*' -exec dirname {} \; | sed 's|^\./||' | sort)
fi

if [ ${#APPS[@]} -eq 0 ]; then
  echo "No apps with a smoke-test.json found"
  exit 1
fi

LOG_DIR=$(mktemp -d -t update-examples)
echo "Updating ${#APPS[@]} app(s). Logs: $LOG_DIR"

FAILED=0
SUMMARY=()
for app in "${APPS[@]}"; do
  app=${app%/}
  if [ ! -f "$app/smoke-test.json" ]; then
    SUMMARY+=("FAIL $app: no smoke-test.json")
    FAILED=1
    continue
  fi

  log="$LOG_DIR/${app//\//_}.log"
  echo "== $app"
  if claude -p "/update-example $app" > "$log" 2>&1; then
    url=$(grep -Eo 'https://github\.com/[^ )]+/(pull|issues)/[0-9]+' "$log" | tail -1)
    SUMMARY+=("DONE $app: ${url:-no PR or issue opened, see $log}")
  else
    SUMMARY+=("FAIL $app: claude exited with an error, see $log")
    FAILED=1
  fi
done

echo
echo "--- summary"
printf '%s\n' "${SUMMARY[@]}"
[ "$FAILED" = 0 ]
