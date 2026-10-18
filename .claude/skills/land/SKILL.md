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
4. Local and PR heads match: `git fetch`, then a local branch named `headRefName` exists and points at `headRefOid`. Otherwise stop: the branch is missing locally, has unpushed commits, or the PR has commits not seen locally.
5. The title follows the "Branch names" rule in CLAUDE.md. Otherwise stop and quote the title; the wording on `main` is the user's call.
6. Review has caught up: the branch file of `headRefName` (CLAUDE.md's **Workflow**) has a `Reviewed up to:` line naming `headRefOid`. Otherwise stop and list the unreviewed commits, `git log --oneline <base>..<headRefOid>`, where `<base>` is the commit `/code-review` would start from (CLAUDE.md's `/code-review` rule: that line's commit, or `origin/main` when the file or line is missing or the commit isn't an ancestor). Whether to run `/code-review` or land them unreviewed is the user's call.

## 2. Merge

Read the `check` entry of `gh pr checks <n> --json name,bucket`:

- **pass**: merge.
- **pending**, or no checks reported yet (right after a push): run `scripts/ci-wait.sh <headRefOid>` in the background (see `docs/agents/ci.md`) and merge when it exits 0.
- **fail**, **cancel** or **skipping**, or `ci-wait.sh` exits non-zero: stop and list the failing jobs.

Merge with `gh pr merge <n> --squash --match-head-commit <headRefOid>`, so a push made since the gate refuses the merge instead of landing unseen code. The repo deletes the remote branch on merge.

## 3. Sync

1. `git checkout main`
2. `git fetch --prune`
3. `git pull --ff-only`. If it refuses, stop: local `main` has diverged, and those commits are the user's to sort out.

## 4. Clean up

For every local branch except `main`, list its merged PRs' heads with `gh pr list --head <branch> --state merged --json headRefOid --jq '.[].headRefOid'`:

- **One equals the branch tip** (`git rev-parse <branch>`): `git branch -D <branch>` (squash merges leave it unmerged to git) and delete its branch file.
- **None does**: keep it, and note the reason for the report: no PR, an open or closed PR, or commits made after the merge. `--head` matches by name, so an old PR from a reused branch name lands here too.

## 5. Report

List the PR merged (or "none"), the `main` commit now checked out, each branch and branch file deleted, and each branch kept with its reason. If this run merged a PR whose title isn't a retro's (`chore: apply the … retro`), end with one line offering `/retro` on the session.
