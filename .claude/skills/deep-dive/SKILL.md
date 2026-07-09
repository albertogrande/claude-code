---
name: deep-dive
description: Write one standalone, researched deep-dive essay (~1,500–3,000 words) on a Claude Code subject that has earned the depth — commissioned by the weekly editor from editorial memory, or named by the user. Researches history, mechanics, trade-offs, and the strongest counter-case, then writes an opinionated, sourced piece to src/content/deep-dives/. Use when asked for a deep dive, optionally with a topic.
---

# Deep Dive

You write the long-form desk for this site — a power-user field guide to
**Claude Code**. Read `editorial/TASTE.md`: the reader is a heavy daily user in
the macOS and iOS apps who wants practical, sourced, opinionated depth. Where
the guide is the reference and the weekly is the pulse, the deep dive takes one
subject all the way down: how it works, the trade-offs, the numbers, the
strongest case against your read, and a thesis the reader can act on.

## Step 1 — Choose the topic

- **Topic given (by the user or the weekly editor's commission):** that's it.
  Sharpen it into an answerable question (e.g. "subagent models" → "When is it
  worth delegating to a cheaper subagent model, and when does it cost you?").
- **No topic given:** read `editorial/MEMORY.md` — take the top **deep-dive
  candidate**. If none is ripe, run 3–5 orientation searches over the last few
  weeks and pick the one subject a power user will still find useful in three
  months. Your judgment.

Always check MEMORY's coverage index first: don't repeat a past dive unless the
story moved materially — if it did, frame the piece as an update and link the
original. The dive must reflect `editorial/TASTE.md`.

## Step 2 — Research deep, not wide

For the one subject:
- **Mechanics**: how it actually works — read the primary docs properly, not
  the summary. Get the exact behaviour, flags, defaults, limits.
- **History**: how did we get here? What did it replace? Search beyond this week.
- **Trade-offs and numbers**: the 3–5 quantities the decision turns on (token
  cost, agent caps, context budget, latency). Find primary figures.
- **The discussion**: what practitioners actually argued — HN comment threads
  (Algolia API), Reddit (r/ClaudeAI, r/ClaudeCode), GitHub issues, power-user
  blogs (Simon Willison et al.). The best paragraph of context is often a
  comment — quote it, linked and attributed.
- **The other side**: actively find the strongest counter-take and steelman it
  before you answer it.

WebFetch **at least 5 primary sources** and read them. Verify numbers against
primaries; flag anything single-sourced.

## Step 3 — Write

Write `src/content/deep-dives/<YYYY-MM-DD>-<slug>.md` (date = today, UTC:
`date -u +%Y-%m-%d`). Frontmatter schema is strict (see `src/content.config.ts`):

```markdown
---
title: Sharp, specific headline
date: <today>
summary: One or two sentences — what it is and the thesis.
dek: Optional longer standfirst rendered under the title.
tags: [models, workflow]   # 2–4 lowercase, from the guide's areas
related:                   # guide sections, earlier dives, weekly issues
  - label: Guide — Models & effort
    href: /guide/01-models-and-effort
sources:                   # at least 3 resolving URLs; prefer primary
  - label: Claude Code docs — …
    url: https://code.claude.com/docs/en/…
---

<The essay. ~1,500–3,000 words. Do NOT repeat the title as an H1 — the layout
renders title, dek, related, and sources. Subheads as the argument needs them.
Use `code` for commands, flags, and model IDs.>
```

**Voice** (from TASTE.md): clarity above all — short sentences, simple words.
Depth from reporting (numbers, primary sources, exact behaviour, named
practitioners), not from rhetoric. Opinionated: state the thesis in one plain
sentence and defend it. Default shape: what it is → how it works → the
trade-off → what the reader should do. Frame for the macOS/iOS apps.

## Step 4 — Update memory

In `editorial/MEMORY.md`: retire the deep-dive candidate you just wrote (or note
what's left open), attach the dive to its running thread, and append one line to
the published coverage index (date, "dive", title, topics).

## Step 5 — Save

Write the dive and the memory update. Do **not** commit or push — in CI the
workflow publishes; in an interactive session, tell the user where the file is.
