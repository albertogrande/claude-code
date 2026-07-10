> **Archived 2026-07-10.** This is the one-shot mission brief that commissioned the
> `dev-marketing-guide` build (delivered on branch `claude/dev-marketing-fable-build`).
> Its §3 description of this repo predates the scout/weekly/deep-dive refactor —
> `radar-scan`, the `radar/` collection, and `radar.yml` no longer exist. Kept for
> the record; do not execute it against today's repo layout.

# FABLE 5 MISSION — Build the "State of the Art in Developer Marketing" living guide

> **This file is a self-contained mission brief.** It was written by an Opus 4.8
> session on 2026-07-05 and committed to `main` so that a **fresh Claude Fable 5
> session** can pick it up on clone and execute it **autonomously, overnight,
> unattended**. The owner (Alberto Grande, grande.temprado@gmail.com) will review
> the result in the morning. There is no human to answer questions mid-run.
>
> **If you are the executing Fable 5 session: read this whole file first, then go.**

---

## 0. How to start (first actions)

1. Read this entire file.
2. Read the two reference architectures (details in §3 and §4). At minimum:
   - This repo's site: `src/`, `src/content.config.ts`, `.claude/skills/radar-scan/SKILL.md`, `.github/workflows/`, `README.md`, `astro.config.mjs`.
   - `docs/developer-marketing-guide-brief.md` on branch `claude/developer-marketing-referents-ap6sfx` (earlier context capture — optional, this file supersedes it).
   - `the-wire` (public): https://github.com/albertogrande/the-wire — fetch its README and browse structure.
3. Create your working branch and build there (see §10). **Do not build on `main`.**
4. Work autonomously to the Definition of Done (§11). Commit incrementally. Push your branch.
5. Leave a plain-language morning report as the final commit (`MORNING-REPORT.md` in your build dir) and in your final message.

---

## 1. The experiment — why this mission exists

This is not just "build a website." It is a **controlled experiment**: the owner
wants to see **how Claude Fable 5 improves an existing architecture and
implementation** when given the strongest reasoning and full autonomy — versus the
prior systems, which were built by earlier models.

So two things are being measured tomorrow morning:

1. **Technical**: how you re-architect and re-implement, given two prior designs as reference.
2. **Output quality**: whether your **writing/editorial system produces better articles** — because the owner is the *reader*, and article quality is the ultimate deliverable.

Therefore: **do not copy the reference architectures. Redesign them.** Make your own
decisions, and *document why* (see §8). The value is in the delta and the reasoning
behind it, not in a faithful clone.

---

## 2. Product vision

A **living guide to the state of the art of developer marketing** — same concept as
this repo's Claude Code field guide, but for the world of **developer marketing /
DevRel / developer experience**. It has four parts:

1. **Canonical guide (evergreen).** A structured reference on the state of the art
   of developer marketing that is **kept current** as new information appears.
2. **Signals (daily).** A feed that **captures daily** the important news/updates in
   developer marketing, DevRel and DevEx, stored as dated entries.
3. **Articles (conditional).** When a signal is **relevant enough**, it is worked up
   into a richer standalone article/deep-dive.
4. **Feedback loop.** Signals and articles **feed back into the canonical guide**,
   keeping the "state of the art" current.

Primary focus: **developer marketing for DevTools** (pure marketing, not only DevRel),
but signals also cover DevRel and developer experience.

---

## 3. Reference architecture A — `claude-code` (THIS repo, the distilled model)

A power-user field guide to Claude Code. **Astro 5 + SCSS + GitHub Pages**, content
100% **frontmatter-driven** so an autonomous agent can write it deterministically.

- **Collections** (`src/content.config.ts`, zod schemas):
  - `guide/` — evergreen reference, one file per section `NN-slug.md`; frontmatter `title, order, summary, updated`.
  - `radar/` — dated daily signals `YYYY-MM-DD-slug.md`; frontmatter `title, date, kind(enum), summary, take, tags, related, sources`.
  - `deep-dives/` — long researched articles `YYYY-MM-DD-slug.md`; frontmatter `title, date, updated?, summary, dek?, tags, related, sources`.
