#!/usr/bin/env bash
# Waits for the ci.yml run of one pushed branch commit, prints its result, and exits non-zero unless it passed.
# Usage: scripts/ci-wait.sh [commit]   (default: HEAD; run it in the background right after a push to a PR branch)
# On main, check runs inside image.yml instead, so there is no ci.yml run to find.
set -euo pipefail

FIND_TRIES=60
FIND_POLL_S=5
WATCH_POLL_S=10

sha=$(git rev-parse "${1:-HEAD}")

# A run appears a few seconds after the push. Match it by commit, never "the branch's latest",
# which can be the previous commit's run, and by workflow: a PR that touches the image also runs
# image.yml, whose check is skipped on a PR, so its success says nothing about check.
id=""
for _ in $(seq "$FIND_TRIES"); do
  id=$(gh run list --commit "$sha" --workflow ci.yml --limit 1 --json databaseId --jq '.[0].databaseId // empty')
  [ -n "$id" ] && break
  sleep "$FIND_POLL_S"
done
if [ -z "$id" ]; then
  echo "No CI run for $sha after $((FIND_TRIES * FIND_POLL_S)) seconds: was it pushed?" >&2
  exit 1
fi

until [ "$(gh run view "$id" --json status --jq .status)" = completed ]; do sleep "$WATCH_POLL_S"; done
gh run view "$id" --json conclusion,jobs --jq '.conclusion, (.jobs[] | "\(.name): \(.conclusion)")'
[ "$(gh run view "$id" --json conclusion --jq .conclusion)" = success ]
