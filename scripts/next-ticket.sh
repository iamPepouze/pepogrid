#!/usr/bin/env bash
# Prints the ticket `/implement` takes when given none, in one GraphQL call, with how it was chosen:
#   spec #<spec>: the lowest-numbered open sub-issue with no open blocker, of the latest spec
#   backlog: the oldest unassigned `ready-for-agent` issue with no open blocker, when no open issue has a spec
# The latest spec is the highest-numbered parent of an open issue. Prints "none" when nothing qualifies,
# and "spec #<spec>: none unblocked" when that spec's sub-issues all have an open blocker.
# A blocker is a native issue dependency (docs/agents/issue-tracker.md, Blocking), not a `Blocked by:` line.
# Fails when there are more open issues than one page, rather than picking from a part of them.
# Usage: scripts/next-ticket.sh
set -euo pipefail

PAGE=100
LABELS_MAX=20
BLOCKERS_MAX=20

# The $names in the jq program are its variables, not the shell's.
# shellcheck disable=SC2016
gh api graphql -f query='
query {
  repository(owner: "iamPepouze", name: "pepogrid") {
    issues(states: OPEN, first: '"$PAGE"', orderBy: {field: CREATED_AT, direction: ASC}) {
      pageInfo { hasNextPage }
      nodes {
        number
        title
        assignees(first: 1) { totalCount }
        labels(first: '"$LABELS_MAX"') { nodes { name } }
        parent { number }
        blockedBy(first: '"$BLOCKERS_MAX"') { nodes { state } }
      }
    }
  }
}' --jq '
  .data.repository.issues as $all
  | if $all.pageInfo.hasNextPage then error("more open issues than one page: raise PAGE in scripts/next-ticket.sh") else . end
  | ($all.nodes | map(. + {unblocked: ([.blockedBy.nodes[] | select(.state == "OPEN")] | length == 0)})) as $issues
  | ([$issues[] | .parent.number // empty] | max) as $spec
  | if $spec != null then
      ([$issues[] | select(.parent.number == $spec and .unblocked)] | sort_by(.number) | first) as $t
      | if $t then "spec #\($spec): #\($t.number) \($t.title)" else "spec #\($spec): none unblocked" end
    else
      ([$issues[] | select(.unblocked and .assignees.totalCount == 0 and ([.labels.nodes[].name] | index("ready-for-agent")))] | first) as $t
      | if $t then "backlog: #\($t.number) \($t.title)" else "none" end
    end
'
