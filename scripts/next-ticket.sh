#!/usr/bin/env bash
# Prints the ticket `/implement` takes when given none, in one GraphQL call, with how it was chosen:
#   spec #<spec>: the lowest-numbered open sub-issue with no open blocker, of the latest spec
#   backlog: the oldest unassigned `ready-for-agent` issue with no open blocker, when no open issue has a spec
# The latest spec is the highest-numbered parent of an open issue. Prints "none" when nothing qualifies.
# Usage: scripts/next-ticket.sh
set -euo pipefail

PAGE=100

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
        labels(first: 20) { nodes { name } }
        parent { number }
        blockedBy(first: 20) { nodes { state } }
      }
    }
  }
}' --jq '
  .data.repository.issues as $all
  | ($all.nodes | map(. + {open: ([.blockedBy.nodes[] | select(.state == "OPEN")] | length == 0)})) as $issues
  | ([$issues[] | .parent.number // empty] | max) as $spec
  | (if $all.pageInfo.hasNextPage then "warning: more open issues than one page; only the oldest are considered" else empty end),
    (if $spec != null then
       ([$issues[] | select(.parent.number == $spec and .open)] | sort_by(.number) | first) as $t
       | if $t then "spec #\($spec): #\($t.number) \($t.title)" else "spec #\($spec): none unblocked" end
     else
       ([$issues[] | select(.open and .assignees.totalCount == 0 and ([.labels.nodes[].name] | index("ready-for-agent")))] | first) as $t
       | if $t then "backlog: #\($t.number) \($t.title)" else "none" end
     end)
'
