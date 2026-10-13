# CI and merging

How changes reach `main`, and how to wait on CI from this machine.

- `check` (`.github/workflows/ci.yml`) is the one CI job. It runs on PRs into `main`, and `deploy.yml` reuses it, so `main` is deployed only after the same checks a PR must pass.
- The "Protect main" ruleset requires a PR, a green `check` and squash merge, with no bypass. Direct pushes to `main` are rejected: work on a branch and open a PR.

## Waiting on a run

`gh run watch` and `gh pr checks --watch` return early in this repo's Git Bash on Windows, and `gh pr checks` reports "no checks" for a few seconds after a push. Wait with an `until` loop run in the background (`run_in_background`):

```sh
until [ "$(gh run view <run-id> --json status --jq .status)" = completed ]; do sleep 10; done
gh run view <run-id> --json conclusion,jobs --jq '.conclusion, (.jobs[] | "\(.name): \(.conclusion)")'
```

Get `<run-id>` from `gh run list --branch <branch> --limit 1 --json databaseId --jq '.[0].databaseId'`.
