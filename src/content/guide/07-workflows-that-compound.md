---
title: 'The workflows that compound'
order: 7
summary: Explore-plan-code-commit, the verification loop, and the handful of structural patterns experts reach for — plus the anti-patterns to unlearn.
updated: 2026-07-04
---

A handful of patterns separate expert sessions from the rest. None are clever; all are structural.

## Explore → Plan → Code → Commit

1. **Explore** in plan mode, read-only — let Claude understand the code before proposing anything.
2. **Plan** — get a concrete step plan, edit it, approve only when the approach is right.
3. **Code** — switch modes and build, against tests or a build that give a pass/fail signal.
4. **Commit** — semantic commit, PR, and review in fresh context with `/code-review`.

Skip the planning only when scope is obvious and small. For anything multi-file or unfamiliar, it's the difference between one clean pass and three muddled ones.

## Close the verification loop, always

The highest-value thing you can hand Claude is a way to know it's done. Instead of "implement email validation," write:

> "Write `validateEmail`. Cases: `user@example.com` → true, `user@.com` → false. Run the tests and fix failures."

For long runs, set a `/goal` condition — a separate evaluator re-checks after every turn and Claude keeps working until it holds.

## Two more that punch above their weight

- **Visual iteration** — paste the target design; Claude builds, screenshots its result, compares, and iterates until they match. The screenshot *is* the verification.
- **Interview-first** — before a large build, say "interview me about implementation, UX, edge cases, and tradeoffs until we've covered everything, then write a spec." Then open a *fresh* session with that spec. Focused context, no baggage.

## Anti-patterns to unlearn

| The trap | The fix |
| --- | --- |
| **Kitchen-sink session** — unrelated tasks pile up and quality drops | `/clear` between unrelated tasks |
| **Correcting on repeat** — each failed correction pollutes context | after two, clear and rewrite the opening prompt |
| **The novel CLAUDE.md** — too long, so the real rules get ignored | prune to the lines that prevent mistakes |
| **Trust without verify** — plausible code that misses edge cases | no verification signal, no ship |
| **Unbounded "investigate"** — Claude reads hundreds of files | scope it, or hand it to a subagent |

The through-line: **context architecture first, prompt-wording second.** Prepare the tools, state the objective, separate planning from execution, provide verification, and let Claude iterate.
