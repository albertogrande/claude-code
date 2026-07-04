---
title: The async workflow — Mac, phone, and cloud as one thread
date: 2026-06-27
kind: workflow
summary: Remote Control, Dispatch, and Routines turn Claude Code into an event-driven tool you kick off on the Mac and finish from your pocket.
take: Stop babysitting sessions. Fire a long job in Auto mode, walk away, and let a push notification decide when you're actually needed — that's the real unlock, not any single feature.
tags: [apps, remote-control, routines, workflow]
related:
  - label: 'Guide — Mac & iOS command center'
    href: /guide/06-mac-and-ios
  - label: 'Radar — the state of Claude Code'
    href: /radar/2026-07-04-state-of-claude-code
sources:
  - label: 'Claude Code docs — remote control'
    url: 'https://code.claude.com/docs/en/remote-control'
  - label: 'Claude Code docs — routines'
    url: 'https://code.claude.com/docs/en/routines'
---

The most consequential thing about Claude Code on the apps isn't a single feature — it's that the surfaces have stopped being separate tools and become one continuous thread.

## Three moves

**Remote Control** keeps a session running on your Mac and lets you steer it from the Claude iOS app or a browser — same filesystem, same MCP servers, same conversation. Start at the desk, continue from the couch.

**Dispatch** runs the other direction: message a task from your phone, and your awake desktop spawns a local Code session to handle it, pushing a notification when it's done or needs a decision.

**Routines** take the human out of the loop entirely — scheduled sessions on Anthropic's infrastructure, triggered by cron, webhook, or GitHub events, running even with your laptop closed.

## Why it matters

Put together, they make Claude Code **event-driven** instead of session-bound. Kick off a long job in Auto mode, close the lid, and let a push notification pull you back only when a decision is actually needed. The work happens whether you're watching or not — and when you pick it back up, on whatever device is nearest, it's the same thread you left.

A caveat worth keeping: the phone is a remote, not a dev machine, and several of these surfaces are still research previews that shift month to month. Verify the specifics in-app.
