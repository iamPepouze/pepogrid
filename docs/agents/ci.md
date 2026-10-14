# CI and merging

How changes reach `main`, and how to wait on CI from this machine.

- `check` (`.github/workflows/ci.yml`) is the one CI job. It runs on PRs into `main`, and `deploy.yml` reuses it, so `main` is deployed only after the same checks a PR must pass.
- The "Protect main" ruleset requires a PR, a green `check` and squash merge, with no bypass. Direct pushes to `main` are rejected: work on a branch and open a PR.

## Waiting on a run

After a push, run [scripts/ci-wait.sh](../../scripts/ci-wait.sh) in the background (`run_in_background`). It takes a commit (default `HEAD`), waits for that commit's run to appear and finish, prints each job's result, and exits non-zero unless the run passed.

It exists because the obvious ways fail here. `gh run watch` and `gh pr checks --watch` return early in this repo's Git Bash on Windows. Right after a push, no run exists yet. And the branch's latest run may still be the previous commit's.
