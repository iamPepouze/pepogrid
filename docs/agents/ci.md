# CI and merging

How changes reach `main`, and how to wait on CI from this machine.

- `check` (`.github/workflows/ci.yml`) is the one CI job. It runs on PRs into `main`, and `deploy.yml` reuses it, so `main` is deployed only after the same checks a PR must pass.
- `image.yml` runs on every push to `main` too, calling `check` first. It builds the [Dockerfile](../../Dockerfile) natively on an arm64 runner, runs [scripts/smoke-image.sh](../../scripts/smoke-image.sh) and a non-root check against the container, and only then pushes `ghcr.io/iampepouze/pepogrid:main-<unix-time>-<short-sha>`. It is independent of the Pages deploy: either can fail without the other.
- The "Protect main" ruleset requires a PR, a green `check` and squash merge, with no bypass. Direct pushes to `main` are rejected: work on a branch and open a PR.
- The repo's squash commit takes the PR title (`squash_merge_commit_title: PR_TITLE`), even for a one-commit PR, and lists the branch commits as its body. So the title is what `main` keeps, and branch commits can stay free-form. The title format is the "Branch names" rule in [CLAUDE.md](../../CLAUDE.md). `check` enforces that rule's branch-name half on PRs with [scripts/check-branch-name.sh](../../scripts/check-branch-name.sh); titles are unchecked.
- The user finishes a PR with `/land`: it merges once `check` is green, syncs `main`, and deletes merged branches. It stops on a PR with no local branch, so Dependabot PRs stay merged by hand.

## Dependabot

[.github/dependabot.yml](../../.github/dependabot.yml) opens PRs that go through the same `check` and are merged by hand.

- Ecosystems: npm, GitHub Actions, the base images in the [Dockerfile](../../Dockerfile), the linter images CI runs, and pip for the `check-jsonschema` pin in [.github/lint/requirements.txt](../../.github/lint/requirements.txt), which validates this file in CI. Those images are pinned in [.github/lint/compose.yml](../../.github/lint/compose.yml), because Dependabot can't read tags inside `docker run` or `docker://` steps. Bump them there, not in `ci.yml`.
- Version updates run weekly and wait 7 days after a release. Minor and patch bumps share one PR per ecosystem; each major bump gets its own.
- Security updates are neither delayed nor grouped: one PR per vulnerable dependency.
- TypeScript major bumps are ignored while [ADR 0005](../adr/0005-typescript-pinned-to-6.md) holds. TypeScript minor and patch bumps get a PR of their own, apart from the other npm updates, because typescript-eslint's peer range can fail them.
- Every entry sets `commit-message` to the `chore` prefix, so its PRs are titled `chore: bump …` like other PR titles. Its branch names (`dependabot/…`) stay outside the branch-name rule.

## Waiting on a run

After a push, run [scripts/ci-wait.sh](../../scripts/ci-wait.sh) in the background (`run_in_background`). It takes a commit (default `HEAD`), waits for that commit's run to appear and finish, prints each job's result, and exits non-zero unless the run passed.

It exists because the obvious ways fail here. `gh run watch` and `gh pr checks --watch` return early in this repo's Git Bash on Windows. Right after a push, no run exists yet. And the branch's latest run may still be the previous commit's.
