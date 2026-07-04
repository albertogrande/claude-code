---
title: How engineering teams actually run Claude Code
date: 2026-07-04
kind: workflow
summary: A new guide section on the team- and org-level state of the art — CLAUDE.md as versioned shared infrastructure, workflows committed as skills and plugins, parallel agents across worktrees and cloud VMs, writer/reviewer verification loops, unattended issue-to-PR pipelines, and guardrails that hold at org scale. Distilled from Anthropic's primary docs plus Boris Cherny and Andrej Karpathy.
take: Steal one habit this week — split the writer from the reviewer. Let one session build, then run `/code-review` (or a fresh subagent that sees only the diff) to grade it. A fresh context isn't biased toward code it just wrote, and it's the single cheapest way to raise a team's floor.
tags: [workflow, skills, mcp, hooks, context]
related:
  - label: Guide — How engineering teams work
    href: /guide/08-how-teams-work
  - label: Guide — Subagents, parallelism & workflows
    href: /guide/05-subagents-and-workflows
  - label: Guide — The workflows that compound
    href: /guide/07-workflows-that-compound
sources:
  - label: Anthropic — Claude Code best practices
    url: https://code.claude.com/docs/en/best-practices
  - label: Anthropic — Steering Claude Code (skills, hooks, rules, subagents)
    url: https://claude.com/blog/steering-claude-code-skills-hooks-rules-subagents-and-more
  - label: Anthropic — How Anthropic teams use Claude Code
    url: https://claude.com/blog/how-anthropic-teams-use-claude-code
  - label: Anthropic — Set up Claude Code in a monorepo or large codebase
    url: https://code.claude.com/docs/en/large-codebases
  - label: Anthropic — Equipping agents for the real world with Agent Skills
    url: https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills
  - label: The Pragmatic Engineer — Building Claude Code with Boris Cherny
    url: https://newsletter.pragmaticengineer.com/p/building-claude-code-with-boris-cherny
  - label: Latent Space — Claude Code, Anthropic's agent in your terminal (Cherny)
    url: https://www.latent.space/p/claude-code
  - label: Dwarkesh Patel — Andrej Karpathy, "AGI is still a decade away"
    url: https://www.dwarkesh.com/p/andrej-karpathy
---

Most of what's written about Claude Code is aimed at one person at one keyboard. The new [guide section 08](/guide/08-how-teams-work) is about the layer above that — the process a *team* builds around it — pulled from a fact-checked sweep of the public record.

The through-line: the artifacts that used to be tribal knowledge are now versioned, owned, and reviewed like code. `CLAUDE.md` is committed and layered (root under ~200 lines as an index, nested per-package files in monorepos, facts here and procedures in `.claude/skills/`). Workflows ship as committed skills, subagents, hooks, and installable plugins so a whole org runs the same setup. Work fans out across four documented mechanisms — worktrees, the desktop app, cloud VMs on the web, and Agent Teams (research preview) — with explicit "when to use which" guidance.

Two named voices anchor the tradeoff. Cherny runs ~5 Claude sessions at once, one checkout each, plan-mode-then-one-shot, landing 20–30 PRs a day — *"it's about how good I am at context switching."* Karpathy supplies the counterweight: keep the agent on a leash, ship small diffs, keep the human verification loop fast, and remember agents are still weak on code that's never been written before. The teams winning with this didn't remove the human from the loop — they made the loop fast, shared, and checkable.

One caveat the section is upfront about: nearly every durable team-level claim traces to Anthropic's own material. It's a strong picture of the practice as designed and dogfooded — treat louder outside claims skeptically until they show their verification.
