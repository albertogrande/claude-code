---
title: Artifacts open up beyond Team and Enterprise
date: 2026-07-05
kind: news
summary: Claude Code's Artifacts feature — publishing session work as a live, interactive page at a private claude.ai URL — is no longer gated to Team and Enterprise. Pro and Max plan users now get it too; on those plans the page stays private to you, with no org-sharing control.
take: Stop pasting long investigation output or PR walkthroughs into Slack or Notes. Ask for an artifact instead — "make an artifact that walks through this PR with the diff annotated" or "build a dashboard artifact of last week's deploy failures" — and press `Ctrl+]` to reopen the latest one from any session. On a Mac it's a second screen that updates itself while a long task runs; on Pro/Max it's just for you, which is exactly right for a personal migration checklist or debugging timeline you want to check from your phone without a teammate needing access.
tags: [apps, workflow]
related:
  - label: Guide — Mac & iOS command center
    href: /guide/06-mac-and-ios
  - label: Guide — The workflows that compound
    href: /guide/07-workflows-that-compound
sources:
  - label: Claude Code docs — Share session output as artifacts
    url: https://code.claude.com/docs/en/artifacts
  - label: AlternativeTo — Claude Code Artifacts now available for Pro and Max plan users
    url: https://alternativeto.net/news/2026/7/claude-code-artifacts-now-available-for-pro-and-max-plan-users/
---

Artifacts shipped in beta in mid-June for Team and Enterprise: ask Claude to turn session output into a self-contained HTML page — a PR walkthrough, a dashboard built from data the session pulled, a set of options laid out side by side — and it publishes to a private URL that updates in place as the session keeps working. As of early July, that's no longer tied to a paid seat: Pro and Max accounts get it too.

The tradeoff by plan is worth knowing before you reach for it. On Pro and Max, an artifact stays private to your account — there's no admin management and no **Share** control, so it's a solo tool. On Team and Enterprise, the page header gets a **Share** control to grant access to specific people or the whole org, plus an audit-log trail and org-level retention settings. Either way it's one static page (16 MiB cap, no backend, no external network calls — CSS/JS inlined, images as data URIs), so it's built for "look at this," not "type into this."

It requires a session signed in with `/login` on the Anthropic API — not available on Bedrock, Vertex, or Foundry, and off by default in the Agent SDK, GitHub Action, and MCP-server contexts. If Claude writes a local HTML file instead of a link, that's the tell that artifacts aren't enabled for the session.
