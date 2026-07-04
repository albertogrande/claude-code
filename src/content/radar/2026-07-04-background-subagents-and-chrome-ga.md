---
title: Subagents go background-by-default; Claude in Chrome hits GA
date: 2026-07-04
kind: release
summary: Claude Code 2.1.198 makes background execution the default for subagents (Claude keeps working while they run) and takes the Claude in Chrome browser extension to general availability.
take: The subagent default flip is the bigger deal of the two for daily use — it was already a gradual rollout, so most sessions were quietly getting this already, but now it's guaranteed. The practical effect is that permission prompts from a subagent surface in your main session instead of blocking a foreground wait, so a delegated research task no longer freezes your own turn. Chrome GA is the one to try if you've been avoiding browser automation because it felt experimental — testing a UI change without leaving the terminal is a genuinely different workflow, not just a demo trick.
tags: [workflow, apps]
related:
  - label: Guide — subagents, parallelism & workflows
    href: /guide/05-subagents-and-workflows
sources:
  - label: Claude Code changelog — 2.1.198
    url: https://code.claude.com/docs/en/changelog
  - label: Create custom subagents — foreground/background
    url: https://code.claude.com/docs/en/sub-agents
  - label: Use Claude Code with Chrome
    url: https://code.claude.com/docs/en/chrome
---

As of version 2.1.198 (July 1, 2026), subagents run in the background by default instead of Claude choosing per-task. You keep working while a delegated subagent digs through files, and Claude is notified when it finishes — the same model background sessions already used. It doesn't change what a subagent is allowed to do: a background subagent's permission prompts still surface in your main session, naming which subagent is asking. Set a subagent's frontmatter `background: false`, or export `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS=1`, to force synchronous behavior if you'd rather wait on the result before continuing.

The same release also took **Claude in Chrome** — the browser extension that lets Claude drive a real Chrome or Edge window from the CLI or VS Code — to general availability. With `claude --chrome` (or `/chrome` mid-session), Claude can open tabs, click through a UI, read console errors, and fill forms, sharing your browser's logged-in state. It's a genuinely useful close to the "build it, then verify it" loop: paste a Figma mock, have Claude build the page, then have it open the browser, screenshot the result, and iterate — without you tabbing away from the terminal.

Also in 2.1.198: background agents launched from `claude agents` now commit, push, and open a draft PR when they finish code work in a worktree, instead of stopping to ask; and a new `Notification` hook fires on `agent_needs_input` / `agent_completed` events for background sessions.
