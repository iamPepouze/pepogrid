---
name: land
description: "Merge a PR once its check is green, return to an up-to-date main, and delete merged branches with their branch files."
disable-model-invocation: true
---

Land a PR: merge it, sync `main`, and clean up. Every gate below **stops** the skill: report what failed and change nothing more.

## 1. Gate

1. The working tree is clean (`git status --porcelain` prints nothing). Otherwise stop and list the dirty files.
2. Resolve the PR: the number passed as an argument, else the current branch's PR (`gh pr view --json number,state,title,headRefName,headRefOid`). On `main` with no argument, skip to **3. Sync**. On another branch with no PR, stop.
3. If the PR is MERGED, skip to **3. Sync**. If it is CLOSED, stop.
4. Local and PR heads match: `git fetch`, then the local branch named by `headRefName` points at `headRefOid`. Otherwise stop: the branch has unpushed commits, or the PR has commits not seen locally.
5. The title follows the "Branch names" rule in CLAUDE.md: `<type>: <summary>`, no scope, `<type>` equal to the branch's `<type>/` prefix, and the summary starting lowercase. A `dependabot/…` branch is exempt from the type match. Otherwise stop and quote the title; the wording on `main` is the user's call.

## 2. Merge

Read the PR's `check` (`gh pr checks <n>`):

- **pass**: merge.
- **pending**: run `scripts/ci-wait.sh <headRefOid>` in the background (see `docs/agents/ci.md`) and merge when it exits 0.
- **fail**, or `ci-wait.sh` exits non-zero: stop and list the failing jobs.

Merge with `gh pr merge <n> --squash`. The repo deletes the remote branch on merge.

## 3. Sync

1. `git checkout main`
2. `git fetch --prune`
3. `git pull --ff-only`. If it refuses, stop: local `main` has diverged, and those commits are the user's to sort out.

## 4. Clean up

For every local branch except `main`, look up its PR with `gh pr list --head <branch> --state all --json state --jq '.[0].state'`:

- **MERGED**: `git branch -D <branch>` (squash merges leave it unmerged to git) and delete `.scratch/<branch>.md`, with `/` in the branch name turned into `-`.
- **OPEN**, **CLOSED**, or no PR: keep it, and note the reason for the report.

## 5. Report

List the PR merged (or "none"), the `main` commit now checked out, each branch and branch file deleted, and each branch kept with its reason. End with one line offering `/retro` on the session.
