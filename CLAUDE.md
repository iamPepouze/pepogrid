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

### Local edits to vendored skills

Re-apply these after updating the skills in `skills-lock.json`:

- `retro`: drop `disable-model-invocation`, so a retro asked for in words can run.
- `code-review`: move the smell baseline into `SMELLS.md`, and give the Standards sub-agent its path instead of the pasted list.
- `to-spec` and `to-tickets`: place named tests by `CODING_STANDARDS.md`'s test-layout rules.
- `pr`: an **On device** bullet in Evidence, from the branch file's `device-check:` line.

## Workflow

The **branch file** is `.scratch/<branch>.md` (gitignored), with any `/` in the branch name turned into `-`. It holds the branch's spec and review state.

- **Branch names**: when work starts on `main`, branch before the first commit, named `<type>/<kebab-case summary>` with no issue number, e.g. `feat/fill-notes`, where `<type>` is the Conventional Commits type of the branch's main purpose. Title its PR `<type>: <lowercase summary>` with the same type and no scope.
- **Grilling**: put each round through AskUserQuestion, recommended option first, at most 4 questions per call (this overrides the vendored skill's text format). Check what an option claims a tool or setting produces before offering it.
- **After grilling**: when a grilling session ends, stop at the recap of settled decisions: no plan approval, no implementation. The user picks the next step, `/to-spec` or `/implement`. In plan mode, end with AskUserQuestion offering those two.
- **`/implement`**: given no ticket, take the first open ticket of the latest spec with no open blocker, and state its title. Commit before calling `/code-review`, since it reviews commits, not the working tree (this overrides the vendored skill's order). The PR closes the issue it implements with `Closes #N`. When writing the PR body for a ticket, if no other sub-issue of its spec is open (the tracker doc's **List sub-issues**), the body also has `Closes #<spec>`: GitHub leaves a spec open when its last sub-issue closes. With no spec issue, first write the grilling recap to the branch file: it is the spec `/code-review` finds.
- **`/code-review`**: with no fixed point given, use the commit on the branch file's `Reviewed up to: <sha>` line, the first non-blank line after its title, rather than asking (this overrides the vendored skill). Use `origin/main`, after `git fetch`, when the file or line is missing, or when that commit isn't an ancestor of `HEAD`: local `main` lags behind squash merges. After reporting such a review, write that line with the reviewed `HEAD`'s full SHA, creating the file if needed. Decisions the user makes during `/implement`, or while fixing a review, go into the branch file's spec before the next review.
- **Review sub-agents**: the Spec sub-agent also checks each rationale the spec gives (lines like "X already happens"): a false premise is a finding. For any state that outlives the action that set it (an animation, a signal, a timer), it walks undo, a second trigger mid-flight, and a resume. When the diff touches `.claude/skills/` or CLAUDE.md, the `writing-for-agents` skill is a standards source.
- **Merging or waiting on CI**: `main` only accepts PRs with a green `check`. See `docs/agents/ci.md`.
