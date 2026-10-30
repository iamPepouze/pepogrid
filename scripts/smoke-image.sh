#!/usr/bin/env bash
# Checks that a server serves PepoGrid the way the container image must (nginx.conf): status, type and cache headers.
# Usage: scripts/smoke-image.sh <base-url>   (e.g. http://localhost:8080; the image workflow runs it on the built container)
set -euo pipefail

base="${1:?usage: smoke-image.sh <base-url>}"
base="${base%/}"
failures=0

fail() {
  echo "FAIL $1" >&2
  failures=$((failures + 1))
}

# Fetches a path and sets status, type and cache (lowercased header values) and body (text only: NULs dropped).
fetch() {
  local headers payload
  headers=$(mktemp)
  payload=$(mktemp)
  curl -s -D "$headers" -o "$payload" "$base$1"
  body=$(tr -d '\0' <"$payload")
  status=$(head -n 1 "$headers" | cut -d ' ' -f 2)
  type=$(grep -i '^content-type:' "$headers" | cut -d ':' -f 2- | tr -d '\r' | tr '[:upper:]' '[:lower:]' | xargs || true)
  cache=$(grep -i '^cache-control:' "$headers" | cut -d ':' -f 2- | tr -d '\r' | tr '[:upper:]' '[:lower:]' | xargs || true)
  rm -f "$headers" "$payload"
}

# expect <path> <status> <type pattern> <cache pattern>: a pattern of "" is not checked.
expect() {
  fetch "$1"
  [ "$status" = "$2" ] || { fail "$1: status $status, want $2"; return; }
  if [ -n "$3" ] && ! grep -Eq "$3" <<<"$type"; then fail "$1: content-type '$type', want /$3/"; return; fi
  if [ -n "$4" ] && ! grep -Eq "$4" <<<"$cache"; then fail "$1: cache-control '$cache', want /$4/"; return; fi
  echo "ok   $1"
}

REVALIDATE='no-cache|max-age=0|must-revalidate'
LONG_LIVED='max-age=[0-9]{7,}'

expect / 200 'text/html' "$REVALIDATE"
grep -q '<title>PepoGrid</title>' <<<"$body" || fail "/: not the app's HTML"
expect /index.html 200 'text/html' "$REVALIDATE"
expect /sw.js 200 '(application|text)/javascript' "$REVALIDATE"
expect /manifest.webmanifest 200 '^application/manifest\+json' "$REVALIDATE"

# Icons come from the manifest, relative to its URL, so the check follows the app's own list.
fetch /manifest.webmanifest
icons=$(grep -Eo '"src":"[^"]+"' <<<"$body" | cut -d '"' -f 4 || true)
[ -n "$icons" ] || fail "/manifest.webmanifest: no icons"
for icon in $icons; do
  expect "/$icon" 200 '^image/png' "$LONG_LIVED"
done

expect /no-such-path 404 '' ''

if [ "$failures" -gt 0 ]; then
  echo "$failures check(s) failed" >&2
  exit 1
fi
echo "All checks passed"
