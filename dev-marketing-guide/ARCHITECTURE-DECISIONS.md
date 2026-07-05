# Architecture decisions

What this system changes relative to its two reference architectures —
`albertogrande/claude-code` (the distilled field guide, "reference A") and
`albertogrande/the-wire` (the nine-beat newsroom, "reference B") — and why.
Written by the Fable 5 session that built it, 2026-07-05. Honest uncertainty
is flagged inline; deliberate deferrals are at the end.

---

## (A) Technical architecture improvements

### A1. Kept the stack: Astro 5 + SCSS + Pagefind + GitHub Pages

**Same as both references — deliberately.** The experiment's value is in the
editorial and schema layer, not in swapping frameworks. Astro's content
collections give the one property an autonomous writer needs most: zod
validation at build time, so a malformed agent write fails CI instead of
shipping (see A6). Changing stacks would have spent the novelty budget where
the reader gets nothing for it.

### A2. Guide sections now carry `sources` and a visible `changelog`

*Where: `src/content.config.ts` (guide schema), rendered in
`src/pages/guide/[...slug].astro`.*

Reference A's guide sections have only an `updated` date — the reader can
see *that* a section changed, never *what* or *why*. For a site whose core
promise is "the state of the art, kept current," that's an unaudited claim.
Every guide section here cites sources like a signal does, and carries a
`changelog: [{date, note}]` the skills are required to append to whenever a
signal or article forces a change. The feedback loop — the product's central
mechanic — is now *visible on the page*, not just asserted in the About.

Tradeoff: slightly heavier frontmatter for the agent to maintain. Accepted;
the schema makes it mechanical.

### A3. Signal promotion is data, not narrative

*Where: signals schema — `status: noted|promoted`, `promotedTo`,
`guideImpact`; articles schema — `fromSignal`.*

The mission's product vision says "when a signal is relevant enough, it is
worked up into an article." In reference A, no such relationship exists; in
reference B, it lives implicitly in prose and memory files. Here it's typed:
a promoted signal points at its article (`promotedTo`), the article points
back (`fromSignal`), and both render as visible cross-banners. `guideImpact`
does the same for the signal→guide edge. Result: the site's structure *is*
the editorial workflow, queryable and validatable — and future features
(e.g. "show unpromoted high-scoring signals") become trivial.

### A4. The editorial layer is a directory, not a folklore

*Where: `editorial/` — `STANDARDS.md`, `SOURCES.md`, `MEMORY.md`, `queue/`.*

Reference A hard-codes its source list and editorial rules inside the skill
prompt; reference B spreads state across `reports/MEMORY.md`, `TASTE.md`,
`_data/*.yml`, and per-desk skills. This project centralizes the desk's
shared state in one directory with one file per concern:

- `STANDARDS.md` — the house standard, referenced by every skill instead of
  restated in each. One edit retunes the whole system (skills stay stable;
  taste evolves in data).
- `SOURCES.md` — the sweep list as an editable registry, so adding a source
  is a content change, not a prompt change.
- `MEMORY.md` — coverage index + open threads + reader notes: reference B's
  best idea, kept, but as *one* bounded file (~200-line cap, prune rule)
  instead of a growing archive.
- `queue/` — the scout's daily catch (see A5).

### A5. Scout/writer separation via a shared artifact, not separate crons

*Where: `.claude/skills/daily-signal/SKILL.md` + `editorial/queue/`.*

Reference B separates scout and writer into different workflows on different
schedules — real decoupling, at the cost of two daily Claude runs and
coordination state. Reference A has no separation at all. This system takes a
middle path: **one daily run, three explicit roles (scout → writer → editor),
with the scout's full catch persisted to `editorial/queue/YYYY-MM-DD.md`
before the writer chooses.** The two benefits of separation that actually
matter — the writer choosing from a recorded slate rather than the first
shiny thing, and unchosen candidates surviving as leads for the weekly
article run — are preserved. The cost of a second scheduled run is not.
Uncertainty: if daily runs start truncating (sweep too big for one session),
promote the scout to its own cron; the queue format already supports that
split.

