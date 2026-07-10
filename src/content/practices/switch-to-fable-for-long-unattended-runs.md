---
title: Switch to Fable for long unattended runs
when: A task will run 30+ minutes largely unattended (an overnight migration, a big multi-file refactor, a workflow fleet).
do: Switch the session to Fable before you kick it off.
why: Fable is Opus-class reasoning with faster output, so a long autonomous run finishes sooner without dropping quality. Keep Opus/Sonnet for short interactive work where latency matters less than the marginal reasoning.
section: 01-models-and-effort
tags: [models, workflow, apps]
probe: { status: diverge, date: 2026-07-10 }
updated: 2026-07-09
sources:
  - label: Guide — Models & effort
    url: https://albertogrande.github.io/claude-code/guide/01-models-and-effort
---

Fable is the ceiling, not the default — reach for it when a task's wall-clock time, not its difficulty, is the constraint.
