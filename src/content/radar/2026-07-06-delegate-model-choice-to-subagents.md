---
title: Let Claude pick its own subagent models
date: 2026-07-06
kind: tip
summary: Simon Willison relays a one-line instruction from the Claude Code team — tell Claude to send routine coding work to a subagent on whatever lower-power model fits, and keep judgment, review, and synthesis in the lead model. He reports getting far more done while his Fable allowance shrank slower than usual.
take: Drop this line into a session (or your `CLAUDE.md`) before a multi-file task — "for all coding tasks use your judgement to decide an appropriate lower power model and run that in a subagent" — and let Fable or Opus stay in the lead seat for design and review. It's a one-line habit, not a config change, so it costs nothing to try on your next feature branch and drop if it doesn't hold up for you.
tags: [models, workflow]
related:
  - label: Guide — Models & effort
    href: /guide/01-models-and-effort
  - label: Guide — Subagents, parallelism & workflows
    href: /guide/05-subagents-and-workflows
sources:
  - label: Simon Willison — Fable's judgement
    url: https://simonwillison.net/2026/Jul/3/judgement/
  - label: Simon Willison — sqlite-utils 4.0rc2, mostly written by Claude Fable (for about $149.25)
    url: https://simonwillison.net/2026/Jul/5/sqlite-utils-fable/
---

Simon Willison passes along a suggestion he says came from Cat Wu and Thariq Shihipar on the Claude Code team: instead of manually routing work to Haiku for the boring parts and Fable or Opus for the hard parts, just tell the lead model to make that call itself. His exact prompt: `for all coding tasks use your judgement to decide an appropriate lower power model and run that in a subagent`. Claude wrote itself a memory note on the policy and started spinning up Sonnet for substantive implementation and Haiku for trivial edits, while keeping design decisions, review, and synthesis in the model you're actually paying premium tokens for.

He'd already been skeptical of hands-off delegation, then tested it for real two days later shipping `sqlite-utils` 4.0rc2 — a 37-prompt, 30-file pre-release review that fixed five release-blocking bugs (including a `delete_where()` that silently failed to commit). His verdict: "I'm getting a *ton* of work done and my Fable allowance is shrinking less quickly than before."

This pairs naturally with subagents running in the background by default since 2.1.198 — you don't even see the model switch happen, you just get the summary back while the lead keeps working. It's the same instinct as the [writer/reviewer split](/radar/2026-07-04-how-engineering-teams-work) covered here Friday, pushed one level down: let the model decide the *tier*, not just the *task split*.
