---
title: 'Subagents, parallelism & workflows'
order: 5
summary: Three tiers of fan-out — background-by-default subagents, parallel worktrees, and dynamic multi-agent workflows — and when each earns its cost.
updated: 2026-07-22
---

When one context window and one thread aren't enough, Claude Code fans out. Three tiers, escalating in power and cost.

## Subagents — isolated, disposable helpers

A subagent runs a focused task in its own fresh context, with its own model, and reports a summary back. As of Claude Code 2.1.198, subagents run **in the background by default** — Claude keeps working while they run and is notified when they finish, rather than waiting on the result. Their permission prompts still surface in your main session, naming which subagent is asking. Set a subagent's `background: false` frontmatter, or export `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS=1`, to force one to run synchronously. Two killer uses:

- **Research without bloat.** "Investigate how token refresh works and whether we have OAuth utilities to reuse" — the subagent reads dozens of files; your main thread only sees the answer.
- **Fresh-context review.** A reviewer that didn't just write the code isn't biased toward it. It finds what the author's context hides.

Define custom subagents in `.claude/agents/` with their own tools and model — a read-only `security-reviewer` on Opus, a `test-runner` limited to `Bash(npm test)`.

Check on running subagents from the `claude agents` list freely — as of 2.1.203, navigating back to that view no longer stops a running subagent and re-runs its prompt from scratch (a bug present through 2.1.202). Work in flight now carries over across the switch.

## Worktrees & background sessions — true parallelism

On desktop, each local session can spin up its own **git worktree**, so two sessions editing the same repo never collide — one refactors auth on its branch while another fixes a payments bug on hers. Background sessions keep running while you work elsewhere and notify you when they finish or need input.

## Dynamic workflows — orchestration at scale

For genuinely large work — a framework migration, a codebase-wide audit — Claude can write a script that orchestrates **tens to hundreds of subagents**, deterministically fanning out and verifying results before anything reaches you. The control flow lives in the *script's variables*, not the model's memory, which is why it holds together at that scale.

**Opting in.** Workflows are powerful and can burn a lot of tokens, so they're explicit opt-in. Add the keyword `ultracode` to a substantive request, or ask directly: "use a workflow to migrate our test suite from Jest to Vitest across all packages." For anything smaller, a single session or a couple of subagents is the cheaper right answer.

**Bounding the size.** As of 2.1.202, a **Dynamic workflow size** setting in `/config` (`unrestricted`/`small`/`medium`/`large`) tells Claude to aim for a smaller agent count — small means under 5, medium under 15, large under 50 — when it writes the script. It's advice sent to the model, not an enforced ceiling, so a broad enough prompt can still override it; the runtime's hard caps are the real backstop: within a single workflow, concurrent `agent()` calls are capped at min(16, CPU cores − 2) and total agents per run at 1,000. As of 2.1.212, there's a session-wide cap too: subagent spawns cap at 200 per session by default (raise it with `CLAUDE_CODE_MAX_SUBAGENTS_PER_SESSION`; `/clear` resets the count). As of 2.1.217, a separate session-wide concurrency cap also applies — 20 subagents running at once by default (raise it with `CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS`) — and subagents no longer spawn nested subagents of their own by default (raise `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH` to allow deeper nesting). Gauge cost on a narrow slice before widening the setting or the prompt.

## Choosing a tier

| You need… | Use |
| --- | --- |
| To answer a question without filling your context | a subagent |
| An unbiased review of a diff | a fresh-context subagent |
| Two features built at once, same repo | parallel sessions in worktrees |
| A migration/audit across hundreds of files | a dynamic workflow (`ultracode`) |

Escalate only as far as the task demands. Most work never needs more than a subagent or two.
