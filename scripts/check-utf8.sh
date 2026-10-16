#!/usr/bin/env bash
# Fails if a tracked text file isn't valid UTF-8, such as one a Windows script wrote in its
# default code page. Binary files (images) are skipped.
# Usage: scripts/check-utf8.sh
set -euo pipefail

bad=0
while IFS= read -r -d '' file; do
  if ! iconv -f UTF-8 -t UTF-8 "$file" >/dev/null 2>&1; then
    echo "Not valid UTF-8: $file" >&2
    bad=1
  fi
done < <(git grep -Iz --name-only -e '')
exit "$bad"