### A6. CI as the editorial system's type-checker

*Where: `.github/workflows/ci.yml`, zod schemas.*

Same CI shape as reference A (plain build, no Claude quota), but the schemas
are stricter on purpose: signals *require* `take` and ≥1 source; articles
require ≥2 sources. An autonomous writer that skips the take or publishes
sourceless doesn't produce a worse page — it produces a red build. Quality
floors are enforced by the machine so the prompts can spend their budget on
quality ceilings.

### A7. Cadence: daily signal, weekly *conditional* article, on-demand audit

*Where: `signal.yml` (04:30 UTC daily), `article.yml` (Thu 05:00 UTC),
`guide-audit` skill (workflow_dispatch / manual).*

Reference B publishes on a fixed calendar (daily dive Tue–Sun, weekly on
Monday), which forces output on days the field didn't earn it. Here only the
*evaluation* is scheduled; publication is conditional, and "nothing cleared
the bar" is documented as a successful run in both skills. The article slot
is Thursday so a week of queue entries exists by evaluation time. The guide
audit (reference B's validator idea, applied to prose) has no cron yet —
run it monthly by hand until its value is proven; a cron is one line later.

### A8. Self-containment for extraction

The mission stages this in a subdirectory but plans a dedicated repo. All
paths in skills and workflows are written repo-root-relative, the project
carries its own `package.json`/config/README/.github, and the workflows
document that they're inert until extraction. Extraction = `git mv` out +
revisit `site`/`base` in `astro.config.mjs`. Nothing else to rewire.

---

## (B) Prompt & reasoning improvements over `radar-scan`

### B1. Standards moved out of the prompt into a contract file

`radar-scan` mixes *how to work* (sweep these URLs, this frontmatter) with
*what good looks like* (be conservative, make the take actionable) in one
prompt. Here `editorial/STANDARDS.md` is the single quality contract — the
reader, the voice, structure rules, an explicit **anti-slop blacklist**, five
**verification gates**, and a definition of a good take — and every skill
binds to it by reference. Three effects: consistency across desks, one place
to raise the bar, and the editor role has a *checklist to be hostile with*
rather than a vibe.

### B2. Goals-and-standards phrasing instead of imperative step lists

Per the mission's prompting note: the skills state what each role is *for*
and what output must satisfy, and trust the model with the middle. Example:
`radar-scan` says "Publish exactly one post per day — the single most
relevant, most practical item"; `daily-signal` defines a scoring rubric
(5 = reader changes what they do … 1 = their feeds covered it to death),
requires the scored slate to be *persisted*, and then says: if nothing
scored 3+, publishing nothing is the correct output and costs nothing,
"a filler entry costs trust." The rule became a reasoned economy the model
can generalize from.

### B3. Roles with adversarial structure, not one pass with good intentions

`radar-scan` is a single-mindset run: research, then write, with
"be conservative" as advice. `daily-signal` forces three mindsets in
sequence and explains *why the separation exists* ("the writer chooses from
a recorded catch rather than the first shiny thing, and the editor judges a
finished draft rather than defending it"). The editor pass is explicitly
hostile — anti-slop list, every gate, "cut 10% of the words" — a concrete,
checkable act rather than an aspiration.

### B4. Verification upgraded from advice to gates

`radar-scan`: "If you cannot confirm a claim in a primary source, do not
publish it." STANDARDS.md turns this into five numbered gates with the
operative distinctions spelled out: *load-bearing* claims defined (the
argument changes if it's false), fetched-during-the-run required (no memory,
no search snippets), shipped/announced/rumored labeling, title re-verification
for people (with the Lee Robinson Vercel→Cursor example baked in as the
canonical warning), and dated numbers. Gates are pass/fail; advice is
negotiable under deadline pressure — for an unattended agent that difference
is the whole game.

### B5. Memory closes the loop between runs

`radar-scan`'s only anti-repetition device is "skim the recent entries."
Every desk here reads and *writes* `MEMORY.md`: coverage index
(anti-redundancy with a novelty component in the scoring rubric), open
threads (this run's leads become next week's article), and reader notes
(the owner's feedback accumulates instead of evaporating). The system
compounds; reference A's agent starts amnesiac every morning.

---

## (C) Expected impact on article quality

Where the reader should *see* the difference, using the seed article
(`articles/2026-07-05-ai-changed-the-audience-not-the-rules`) as the
exhibit:

1. **Title and dek are claims, not topics.** The old system's headline rule
   ("short, specific") produces "Min updates her playbook for AI." The
   promote-article rule — "a claim the reader should be able to disagree
   with" — produced *"AI changed your audience, not the rules"*, and a dek
   that states the argument in miniature. The reader can decide to read in
   one line, which is STANDARDS' first duty to him.

2. **Outcome-first discipline.** The first sentence delivers the finding
   ("changed two concrete things… not changed what persuades"); the nut graf
   (¶1–2) names the money at stake ("AI-native GTM is becoming a budget
   line"). No throat-clearing — the anti-slop list bans the openers the old
   advice merely discouraged.

3. **Synthesis, not summary — because promotion requires it.** Test 4 of the
   promotion bar ("we add something the sources don't contain") is why the
   piece reads three playbooks against each other (Robinson 2024, Min/Palmer
   2025, Cook 2023) and extracts a diff, instead of recapping the trigger
   signal. Its sharpest move — operationalizing Min's "taste is the moat"
   into "the accumulated record of checkable calls" — is the desk's own, and
   flagged as a view ("treat that claim with some care"), exactly the
   falsifiable-opinion posture STANDARDS demands.

4. **Specifics survive; filler doesn't.** Every load-bearing number is there
   and dated (1M developers/$100M, ~10% HN conversion, 10× personal accounts,
   Feb 2023, Oct 2025). Gate 3 caught the field's canonical title-rot trap:
   Robinson is cited for Vercel-era numbers and *placed at Cursor without a
   job title*, because his own site confirms the company but not the "VP of
   DX" title the mission brief carried. The old system had no rule that would
   have forced that check. Same gate-driven caution: the neptune.ai/OpenAI
   acquisition claim (which now even appears on Markepear's own site) stays
   out of the published copy because no primary announcement was found — it's
   flagged in SOURCES.md instead.

5. **Actionability is structural.** The signal's `take` is two audits the
   reader can run this week; the article ends in a "Monday audit" section.
   The old `take` guidance asked for this; the new standard *defines a take
   by it* and the editor pass strikes takes that are recaps.

The honest caveat: 1–3 are enforceable by structure (schemas, gates,
checklists); the margin between a competent article and a genuinely good one
still rides on the model doing the synthesis well on a given night. The
architecture raises the floor and makes the ceiling reachable; it doesn't
guarantee the ceiling.

---

## Deliberately deferred

- **Predictions + Brier scoring (reference B).** Real accountability value,
  but it optimizes for a *forecasting* reader; this reader wants practice
  guidance. Revisit if the site develops a "calls" habit in takes.
- **Cost ledger (reference B).** Useful ops hygiene, zero reader value;
  add when the crons are live and spending real quota.
- **Scout as a separate cron.** See A5 — the queue format already supports
  the split if daily runs prove too heavy.
- **ISO-week signal organization (reference B).** Flat `YYYY-MM-DD-slug.md`
  files sort chronologically for free; weekly grouping added a hierarchy the
  reader never asked for. The weekly *view* belongs in a page template if
  ever wanted, not in the filesystem.
- **Python validators (reference B).** zod-at-build covers schema integrity;
  cross-file invariants (e.g. `promotedTo` targets exist) are one small
  script away if broken links ever actually happen — the internal-link check
  run at build time already catches the rendered consequence.
- **Guide sections 03–07** (content engine, channels, DevRel org design,
  PLG activation, measurement). Planned TOC recorded here rather than
  shipped as stubs — the guide index only lists sections that actually
  exist. The weekly desk grows the guide as material accumulates.
