# CI and merging

- `.github/workflows/ci.yml` holds the one CI job, `check`. It runs on every PR into `main`, and `deploy.yml` calls it before deploying to Pages, so a green PR means a deployable `main`.
- The "Protect main" ruleset requires a PR, a green `check` (from GitHub Actions) and squash merge. It blocks force-push and deletion, and nobody can bypass it. Direct pushes to `main` are rejected; branch first.
- Repo settings allow squash merges only and delete the head branch after merge.

## Waiting on a run

`gh run watch` and `gh pr checks --watch` return early in this repo's Git Bash on Windows, and `gh pr checks` reports "no checks" for a few seconds after a push. Wait with a background `until` loop instead:

```sh
until [ "$(gh run view <run-id> --json status --jq .status)" = completed ]; do sleep 10; done
gh run view <run-id> --json conclusion,jobs --jq '.conclusion, (.jobs[] | "\(.name): \(.conclusion)")'
```

Get `<run-id>` from `gh run list --branch <branch> --limit 1 --json databaseId --jq '.[0].databaseId'`.
