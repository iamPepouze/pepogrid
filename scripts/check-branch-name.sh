#!/usr/bin/env bash
# Usage: scripts/check-branch-name.sh [branch]   (default: the current branch)
# Fails unless the branch follows the "Branch names" rule in CLAUDE.md:
# <Conventional Commits type>/<kebab-case summary>. Dependabot's branches are exempt.
set -euo pipefail

branch="${1:-$(git rev-parse --abbrev-ref HEAD)}"
types='feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert'

if [[ "$branch" == dependabot/* ]]; then
  exit 0
fi
if [[ "$branch" =~ ^($types)/[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
  exit 0
fi
echo "Branch '$branch' should be <type>/<kebab-case summary>, with <type> one of: ${types//|/ }" >&2
exit 1
