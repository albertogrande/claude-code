---
title: 'Subagents, parallelism & workflows'
order: 5
summary: Three tiers of fan-out — background-by-default subagents, parallel worktrees, and dynamic multi-agent workflows — and when each earns its cost.
updated: 2026-07-04
---

When one context window and one thread aren't enough, Claude Code fans out. Three tiers, escalating in power and cost.

## Subagents — isolated, disposable helpers

A subagent runs a focused task in its own fresh context, with its own model, and reports a summary back. As of Claude Code 2.1.198, subagents run **in the background by default** — Claude keeps working while they run and is notified when they finish, rather than waiting on the result. Their permission prompts still surface in your main session, naming which subagent is asking. Set a subagent's `background: false` frontmatter, or export `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS=1`, to force one to run synchronously. Two killer uses:

- **Research without bloat.** "Investigate how token refresh works and whether we have OAuth utilities to reuse" — the subagent reads dozens of files; your main thread only sees the answer.
- **Fresh-context review.** A reviewer that didn't just write the code isn't biased toward it. It finds what the author's context hides.

Define custom subagents in `.claude/agents/` with their own tools and model — a read-only `security-reviewer` on Opus, a `test-runner` limited to `Bash(npm test)`.

## Worktrees & background sessions — true parallelism

On desktop, each local session can spin up its own **git worktree**, so two sessions editing the same repo never collide — one refactors auth on its branch while another fixes a payments bug on hers. Background sessions keep running while you work elsewhere and notify you when they finish or need input.

## Dynamic workflows — orchestration at scale

For genuinely large work — a framework migration, a codebase-wide audit — Claude can write a script that orchestrates **tens to hundreds of subagents**, deterministically fanning out and verifying results before anything reaches you. The control flow lives in the *script's variables*, not the model's memory, which is why it holds together at that scale.

**Opting in.** Workflows are powerful and can burn a lot of tokens, so they're explicit opt-in. Add the keyword `ultracode` to a substantive request, or ask directly: "use a workflow to migrate our test suite from Jest to Vitest across all packages." For anything smaller, a single session or a couple of subagents is the cheaper right answer.

## Choosing a tier

| You need… | Use |
| --- | --- |
| To answer a question without filling your context | a subagent |
| An unbiased review of a diff | a fresh-context subagent |
| Two features built at once, same repo | parallel sessions in worktrees |
| A migration/audit across hundreds of files | a dynamic workflow (`ultracode`) |

Escalate only as far as the task demands. Most work never needs more than a subagent or two.
