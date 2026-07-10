---
title: Delegate routine coding to a lower-power subagent
when: A multi-file task has a lot of mechanical coding (boilerplate, edits, wiring) around a few real decisions.
do: Tell Claude to run the routine coding in a subagent on an appropriate lower-power model, and keep judgment, review, and synthesis in the lead model. Drop the instruction in the session or your CLAUDE.md.
why: You get more throughput while the lead model's allowance drains slower — the expensive model only spends on decisions, not typing.
section: 05-subagents-and-workflows
tags: [models, workflow]
probe: { status: agree, date: 2026-07-10 }
updated: 2026-07-09
sources:
  - label: Simon Willison — Fable's judgement
    url: https://simonwillison.net/2026/Jul/3/judgement/
---

A one-line habit, not a config change: "for all coding tasks use your judgement to pick an appropriate lower-power model and run it in a subagent."