- **Autonomous skill** `.claude/skills/radar-scan/SKILL.md` — the playbook: sweep public sources, publish **one** most-relevant actionable signal per day, refresh affected guide sections. Rules: public verifiable sources only, always an actionable `take`, ≥1 `source`, cross-linked `related`.
- **Workflows** (`.github/workflows/`): `radar.yml` (daily cron `0 5 * * *` UTC via `anthropics/claude-code-action@v1`, commits), `deploy.yml` (Pages), `ci.yml` (build check). Needs secret `CLAUDE_CODE_OAUTH_TOKEN`.
- **Front-end**: `src/layouts/` (BaseLayout + ReadingLayout), `src/components/` (Chrome/nav, Head, Footer, Shortcuts ⌘K palette), `src/pages/` (index, guide/, radar/, deep-dives/, about, feed.xml.ts), `src/styles/main.scss` (design system, inherited from The Wire), `src/lib/site.ts`. Search via Pagefind.

**Character:** single domain, single reader, ONE skill and ONE cron doing scout+publish+refresh in a single pass. No separation of scout/writer, no memory, no predictions.

## 4. Reference architecture B — `the-wire` (the original, more advanced)

Public: https://github.com/albertogrande/the-wire — an autonomous AI "newsroom" with
9 editorial beats. Same base stack (Astro + SCSS + GitHub Pages) plus **Python**
validators. This is the richer system the owner built first; `claude-code` is its
distilled descendant. **Study it — it holds the patterns worth borrowing.**

- **Folders:** `signals/` (daily raw intelligence, organized by **ISO week**, e.g. `2026-W23`); `reports/` (published: weeklies `2026-W23.md`, `reports/deep-dives/`, `reports/quarters/`, `reports/MEMORY.md` = running threads + predictions ledger + Brier scorecard, `reports/TASTE.md` = reader preferences); `_data/` (`predictions.yml`, `threads.yml`); `scripts/` (`check_predictions.py`, `check_threads.py`); `.claude/skills/` (one playbook per desk); `usage/ledger.csv` (per-run cost).
- **Crons (several, Madrid time):** `daily-scout.yml` (00:00, commits raw signals), `daily-dive.yml` (Tue–Sun 01:00, rotating columnist pieces), `weekly-news.yml` (Mon 02:00, weekly essay + mailbag), `prediction-watch.yml` (daily, flags due predictions), `ci.yml` (per-PR validation).
- **Differential systems:** **scout→writer separation** (collection decoupled from writing), **memory/threads** for continuity and anti-redundancy across issues, **predictions with Brier scoring**, **cost ledger**, Python **data-integrity validators**.

**Preliminary steer (yours to override):** start from the `claude-code` skeleton
(guide + signals + articles) and adopt from `the-wire` the **scout/writer separation**
and the **ISO-week signal feed**; treat memory/threads and predictions/Brier as
options to include if you judge they raise quality. **You decide.**

---

## 5. Your mandate — redesign, don't copy

You are expected to apply your strongest reasoning (`ultrathink` where it helps) to
**design a new architecture** that improves on both references. Decide, for example:

- The collection model and content schemas (what fields raise quality and machine-writability).
- Whether/how to separate **scout → writer → editor**, and the cron cadence.
- The **signal → article → canonical-guide feedback loop** mechanics (how a signal gets promoted; how the guide stays current without drift).
- Continuity systems (memory/threads/source registry) if they improve coherence.
- The section structure of the canonical developer-marketing guide.
- The daily source list to sweep (adapt to this domain — see §12).
- The design system / visual identity (adapt, keep it clean and readable).

Make the calls. Don't ask — there's no one awake. Where you're genuinely unsure,
pick the better-reasoned default, ship it, and record the tradeoff in the decisions
doc (§8).

---

## 6. Output quality is the point — the writer/editor system

The owner cares **most** about the quality of the **articles he reads**. A better
technical architecture matters only insofar as it produces better writing. So the
**writer/editor prompt system is the centerpiece**, and it should be a clear step up
from the prior `radar-scan` skill. Design it deliberately. Consider:

