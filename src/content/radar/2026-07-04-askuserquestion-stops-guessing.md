---
title: AskUserQuestion stops guessing when you're away
date: 2026-07-04
kind: release
summary: Claude Code 2.1.200 changes `AskUserQuestion` dialogs to no longer auto-continue by default. The undocumented 60-second AFK timeout that let Claude proceed on an unanswered question during long runs is now off unless you opt into an idle timeout via `/config`.
take: Leave the new default alone for overnight and unattended jobs — a stalled question is a safer failure mode than Claude silently picking an answer for you. Only turn the idle timeout back on for tasks scoped tightly enough that a guessed default genuinely can't do damage.
tags: [modes, workflow, apps]
related:
  - label: Guide — Mac & iOS command center
    href: /guide/06-mac-and-ios
  - label: Guide — the permission dial
    href: /guide/02-permission-modes
sources:
  - label: Claude Code changelog (v2.1.200, v2.1.198)
    url: https://code.claude.com/docs/en/changelog
  - label: Claude Code — Choose a permission mode
    url: https://code.claude.com/docs/en/permission-modes
---

Since 2.1.198, an unanswered `AskUserQuestion` dialog auto-continued after 60 seconds — an undocumented "AFK mode" (`CLAUDE_AFK_TIMEOUT_MS`) that injected an empty answer and let Claude carry on. Useful for truly hands-off runs, but sharp-edged: on a long job you'd stepped away from, Claude could silently guess at a decision you actually wanted to make, and you'd only find out on your phone after the fact.

2.1.200 (July 3) flips the default: `AskUserQuestion` now waits for a real answer indefinitely. If you want the old fire-and-forget behavior back — say, for a scoped overnight job where any reasonable default is fine — opt into an idle timeout explicitly through `/config`.

This actually tightens the desktop-to-phone async loop the Mac/iOS apps are built around: close the lid, get a push when Claude needs a decision, and now that decision point really does wait for your answer instead of racing a 60-second clock you couldn't see.
