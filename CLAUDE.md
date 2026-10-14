# PepoGrid

## Agent skills

### Issue tracker

Issues live in GitHub Issues for iamPepouze/pepogrid, via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five default labels: needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `GLOSSARY.md` and `docs/adr/` at the repo root, created when first needed. See `docs/agents/domain.md`.

## Workflow

- **After grilling**: when a grilling session ends, stop at the recap of settled decisions: no plan approval, no implementation. The user picks the next step, `/to-spec` or `/implement`. In plan mode, end with AskUserQuestion offering those two.
- **`/implement`**: commit before calling `/code-review`, since it reviews commits, not the working tree (this overrides the vendored skill's order). Reference the spec issue with `Closes #N` when the work comes from one.
- **`/code-review`**: with no fixed point given, use `main` rather than asking (this overrides the vendored skill). The Spec sub-agent also checks each rationale the spec gives (lines like "X already happens"): a false premise is a finding.
- **Merging or waiting on CI**: `main` only accepts PRs with a green `check`. See `docs/agents/ci.md`.
