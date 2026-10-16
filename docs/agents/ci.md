# CI and merging

How changes reach `main`, and how to wait on CI from this machine.

- `check` (`.github/workflows/ci.yml`) is the one CI job. It runs on PRs into `main`, and `deploy.yml` reuses it, so `main` is deployed only after the same checks a PR must pass.
- The "Protect main" ruleset requires a PR, a green `check` and squash merge, with no bypass. Direct pushes to `main` are rejected: work on a branch and open a PR.

## Dependabot

[.github/dependabot.yml](../../.github/dependabot.yml) opens PRs that go through the same `check` and are merged by hand.

- Ecosystems: npm, GitHub Actions, and the linter images CI runs. Those images are pinned in [.github/lint/compose.yml](../../.github/lint/compose.yml), because Dependabot can't read tags inside `docker run` or `docker://` steps. Bump them there, not in `ci.yml`.
- Version updates run weekly and wait 7 days after a release. Minor and patch bumps share one PR per ecosystem; each major bump gets its own.
- Security updates are neither delayed nor grouped: one PR per advisory.
- TypeScript major bumps are ignored while [ADR 0005](../adr/0005-typescript-pinned-to-6.md) holds.

## Waiting on a run

After a push, run [scripts/ci-wait.sh](../../scripts/ci-wait.sh) in the background (`run_in_background`). It takes a commit (default `HEAD`), waits for that commit's run to appear and finish, prints each job's result, and exits non-zero unless the run passed.

It exists because the obvious ways fail here. `gh run watch` and `gh pr checks --watch` return early in this repo's Git Bash on Windows. Right after a push, no run exists yet. And the branch's latest run may still be the previous commit's.
