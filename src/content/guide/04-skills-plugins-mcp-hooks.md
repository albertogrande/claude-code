---
title: 'Skills, plugins, MCP & hooks'
order: 4
summary: Four ways to teach Claude new tricks — and how to tell which one you actually need.
updated: 2026-07-04
---

Four extensibility surfaces, each solving a different problem. Knowing which is which saves you from reaching for the wrong one.

## The four

**Skills** — reusable playbooks in a `SKILL.md` file. Claude auto-loads one when relevant, or you invoke `/skill-name`. The body loads only on use, so long reference material costs nothing until needed. This is how you package a repeatable workflow ("fix a GitHub issue end to end").

**Plugins** — a bundle of skills, agents, hooks, and MCP servers, installed from a marketplace. Browse and manage them from the desktop app's **+ → Plugins** panel, no terminal required. This is how capability is shared and distributed.

**MCP servers** — the open protocol connecting Claude to outside tools: GitHub, Postgres, Slack, Notion, Sentry. Add them as **Connectors** in the desktop app with a guided OAuth flow. This is how Claude reaches external data and actions.

**Hooks** — shell commands that fire on lifecycle events (before a tool runs, after an edit, on stop). *Deterministic* — they always happen, unlike advice in CLAUDE.md. This is how you enforce rather than ask.

## The distinction that matters

A **skill** is capability Claude *chooses* to use. A **hook** is automation the harness *guarantees*. If you catch yourself writing "always run the linter after editing" in CLAUDE.md and it keeps getting skipped — that's a hook, not a rule. Just ask Claude: "write a hook that runs eslint after every file edit."

Likewise, a **slash command** and a **skill** overlap (both give you `/name`), but skills add a supporting-files directory, auto-invocation, frontmatter control, and the ability to run in a forked subagent. Reach for a skill when the workflow is more than one line.

## A security note on MCP

Project-scoped MCP servers require a trust approval, and anything a server fetches from the outside world is a potential prompt-injection vector. Add connectors you trust, keep the sensitive ones behind auth, and let auto mode's input screening handle the rest. Tools are also deferred by default — Claude searches for the ones it needs rather than loading every server's toolset into context — so you can connect many servers without paying for them upfront.
