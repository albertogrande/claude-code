# Morning report — 2026-07-05 overnight build

**Outcome: the developer-marketing living guide is built, seeded with real
sourced content, and building cleanly on branch
`claude/fable-five-mission-review-hbon60`, in `dev-marketing-guide/`.**

## What you'll find

A self-contained Astro 5 site (its own package.json, config, README,
workflows) with the four product parts from the brief:

- **The guide** — canonical reference with three real sections written
  tonight (Start here / The developer audience / Positioning and messaging),
  each fully sourced from the §12 referents (Frankl, Lee Robinson, Czakon,
  plus Helen Min and PostHog) and carrying a visible per-section changelog.
- **Signals** — the daily feed. One real signal published: Helen Min and
  Matt Palmer's AI-era rewrite of the developer-brand playbook.
- **Articles** — one real deep dive: *"AI changed your audience, not the
  rules of developer marketing"*, promoted from that signal so you can see
  the whole promotion loop working (signal shows a "promoted" banner linking
  forward; the article links back; the guide section it touched cites both).
  **This is the piece to read to judge the writing system.**
- **The autonomous desk** — three skills (`daily-signal`,
  `promote-article`, `guide-audit`) bound to a shared editorial contract
  (`editorial/STANDARDS.md`: anti-slop blacklist, five verification gates,
  take doctrine), plus daily/weekly GitHub workflows. The workflows are
  inert while the project sits in this subdirectory and activate when you
  extract it to its own repo (documented in the README).

## Key decisions and why (full reasoning in ARCHITECTURE-DECISIONS.md)

- **Kept the Astro/Pagefind stack**, spent the redesign budget on the
  editorial layer — that's where article quality is made.
- **Promotion is data, not prose**: signals have `status`/`promotedTo`,
  articles have `fromSignal`, guide sections have sourced changelogs. The
  feedback loop is visible on the page and validated at build time.
- **Scout/writer separation without a second cron**: one daily run, three
  forced roles, with the scout's full catch persisted to `editorial/queue/`
  so unchosen candidates become the weekly article run's leads.
- **Conditional publication**: the article desk evaluates weekly but
  publishes only when a candidate passes four promotion tests; "nothing this
  week" is a documented success state. No filler by design.
- **Strict schemas as quality floor**: a signal without a take or a source
  is a red CI build, not a weak page.

## What I verified

- `npm run build` (Astro + Pagefind) exits 0, 11 pages, zero errors.
- Every internal link in the built site resolves (scripted check over dist/).
- Every load-bearing claim in the published content was verified against a
  source fetched during the run. Two things I deliberately did NOT print:
  Lee Robinson's "VP of DX" title at Cursor (his site confirms Cursor, not
  the title) and the neptune.ai→OpenAI acquisition (no primary source found;
  flagged in editorial/SOURCES.md as a standing caution).
- Scope: nothing outside `dev-marketing-guide/` was touched.

## What I deferred (with reasoning in the decisions doc)

Predictions/Brier scoring, cost ledger, Python validators, ISO-week signal
folders, and guide sections 03–07 (planned TOC is in the decisions doc —
the weekly desk grows the guide rather than shipping stubs).

## Three things for you to weigh in on

1. **Cadence and cost**: daily signal + weekly article ≈ ~10 Claude runs a
   week on your token. Happy with that, or start signal-only (comment out
   `article.yml`'s cron and run it manually the first few weeks)?
2. **The name**: I shipped the working identity **dev/market** (nameplate,
   tagline, base path `/dev-marketing-guide`). Cheap to change now, annoying
   after extraction — say the word and I'll rebrand.
3. **Article model**: `article.yml` runs the weekly desk on
   `claude-fable-5` (the writing quality is the product; the daily signal
   stays on Sonnet). If cost bites, downgrading the weekly run is one line.

One caveat to be transparent about: signal and article carry the same date
because the loop was seeded in one night; in production they'd be days
apart. And the seed signal covers an Oct 2025 piece — chosen as the best
on-thesis grounding available from the brief's source list, not as "today's
news"; the daily cron takes over freshness from here.
