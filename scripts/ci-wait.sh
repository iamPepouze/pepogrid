#!/usr/bin/env bash
# Waits for the CI run of one commit, prints its result, and exits non-zero unless it passed.
# Usage: scripts/ci-wait.sh [commit]   (default: HEAD; run it in the background right after a push)
set -euo pipefail

sha=$(git rev-parse "${1:-HEAD}")

# A run appears a few seconds after the push. Match it by commit, never "the branch's latest",
# which can be the previous commit's run.
id=""
for _ in $(seq 60); do
  id=$(gh run list --commit "$sha" --limit 1 --json databaseId --jq '.[0].databaseId // empty')
  [ -n "$id" ] && break
  sleep 5
done
if [ -z "$id" ]; then
  echo "No CI run for $sha after 5 minutes: was it pushed?" >&2
  exit 1
fi

until [ "$(gh run view "$id" --json status --jq .status)" = completed ]; do sleep 10; done
gh run view "$id" --json conclusion,jobs --jq '.conclusion, (.jobs[] | "\(.name): \(.conclusion)")'
[ "$(gh run view "$id" --json conclusion --jq .conclusion)" = success ]
