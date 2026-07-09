---
title: 'How engineering teams work'
order: 8
summary: The state of the art in team practice — CLAUDE.md as shared infrastructure, workflows committed as skills, parallel agents across worktrees and the cloud, one agent grading another, and the guardrails that hold at org scale.
updated: 2026-07-04
---

The earlier sections are written for one person at one keyboard. This one is about the process a *team* builds around Claude Code — and here the honest caveat comes first: almost everything documented at the team level traces to Anthropic's own material (the best-practices docs, the "Steering Claude Code" and "How Anthropic teams use Claude Code" posts, the Advanced Patterns deck). It's a strong picture of the practice as *designed and dogfooded*, thinner as independent evidence that the whole industry has adopted it. Read it as the state of the art teams are converging on, not a settled census.

The org-level version of [the one rule](/guide/00-start-here) is the same: **you decide what to build, the agent decides how — but now the "what," the "how it's checked," and the "what must never happen" are shared artifacts, versioned and reviewed like code.**

## CLAUDE.md is team infrastructure, not a personal note

Check it into git so teammates inherit it — the file compounds in value over time. Beyond that, the practices that survive contact with a real team:

- **Layer it.** `~/.claude/CLAUDE.md` for your personal defaults across every repo; a committed `./CLAUDE.md` at the project root for shared team conventions; `CLAUDE.local.md` (gitignored) for private notes. In a monorepo, parent files load automatically and child files load on demand.
- **Keep the root under ~200 lines, give it an owner, and review changes to it like code.** A bloated CLAUDE.md gets *ignored* — the real rules drown. Treat the root file as an index that points elsewhere, not a manual.
- **Nest it in monorepos.** Root file for what applies everywhere, then one `CLAUDE.md` per package or per team (`packages/api/…`, `packages/web/…`). Each team loads only its own conventions; `claudeMdExcludes` skips the files a given session shouldn't see.
- **Facts in CLAUDE.md, procedures in skills.** CLAUDE.md holds what Claude should always know — build commands, layout, conventions. A deployment runbook or a security-review checklist belongs in `.claude/skills/`, where the body loads only when invoked. Path-scoped constraints go in `.claude/rules/`.

## Share the workflow, not just the config

The unit of team knowledge is no longer a wiki page — it's an executable artifact committed to the repo:

- **Skills** (`.claude/skills/SKILL.md`), **subagents** (`.claude/agents/`), and **hooks** (`.claude/settings.json`) all live in git, so the whole team runs the same workflows. Boris Cherny's example — a `fix-issue` skill invoked as `/fix-issue 1234` — is the shape: encode the routine once, everyone shares it.
- **Plugins** bundle skills, hooks, subagents, and MCP servers into one installable unit, distributed from a marketplace so an org can hand every engineer the *same* internal setup in one command.
- **Skills are portable.** The same `SKILL.md` folder runs unchanged across Claude.ai, Claude Code, the Agent SDK, and the Developer Platform — author a capability once, version it, reuse it on every surface.

## Parallelize across agents — pick the mechanism to the task

Anthropic documents four ways to run more than one session at once, with explicit "when to use which" guidance:

| Mechanism | Use when |
| --- | --- |
| **Git worktrees** — isolated checkouts, one branch each | Several *unrelated* tasks at once; edits must not collide |
| **Desktop app** — one worktree per visual session | The same, without juggling terminals |
| **Claude Code on the web** — Anthropic-managed cloud VMs | Dispatching scoped, self-contained jobs (QA, a bug fix, a PR) to run off your machine |
| **Agent Teams** *(research preview)* | Splitting one *large* task into workstreams that coordinate through shared tasks, messaging, and a team lead |

This is how Cherny personally works: ~5 Claude sessions, each in its own checkout, plan mode first, then let each **one-shot the implementation** — landing 20–30 PRs a day. His own framing: *"It's not so much about deep work, it's about how good I am at context switching."* The counterweight is Karpathy's: keep the agent **on a leash**, ship **small incremental diffs**, and keep the human verification loop fast — a 1,000-line diff you can't review isn't leverage. Parallelism multiplies throughput only when each stream stays individually checkable.

## Let one agent grade another

The highest-leverage team pattern is separating the writer from the reviewer, because **a fresh context isn't biased toward code it just wrote.**

- **Writer / Reviewer split.** One session (or a fresh subagent that sees *only* the diff and the criteria) reviews what another built. The bundled **`/code-review`** skill does exactly this — reviews the current diff for bugs in a fresh subagent and returns findings. The managed **Code Review** product fans a *fleet* of specialized agents across a PR in parallel, each hunting a different class of issue, then runs a verification pass to filter false positives.
- **Tests as the referee.** A sharp variant: have one Claude write the tests, then another write code to pass them. The test suite becomes an impartial judge neither agent can flatter.
- **Mind the over-reporter.** A reviewer *prompted to find gaps will find some*, even when the work is sound. Chasing every finding is how you over-engineer. The reviewer proposes; a human (or a tighter rubric) disposes.

## Unattended & CI — the issue-to-PR loop

Headless mode (`claude -p "…"`) is the seam between Claude Code and your pipeline — CI, pre-commit hooks, or a fan-out that loops over thousands of files with `--allowedTools` scoping what it may touch. On top of it, Anthropic's own teams run genuinely hands-off loops:

- **Issue-to-PR.** The Product Design team files a ticket describing a change and Claude proposes the code — *no one opens Claude Code*. Via GitHub Actions, PR comments (formatting, renames, test refactors) get addressed automatically.
- **Self-verifying runs.** The Claude Code team sets Claude to run builds, tests, and lints on its own output so it catches its own mistakes before a human looks — the [verification loop](/guide/07-workflows-that-compound) turned into an autonomous cron.

One caution for overnight jobs: since 2.1.200, an unanswered `AskUserQuestion` no longer auto-continues — a stalled question is a safer failure mode than a silent guess. Scope unattended work so any reasonable default is harmless, and gate the merge on a real check, not the agent's say-so.

## Guardrails that actually hold

A team rule written as a *prompt* is a suggestion. When something absolutely must not happen, the instruction is the wrong tool — **the model can miss a prompted rule under pressure, in a long session, or via prompt injection.**

- **Deterministic enforcement.** Real guardrails are **hooks and permissions**. A `PreToolUse` hook can inspect a call and exit code 2 to block it — no matter what the model decided.
- **Org-wide means admin-managed.** Managed settings are deployed by an admin and *cannot be overridden by a user's local config* — the only way to enforce a guardrail across the whole organization.
- **Route sensitive data through MCP.** Anthropic's Data Infra team reaches datasets through an MCP server rather than a raw CLI, precisely so access is controlled and logged.

## The honest edge

Two tempering facts to carry out of this section. First, the evidence is concentrated: this is largely how *Anthropic* works and what *Anthropic* recommends — treat outside claims of dramatic team results skeptically until they show their verification. Second, Karpathy's caution is load-bearing — agents are still weak on **code that's never been written before**, and the realistic horizon is a *decade of agents*, not a year. The teams getting the most out of Claude Code today aren't the ones who removed the human from the loop; they're the ones who made the loop **fast, shared, and checkable.**
