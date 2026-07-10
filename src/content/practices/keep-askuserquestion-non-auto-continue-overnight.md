---
title: Let AskUserQuestion stall rather than guess on overnight jobs
when: You're running an overnight or unattended job that might hit an AskUserQuestion.
do: Leave the default (since 2.1.200 it no longer auto-continues). Only re-enable the idle timeout via /config for tasks scoped so any default is harmless.
why: A stalled question is a safer failure mode than Claude silently picking an answer and building a hundred commits on a guess you never saw.
section: 02-permission-modes
tags: [modes, apps, workflow]
since: "2.1.200"
verify: /config → the AskUserQuestion idle timeout should be off by default.
probe: { status: partial, date: 2026-07-10 }
updated: 2026-07-10
sources:
  - label: Claude Code — Permission modes
    url: https://code.claude.com/docs/en/permission-modes
---

Come back to a paused session, not to work built on an invisible assumption.
