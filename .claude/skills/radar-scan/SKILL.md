---
name: radar-scan
description: Sweep the official Claude Code sources for what's new, publish a dated radar entry, and refresh any guide sections that changed. Use when asked to run the radar, update the guide, or check for Claude Code news.
argument-hint: [optional focus, e.g. "models" or "the desktop app"]
---

You maintain this site — a living, power-user field guide to Claude Code. Your job in this run: find what has genuinely changed, record it on the radar, and keep the guide accurate. Write files only — the GitHub Action commits and deploys.

## 0. Orient

- Today's date: run `date -u +%Y-%m-%d`.
- Read the existing radar so you don't repeat yourself and you know how far back to look:
  - List `src/content/radar/` (filenames are `YYYY-MM-DD-slug.md`, newest date = last sweep).
  - Skim the two or three most recent entries.
- Skim the guide index (`src/content/guide/`, ordered `NN-slug.md`) so you know what the guide already claims and which section a change belongs to.

## 1. Research (official sources first)

Use WebSearch and WebFetch. A radar post can be **news, a release, a workflow or tip, or a community discussion** — anything a Claude Code power user would want to know. Always capture a link to the original so the reader can check it. Use only **public, fetchable** sources; skip anything behind a login wall (we are not using X/Twitter for now).

**Primary / official:**

- `https://code.claude.com/docs/en/changelog` — the release changelog (start here).
- `https://code.claude.com/docs/` — Claude Code docs (models, modes, skills, plugins, MCP, hooks, desktop, remote-control, routines).
- `https://platform.claude.com/docs/` — API / model / effort / fast-mode reference.
- `https://www.anthropic.com/news` and the Anthropic engineering blog — announcements.
- `https://github.com/anthropics/claude-code/releases` — release notes and public discussion.

**Community & discussion** — public endpoints that fetch reliably. Verify every claim against a primary source before repeating it:

- **Hacker News** (Algolia API, always fetchable): `https://hn.algolia.com/api/v1/search_by_date?query=claude%20code&tags=story` for newest, `https://hn.algolia.com/api/v1/search?query=claude%20code&tags=story` for top. Follow through to the linked post and the comment thread.
- **Reddit** (public JSON): `https://www.reddit.com/r/ClaudeAI/search.json?q=claude%20code&sort=new&restrict_sr=1&limit=25`; also scan r/ClaudeCode, r/ChatGPTCoding, r/LocalLLaMA "new".
- **Lobsters**: `https://lobste.rs/search?q=claude+code&what=stories&order=newest`.
- **Bluesky** (public API, no login): `https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=claude%20code&sort=latest`.
- **Independent writers & newsletters** (fetch the page directly): Simon Willison `https://simonwillison.net/tags/claude-code/`, Latent Space `https://www.latent.space/`, The Pragmatic Engineer, TLDR AI, Ben's Bites.
- **Broad sweep**: a `WebSearch` for `"Claude Code"` posts from the last day or two, to catch anything the lists above miss.

Look for anything since the last radar date worth a power user's attention: new or renamed models, effort/fast-mode changes, new modes/commands, skills/plugins/MCP/hooks, desktop/iOS/cloud (routines, remote control, dispatch) updates — and the sharp workflows, guides, or takes the community has surfaced. Favour a mix: a quiet changelog day should not mean an empty radar when the community is talking.

**Be conservative and accurate.** If you cannot confirm a claim in a primary source, do not publish it. Distinguish shipped features from research previews. If nothing material changed since the last sweep, it is fine to publish a short "quiet stretch" entry or to skip publishing entirely — say so in your final message.

## 2. Publish a radar post

Each post is a shared item **plus your point of view**. Create `src/content/radar/<today>-<slug>.md`. The frontmatter schema is strict (see `src/content.config.ts`) — match it exactly:

```markdown
---
title: Short, specific headline
date: <today, YYYY-MM-DD>
kind: news        # one of: news, release, workflow, discussion, tip, note
summary: One or two sentences — what it is and why it matters.
take: Your point of view in 1–3 sentences — an opinion, not a recap.
tags: [models, apps]                     # 2–4 lowercase tags
related:                                  # optional cross-links (base-less paths)
  - label: Guide — models & effort
    href: /guide/01-models-and-effort
  - label: Radar — an earlier post
    href: /radar/2026-06-27-async-across-surfaces
sources:                                  # at least one — where to check it
  - label: Human-readable source name
    url: https://...
---

Body in Markdown: what the item is, in a few short paragraphs. Do NOT repeat the
title as an H1 — the layout renders the title, the take, the related links, and
the sources for you. Use `code` for commands and model IDs; keep it tight.
```

Rules:

- `kind` — pick the closest category. Use `note` for editorial / meta pieces.
- `take` — **always include it.** This is the reason the post exists: give a real opinion, don't just restate the news.
- `sources` — **at least one**, a real resolving URL to the original (tweet, changelog, blog, thread).
- `related` — link to relevant guide sections and earlier radar posts. `href` is a base-less site path (`/guide/...`, `/radar/...`) or a full external URL. Do NOT hard-code the `/claude-code` base.
- `date` must equal today. Keep tags from: `models, modes, context, skills, plugins, mcp, hooks, workflow, apps, remote-control, routines, note`. One post per run unless two clearly independent things landed.

## 3. Refresh the guide

If a change contradicts or dates a guide section under `src/content/guide/`, edit that section:

- Fix the facts; keep the voice and structure.
- Bump its `updated:` frontmatter to `<today>`.
- Do not touch `order` or `title` unless the section's scope genuinely changed.
- Leave sections you didn't verify this run untouched (don't bump `updated` for cosmetic edits).

## 4. Report

End with a short plain-text summary: what you published (filename), which guide sections you touched, and anything you deliberately left out because you couldn't confirm it. Do not run git — the workflow handles commit, push, and deploy.
