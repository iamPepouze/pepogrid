---
name: implement
model: sonnet
description: "Implement a piece of work based on a spec or set of tickets."
disable-model-invocation: true
---

Implement the work described by the user in the spec or tickets.

If the user passes a ticket reference, fetch it from the issue tracker and state its title before starting. If the reference is ambiguous, ask.

Call the Skill tool with "tdd" where possible, at pre-agreed seams.

Run `npm run typecheck` and single test files regularly. At the end, after the last code change, run `npm run typecheck`, `npm test` and `scripts/test-seeds.sh`.

Once done, call the Skill tool with "code-review" to review the work.

Commit your work to the current branch.
