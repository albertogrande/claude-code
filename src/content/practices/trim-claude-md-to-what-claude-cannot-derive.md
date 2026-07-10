---
title: Trim CLAUDE.md to what Claude can't derive
when: Your checked-in CLAUDE.md has grown past a screen, or /doctor flags it as bloated.
do: Cut anything Claude could derive from the codebase itself (project structure, commands visible in package.json, obvious conventions) and keep only durable constraints and non-obvious decisions. Since 2.1.206, /doctor proposes these trims for you.
why: Every session pays CLAUDE.md's tokens before any work starts — a bloated file is a permanent tax on the context budget with no marginal signal.
section: 03-context-and-memory
tags: [context]
since: "2.1.206"
verify: Run /doctor — a bloated checked-in CLAUDE.md shows up as a check with proposed trims.
updated: 2026-07-10
sources:
  - label: Claude Code changelog
    url: https://code.claude.com/docs/en/changelog
---

CLAUDE.md is for what the repo can't say — the moment a line restates the codebase, delete it.
