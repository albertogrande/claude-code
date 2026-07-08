---
title: Switching away from a running agent no longer nukes its work
date: 2026-07-08
kind: release
summary: Claude Code 2.1.203 fixes a bug where returning to the `claude agents` list silently stopped a running subagent and re-ran its prompt from scratch. Work now carries over across the switch. The same release also fixes a 15–20 second stall opening or switching background sessions on macOS.
take: If you've been avoiding the agents list while something long-running was in flight — out of fear of losing that work — the reason is gone as of 2.1.203. Go back to checking in on background subagents from the list freely instead of babysitting a single pane; on macOS, the same release also kills the 15–20s stall that made switching sessions feel broken.
tags: [apps, workflow]
related:
  - label: Guide — Subagents, parallelism & workflows
    href: /guide/05-subagents-and-workflows
  - label: Guide — Mac & iOS command center
    href: /guide/06-mac-and-ios
sources:
  - label: Claude Code changelog (v2.1.203)
    url: https://code.claude.com/docs/en/changelog
  - label: GitHub — Claude Code release v2.1.203
    url: https://github.com/anthropics/claude-code/releases/tag/v2.1.203
---

Since background-by-default subagents shipped in 2.1.198, the `claude agents` view has been the natural place to check on work in flight — a list of what's running, what's waiting on you, what's done. But navigating back to that list while a subagent was mid-task had a nasty side effect: it silently stopped the subagent and re-ran its prompt from scratch, discarding whatever progress it had made. No error, no warning — just wasted time and tokens, and a worse habit of avoiding the list altogether while something was running.

2.1.203 (July 7) fixes it: returning to `claude agents` now leaves running subagents alone and their work carries over. The same release also fixes a macOS-specific regression from 2.1.196 where opening or switching background agent sessions stalled for 15–20 seconds due to a false low-memory detection — a second reason switching between sessions felt worse than it should have.

Neither fix changes anything you need to configure. It's worth knowing about specifically because it removes a reason to avoid a normal habit — checking the agents list mid-run — that the bug had quietly trained you out of.
