---
title: Cap dynamic workflow size before it caps you
date: 2026-07-07
kind: release
summary: Claude Code 2.1.202 adds a "Dynamic workflow size" setting in /config — unrestricted/small/medium/large — that tells Claude to aim for a smaller agent count when it writes a workflow script. It's advice sent to the model, not an enforced ceiling; the runtime's hard caps (16 concurrent agents, 1,000 per run) still apply regardless.
take: Set it to small ("aim for fewer than 5 agents") before your next `ultracode` request you're unsure about, and watch the agent count in `/workflows` instead of finding out from the token bill. Because it's guidance and not a lock, a prompt like "audit every file in the monorepo" can still talk Claude into overriding a small setting — so scope the prompt down too, don't rely on the config knob alone to bound spend.
tags: [workflow, apps]
related:
  - label: Guide — Subagents, parallelism & workflows
    href: /guide/05-subagents-and-workflows
  - label: Radar — Let Claude pick its own subagent models
    href: /radar/2026-07-06-delegate-model-choice-to-subagents
sources:
  - label: Claude Code docs — Orchestrate subagents at scale with dynamic workflows
    url: https://code.claude.com/docs/en/workflows
  - label: Claude Code changelog (v2.1.202)
    url: https://code.claude.com/docs/en/changelog
---

Dynamic workflows have always let a single `ultracode` prompt spawn tens to hundreds of subagents, with only the runtime's hard caps — 16 concurrent, 1,000 total — standing between a reasonable audit and a token bill you didn't expect. 2.1.202 (July 6) adds a dial for the space in between: a **Dynamic workflow size** setting in `/config` with four values — `unrestricted` (the default, no guideline), `small` (aim for fewer than 5 agents), `medium` (fewer than 15), and `large` (fewer than 50).

The important nuance is in how it's enforced. This isn't a hard cap the runtime checks — it's advice appended to what Claude sees when it writes the workflow script, so a sufficiently broad or explicit prompt can still talk Claude into a bigger run than the setting suggests. Think of it as a default lean, not a fence.

That makes it a good match for the habit this site keeps coming back to: gauge cost on a slice before committing to the whole thing. Flip to `small`, point a scoped `ultracode` prompt at one directory or one narrow question, watch the agent count and token total in `/workflows` as it runs, and only dial up to `medium` or `large` once you've seen what a run actually costs. It composes with [letting Claude pick subagent models](/radar/2026-07-06-delegate-model-choice-to-subagents) — one knob bounds how many agents spawn, the other bounds what each one costs per token.
