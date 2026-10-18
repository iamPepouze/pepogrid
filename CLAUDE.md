# PepoGrid

## Agent skills

### Issue tracker

Issues live in GitHub Issues for iamPepouze/pepogrid, via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five default labels: needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `GLOSSARY.md` and `docs/adr/` at the repo root, created when first needed. See `docs/agents/domain.md`.

### Installed iOS app

Before grilling or changing anything for the installed iOS app (layout, status bar, dialogs, updates, haptics), read `docs/ios-installed-app.md`.

### Vendored skills

Before adding a skill, updating or editing a vendored skill (one in `skills-lock.json`), or changing any skill's `model` or `disable-model-invocation`, read `docs/agents/vendored-skills.md`.

## Workflow

The **branch file** is `.scratch/<branch>.md` (gitignored), with any `/` in the branch name turned into `-`. It holds the branch's spec and review state.

- **Branch names**: when work starts on `main`, branch before the first commit, named `<type>/<kebab-case summary>` with no issue number, e.g. `feat/fill-notes`, where `<type>` is the Conventional Commits type of the branch's main purpose. Title its PR `<type>: <lowercase summary>` with the same type and no scope.
- **Grilling**: put each round through AskUserQuestion, recommended option first, at most 4 questions per call (this overrides the vendored skill's text format). When the change is something players see, load the `ux` skill and put its questions in the same rounds.
- **Options**: before offering an option in any AskUserQuestion, verify each claim it makes about a tool, a setting or the app's current behaviour, reading the code around a search hit. A claim naming a set (which skills, which files) is checked against a search that lists the whole set, such as every skill's frontmatter. Check any wording players will see against `GLOSSARY.md` and the spec's UX decisions.
- **After grilling**: when a grilling session ends, stop at the recap of settled decisions: no plan approval, no implementation. The user picks the next step, `/to-spec` or `/implement`. In plan mode, end with AskUserQuestion offering those two.
- **`/implement`**: given no ticket, take the first open ticket of the latest spec with no open blocker, and state its title. When no open issue has a spec, take the oldest `ready-for-agent` issue with no open blocker (the tracker doc's **Frontier query**, without a map) and say so; verify blockers before offering any ticket. Commit before calling `/code-review`, since it reviews commits, not the working tree (this overrides the vendored skill's order). The PR closes the issue it implements with `Closes #N`. When writing the PR body for a ticket, if no other sub-issue of its spec is open (the tracker doc's **List sub-issues**), the body also has `Closes #<spec>`: GitHub leaves a spec open when its last sub-issue closes. With no spec issue, first write the grilling recap to the branch file: it is the spec `/code-review` finds.
- **Opening a PR**, from anywhere (`/implement`, `/triage`'s `.out-of-scope/` record, a retro): only once the branch has had a `/code-review`: its branch file has a `Reviewed up to:` line. Whether fixes need another review is that review's verdict.
- **`/code-review`**: with no fixed point given, use the commit on the branch file's `Reviewed up to: <sha>` line, the first non-blank line after its title, rather than asking (this overrides the vendored skill). Use `origin/main`, after `git fetch`, when the file or line is missing, or when that commit isn't an ancestor of `HEAD`: local `main` lags behind squash merges. After reporting such a review, write that line with the reviewed `HEAD`'s full SHA, creating the file if needed. Decisions the user makes during `/implement`, or while fixing a review, go into the branch file's spec before the next review.
- **Review sub-agents**: the Spec sub-agent also checks each rationale the spec gives (lines like "X already happens"): a false premise is a finding. For any state that outlives the action that set it (an animation, a signal, a timer), it walks undo, a second trigger mid-flight, and a resume. When the diff touches `.claude/skills/` or CLAUDE.md, the `writing-for-agents` skill is a standards source. A colour token the spec prescribes is checked against everything drawn on it and everything it is drawn on.
- **Merging or waiting on CI**: `main` only accepts PRs with a green `check`. See `docs/agents/ci.md`.
