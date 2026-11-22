---
name: implement
model: sonnet
description: "Implement a piece of work based on a spec or set of tickets."
disable-model-invocation: true
---

Implement the work described by the user in the spec or tickets.

If the user passes a ticket reference, fetch it from the issue tracker and state its title before starting. If the reference is ambiguous, ask.

Call the Skill tool with "tdd" where possible, at pre-agreed seams.

Run `npm run typecheck` regularly (it covers the tests too), single test files regularly, and at the end `npm test` once, then `scripts/test-seeds.sh` (the changed tests under CI's 20 fixed seeds).

Once done, call the Skill tool with "code-review" to review the work.

Commit your work to the current branch.
