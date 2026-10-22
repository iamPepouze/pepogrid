# Vendored skills

Skills listed in `skills-lock.json` are vendored; the rest are this repo's own. Re-apply these local edits after updating the vendored skills:

- `retro`: drop `disable-model-invocation`, so a retro asked for in words can run.
- `code-review`: move the smell baseline into `SMELLS.md`, and give the Standards sub-agent its path instead of the pasted list. Add a third parallel axis, **UX**, whose sub-agent follows the `ux` skill's Review mode. Skip UX when nothing players see changed. Run the Standards sub-agent on `sonnet` and the Spec and UX sub-agents on `opus`, each set on its call, and have the orchestrator re-check its hard violations. End with a **Recommendation** step.
- `implement-spec`: run its exploration, implementer and merger sub-agents with `model: sonnet`. Step 7 fixes what the review's recommendation marks **fix**, and re-reviews if its verdict says to.
- `ask-matt`: describe `/code-review` by what it checks, leaving its axes to its skill.
- `to-spec`: place named tests by `CODING_STANDARDS.md`'s test-layout rules. Add a **UX decisions** section to the template, for a change players see.
- `to-tickets`: place named tests by `CODING_STANDARDS.md`'s test-layout rules. An acceptance criterion goes to the ticket whose code exercises it, and a shape a later ticket reads is named in the earlier ticket's "What to build". A spec's UX decision goes the same way, under a **UX decisions** heading in both templates.
- `triage`: `AGENT-BRIEF.md` gains a **Measured colours** principle: a brief that prescribes a colour token measures each pair in both themes, with `luminance` and `ratio` copied from `scripts/contrast.mjs`, and quotes it.
- `pr`: an **On device** bullet in Evidence, from the branch file's `device-check:` line.

## Models

`model` in a skill's frontmatter holds only for the turn that loads the skill.

- `opus`: `grill-me`, `grill-with-docs`, `wayfinder`, `to-spec`, `to-tickets`, `code-review`, `diagnosing-bugs`, `improve-codebase-architecture`, `triage`, `retro`, `implement-spec`, `handoff`, `teach`, `grilling`, `codebase-design`, `domain-modeling` and `writing-for-agents`.
- `sonnet`: `implement`, `wait-what`, `to-questionnaire`, `setup-matt-pocock-skills`, `ask-matt`, `pr`, `research`, `prototype` and `wizard`.
- `inherit`: `tdd`, which `implement` (`sonnet`) and an `opus` bug fix both load.
- The repo's own skills set theirs directly: `ux`, `opus`; `drive-app`, `inherit`, since `ux` loads it; `land`, `sonnet`.

A skill the model can load mid-turn (no `disable-model-invocation`) changes the model for the rest of that turn:

- A `sonnet` pin lowers an `opus` turn: accepted for `pr`, `prototype`, `research` and `wizard`.
- An `opus` pin raises a `sonnet` `implement` turn: accepted for every such `opus` skill, `code-review` (which `implement` loads on every run), `retro`, `grilling`, `diagnosing-bugs`, `writing-for-agents`, `domain-modeling`, `codebase-design` and `ux`.
