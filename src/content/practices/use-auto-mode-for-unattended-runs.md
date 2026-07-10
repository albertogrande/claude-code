---
title: Use auto mode for unattended runs, bypass only for sandboxes
when: You're starting a long or unattended run and don't want to approve 200 prompts.
do: Use auto mode and scope what "trusted" means (your repos, buckets, internal domains). Reserve bypass mode for disposable sandboxes only.
why: Auto mode's classifier screens each action and tool output, blocking the genuinely dangerous while letting routine work flow — safety without babysitting. Bypass turns that off entirely.
section: 02-permission-modes
tags: [modes, workflow]
since: "2.1.205"
verify: Docs — permission modes; 2.1.205 changelog entries on auto-mode hardening (transcript-tamper block, rm -rf confirmation).
updated: 2026-07-10
sources:
  - label: Guide — Permission modes
    url: https://albertogrande.github.io/claude-code/guide/02-permission-modes
---

Since 2.1.205 auto mode also blocks transcript tampering and asks before `rm -rf` on an unresolved variable — the screen keeps hardening.
