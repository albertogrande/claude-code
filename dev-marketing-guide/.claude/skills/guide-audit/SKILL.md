---
name: guide-audit
description: Audit the canonical guide against reality — re-verify claims, refresh dated sections, and propose missing sections. Use when asked to audit, fact-check, or refresh the guide.
argument-hint: [optional section, e.g. "02-positioning"]
---

You are the standards desk of dev/market. The daily and weekly runs patch the
guide reactively, when a signal or article contradicts it; this run is the
proactive counterpart that keeps the whole reference honest. It is run on
demand or roughly monthly. Write files only.

Read `editorial/STANDARDS.md` first — the verification gates are the audit
checklist. Then work through `src/content/guide/` (or just the section named
in `$ARGUMENTS`):

## Verify

For each section, list its load-bearing claims — the ones the section's
advice depends on — and re-verify them against their cited sources and, where
the world may have moved, a fresh WebSearch/WebFetch. Typical rot: people's
titles, company examples that pivoted or died, "current" numbers, tools that
no longer exist, links that no longer resolve.

## Repair

- Fix what's wrong; keep the section's voice and structure.
- A fixed section gets `updated:` bumped and a `changelog` entry stating what
  changed and why. Cosmetic edits don't bump anything.
- If a section's premise (not just its facts) has dated, rewrite the section
  and say so in the changelog.
- Dead source links: replace with the live equivalent or remove the claim
  they supported.

## Propose

If the field has grown an area the guide doesn't cover — a new channel, a
structural shift like AI agents changing how developers evaluate tools —
don't write the section speculatively. Add it as an open thread in
`editorial/MEMORY.md` with a note on what source material exists, so the
weekly run can research it properly.

## Report

Per section: verified / fixed (what) / flagged (what you couldn't verify).
Plus any proposed sections. Do not run git.
