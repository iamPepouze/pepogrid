#!/usr/bin/env bash
# Reruns the tests a change touches under fixed seeds, so a test that passes only for some of the
# random puzzles it may be dealt fails on the PR that adds it, not on a later one.
# Usage: scripts/test-seeds.sh [base]   (default: origin/main; tests related to files changed since the
# merge base with it, so the base's history must be fetched)
set -euo pipefail

SEEDS=20

base=${1:-origin/main}

for seed in $(seq "$SEEDS"); do
  if ! out=$(TEST_SEED=$seed npx vitest run --changed "$base" --passWithNoTests 2>&1); then
    echo "$out"
    echo "Failed with TEST_SEED=$seed" >&2
    exit 1
  fi
done
echo "Changed tests passed under seeds 1-$SEEDS."
