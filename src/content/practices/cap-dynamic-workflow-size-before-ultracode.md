---
title: Cap dynamic workflow size before an uncertain ultracode run
when: You're about to make an ultracode / multi-agent request whose scale you're unsure about.
do: Set Dynamic workflow size to small in /config AND scope the prompt down. Watch the count in /workflows.
why: The size setting is advice to the model, not an enforced ceiling (the 16-concurrent / 1,000-per-run hard caps still apply), and a broad prompt can still talk Claude past a small setting. Bounding spend takes both the knob and a tight prompt.
section: 05-subagents-and-workflows
tags: [workflow, apps]
since: "2.1.202"
verify: /config → Dynamic workflow size shows unrestricted/small/medium/large; /workflows shows the live agent count.
updated: 2026-07-10
sources:
  - label: Claude Code docs — Dynamic workflows
    url: https://code.claude.com/docs/en/workflows
---

Find out the agent count from /workflows, not from the bill.
