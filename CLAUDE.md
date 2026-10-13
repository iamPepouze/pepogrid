# PepoGrid

## Agent skills

### Issue tracker

Issues live in GitHub Issues for iamPepouze/pepogrid, via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five default labels: needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `GLOSSARY.md` and `docs/adr/` at the repo root, created when first needed. See `docs/agents/domain.md`.

## Workflow

- **After grilling**: once the frontier is empty, recap the settled decisions and hand back. The user picks the next step, `/to-spec` or `/implement`.
- **`/implement`**: commit before calling `/code-review` (it reviews commits, not the working tree). Reference the spec issue in the commit and PR with `Closes #N`.
- **Merging**: `main` takes changes only through a squash-merged PR with a green `check`. See `docs/agents/ci.md`.