- **A real editorial standard**: a distinct voice, a point of view (`take`) doctrine, a "one plain-sentence outcome first" rule, strong nut-graf/standfirst discipline.
- **Anti-slop rules**: no hedging filler, no throat-clearing, no "in today's fast-paced world"; concrete over generic; show the specific example, name names, link sources.
- **Verification/fact-check gates**: every load-bearing claim tied to a fetched public source; distinguish shipped vs. announced vs. rumored; if unverified, say so.
- **Separation of concerns**: a *scout* that captures signal, a *writer* that drafts, an *editor/critic* pass that raises the bar before publish (you may implement this as multiple skills or a multi-agent workflow).
- **Reader-tuned**: write for a sophisticated practitioner who consumes a lot of dev-marketing content and hates fluff. Earn his attention every paragraph.

Prove it: ship **at least one fully-written sample article (deep-dive)** and **one
sample signal** grounded in the source material in §12, so the owner can *read the
difference* tomorrow — that is the experiment's payoff.

Prompting note for yourself: prefer stating goals and standards over prescriptive
step lists; soften legacy "CRITICAL: you MUST" phrasing; give the whole spec up front.

---

## 7. Deliverables

1. A **new, self-contained project** (Astro or your justified choice) that **builds
   cleanly**, in `dev-marketing-guide/` on your working branch (§10).
2. The **redesigned architecture**, implemented: collections/schemas, layouts,
   pages, design system, search.
3. The **autonomous content system**: scout/writer/editor skill(s) and the
   workflow(s)/cron(s) that run them.
4. **Sample content that demonstrates quality**: ≥1 canonical guide section, ≥1
   signal, ≥1 deep-dive article — all real, sourced, readable.
5. **`ARCHITECTURE-DECISIONS.md`** (§8) — the learning artifact.
6. **`MORNING-REPORT.md`** — plain-language summary for the owner's review (§11).

## 8. `ARCHITECTURE-DECISIONS.md` — the learning artifact (required)

The owner wants to *learn how Fable 5 improves an existing system*. Write this doc so
he can see **what changed, where, and why**. Structure it in three explicit parts:

- **(A) Technical architecture improvements** — each decision vs. `claude-code`
  and/or `the-wire`: what you changed, where (file/collection/workflow), and the
  reasoning + tradeoff.
- **(B) Prompt & reasoning improvements** — how your scout/writer/editor prompts
  differ from the prior `radar-scan`, and *why* those changes should raise quality.
- **(C) Expected impact on article quality** — connect A and B to the reader's
  experience: concretely, why the sample article reads better than the old system
  would have produced. Point at specific lines if you can.

Be honest about uncertainty and anything you deliberately deferred.

## 9. Autonomy guardrails (overnight, unattended)

- **You operate alone.** The user isn't watching and can't answer mid-task. For
  reversible actions that follow from this brief, **proceed without asking**.
- **Don't stop early** over token/context-budget worries. Context auto-compacts;
  save state to a progress file so you can resume, and keep going to Done.
- **Ground every progress claim** in a real tool result. If tests fail, say so with
  output; if you skipped something, say that. No fake "done."
- **Gates before declaring done:** the project **must build** (`npm run build` or
  equivalent) and internal links must resolve. Don't claim victory until gates pass.
- **Scope discipline:** build the new project; **do not modify** the existing
  Claude Code site (`src/`, `.claude/skills/radar-scan/`, `.github/workflows/`,
  `README.md`) or anything on `main` other than adding your own files if needed.
- **Don't over-build:** the simplest thing that meets the quality bar. No gratuitous
  abstractions.

## 10. Git flow & where to build

- Start from `main`. Create and work on a **new branch**:
  `claude/dev-marketing-fable-build`.
- Build the project in a **subdirectory**: `dev-marketing-guide/`. (It's a *staging*
  location; the owner will later extract it into its own dedicated repo — so keep it
  self-contained: its own `package.json`, config, README, `.github/` templates it
  would need as a standalone repo.)
- Commit **incrementally** with clear messages. End commit messages with:
  `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`
