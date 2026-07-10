---
title: Run /doctor first when setup misbehaves
when: Claude Code acts oddly after an update — hooks not firing, an MCP server missing, settings seemingly ignored — or you inherit a machine you didn't configure.
do: Run /doctor (alias /checkup) before hand-debugging config files. Since 2.1.205 it diagnoses AND fixes setup issues, and since 2.1.206 it also flags bloated checked-in CLAUDE.md files.
why: A full checkup finds the broken hook, stale binary, or misconfigured server in seconds; spelunking through settings.json and ~/.claude by hand takes an afternoon and misses the same things.
section: 06-mac-and-ios
tags: [apps]
since: "2.1.205"
verify: Run /doctor — it should walk a checklist of setup checks and offer fixes; /checkup is an alias.
updated: 2026-07-10
sources:
  - label: Claude Code changelog
    url: https://code.claude.com/docs/en/changelog
---

The habit is "checkup first, spelunk second" — the tool now knows more failure modes than you remember.
