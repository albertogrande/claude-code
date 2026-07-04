---
name: radar-scan
description: Sweep the official Claude Code sources for what's new, publish a dated radar entry, and refresh any guide sections that changed. Use when asked to run the radar, update SOTA, or check for Claude Code news.
argument-hint: [optional focus, e.g. "models" or "the desktop app"]
---

You maintain **SOTA**, a living field guide to the state of the art in Claude Code. Your job in this run: find what has genuinely changed, record it on the radar, and keep the guide accurate. Write files only — the GitHub Action commits and deploys.

## 0. Orient

- Today's date: run `date -u +%Y-%m-%d`.
- Read the existing radar so you don't repeat yourself and you know how far back to look:
  - List `src/content/radar/` (filenames are `YYYY-MM-DD-slug.md`, newest date = last sweep).
  - Skim the two or three most recent entries.
- Skim the guide index (`src/content/guide/`, ordered `NN-slug.md`) so you know what the guide already claims and which section a change belongs to.

## 1. Research (official sources first)

Use WebSearch and WebFetch. **Prefer primary sources** and cite exact URLs:

- `https://code.claude.com/docs/en/changelog` — the release changelog (start here).
- `https://code.claude.com/docs/` — Claude Code docs (models, modes, skills, plugins, MCP, hooks, desktop, remote-control, routines).
- `https://platform.claude.com/docs/` — API/model/effort/fast-mode reference.
- `https://www.anthropic.com/news` and the Anthropic engineering blog — announcements.

Look for changes since the last radar date: new or renamed models and model IDs, effort/fast-mode changes, new permission modes, new commands, skills/plugins/MCP/hooks changes, and desktop/iOS/cloud (routines, remote control, dispatch) updates.

**Be conservative and accurate.** If you cannot confirm a claim in a primary source, do not publish it. Distinguish shipped features from research previews. If nothing material changed since the last sweep, it is fine to publish a short "quiet stretch" entry or to skip publishing entirely — say so in your final message.

## 2. Publish a radar entry

If there's something worth recording, create `src/content/radar/<today>-<slug>.md`. The frontmatter schema is strict (see `src/content.config.ts`) — match it exactly:

```markdown
---
title: Short, specific headline
date: <today, YYYY-MM-DD>
summary: One or two sentences — what changed and why it matters.
tags: [models, modes, apps, skills, workflow]   # 2–4 lowercase tags
sources:
  - label: Human-readable source name
    url: https://code.claude.com/docs/en/...
---

Body in Markdown. Do NOT repeat the title as an H1 — the layout renders it.
Lead with the change, then what it means for a power user on the Mac/iOS apps.
Use `##` subheads, short paragraphs, and `code` for commands and model IDs.
Every factual claim should trace to a listed source.
```

Rules: `date` must equal today. Give real, resolving `sources` URLs. Keep tags from a small vocabulary (`models`, `modes`, `context`, `skills`, `plugins`, `mcp`, `hooks`, `workflow`, `apps`, `remote-control`, `routines`, `snapshot`). One entry per run unless two clearly independent things shipped.

## 3. Refresh the guide

If a change contradicts or dates a guide section under `src/content/guide/`, edit that section:

- Fix the facts; keep the voice and structure.
- Bump its `updated:` frontmatter to `<today>`.
- Do not touch `order` or `title` unless the section's scope genuinely changed.
- Leave sections you didn't verify this run untouched (don't bump `updated` for cosmetic edits).

## 4. Report

End with a short plain-text summary: what you published (filename), which guide sections you touched, and anything you deliberately left out because you couldn't confirm it. Do not run git — the workflow handles commit, push, and deploy.