- Push your branch (`git push -u origin claude/dev-marketing-fable-build`), retrying
  with exponential backoff on network errors. **Do not push to `main`.** **Do not**
  open a pull request unless the owner later asks.

## 11. Definition of done / morning review checklist

By morning, on branch `claude/dev-marketing-fable-build`, the owner should find:

- [ ] `dev-marketing-guide/` — a project that **builds cleanly** (say how you verified).
- [ ] Redesigned architecture implemented (collections, schemas, pages, design system, search).
- [ ] Autonomous scout/writer/editor skill(s) + workflow(s)/cron(s).
- [ ] ≥1 canonical guide section, ≥1 signal, ≥1 deep-dive article — real and sourced.
- [ ] `ARCHITECTURE-DECISIONS.md` with parts A/B/C (§8).
- [ ] `MORNING-REPORT.md`: outcome in one plain sentence first; then what you built,
      the key decisions and why, what you verified, what you deferred, and 2–3
      questions/choices you want the owner to weigh in on. Drop working shorthand —
      write it to be read fresh.

---

## 12. Source material — developer-marketing referents & links

Gathered and verified 2026-07-05. Use these as the domain source list (adapt/expand)
and as grounding for the sample content.

### Core referents (developer marketing for DevTools)

- **Jakub "Kuba" Czakon — Markepear** 🇵🇱 (pure dev marketing; ex-CMO neptune.ai).
  https://www.markepear.dev/ · blog https://www.markepear.dev/blog/developer-marketing-agencies · examples https://www.markepear.dev/examples
- **Lee Robinson** — ex-Vercel VP Product, now VP Developer Experience @ Cursor.
  https://leerob.com/ · https://creatoreconomy.so/p/lee-the-ultimate-guide-to-developer-marketing
- **Adam Frankl** — author *The Developer Facing Startup*; ex-Neo4j/JFrog/Sourcegraph.
  https://developerfacingstartup.dev/
- **Martín "Gonto" Gontovnikas** 🇦🇷 — ex-Auth0 VP Marketing; co-founder Hypergrowth
  Partners; podcast *code to market*. https://www.linkedin.com/in/mgonto/en · https://codetomarket.fm/ · https://www.hypergrowthpartners.com/

### Additional referents / resources

- **Morgan Perry — DevTools Brew** (GTM/growth newsletter).
- **Ronak Ganatra — Developer Marketing Alliance** & repo `awesome-developer-marketing`: https://github.com/ronakganatra/awesome-developer-marketing
- **Karl Hughes — Draft.dev** (technical content marketing): https://draft.dev/
- **FletchPMM** (positioning/messaging for PLG/devtools).
- Specialists (via Markepear): Zach Goldie (messaging), Nick Moore (content), Flo Merian (launches), Emily Omier / Nevo David (OSS), Itamar Ben Yair (growth).
- **Tom Wentworth**, **Ashley Smith** (GitLab) — B2D/GTM classics.

### Podcasts / directories

- **Scaling DevTools** (Jack Bridger): https://scalingdevtools.com/ (episodes w/ Gonto; Lee Robinson analysis).
- **jackbridger/developer-newsletters**: https://github.com/jackbridger/developer-newsletters
- **reo.dev — developer marketing resources 2026**: https://www.reo.dev/blog/developer-marketing-resources-2026

### Verification cautions

- The claim that neptune.ai was "acquired by OpenAI" is **unverified** — do not
  repeat it as fact without a primary source.
- Roles change fast (Lee Robinson recently moved Vercel → Cursor). Re-verify current
  titles when you publish anything time-sensitive.

---

## Appendix — open questions to decide yourself (don't wait for answers)

- Project/repo name and site base-path/slug.
- Name of the signals collection ("signals" vs "radar" vs "news").
- Exactly how much of `the-wire` to adopt (memory/threads, predictions/Brier, scout/writer split, cost ledger).
- The canonical guide's section structure for developer marketing.
- Cron cadence and the threshold for "signal relevant enough → article."

Make the call, ship it, and record the reasoning in `ARCHITECTURE-DECISIONS.md`.
