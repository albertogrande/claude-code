# Evals: is the guide MCP actually worth it?

*First run: 2026-07-10, against production (`claude-code-mcp.vercel.app`).
Re-run any time with `npm run eval` from `mcp/`.*

**Verdict: yes, with a narrow job description.** The MCP's measurable value is
concentrated in **versioned product facts that postdate the model's training**
(current model lineup, changed defaults, new settings). Its value is ~zero for
timeless engineering judgment, which every recent Claude already has. Consult
it at *decision points about Claude Code itself* — a handful of calls per
session at ~150–1,300 tokens and ~140 ms each — not during routine coding.

---

## Eval 1 — Marginal value: what does a bare model get wrong?

Method: 8 scenarios, one per practice in the corpus. For each, a fresh
subagent (Fable, **no tools, no guide access**) answered the underlying
decision question from its own knowledge. Its answer was graded against the
practice.

| Scenario (practice) | Bare model without the guide | Verdict | Marginal value |
|---|---|---|---|
| Model for a 45-min unattended run (`switch-to-fable…`) | "Top frontier / Opus 4.5; **I'm unsure of the July 2026 lineup**" — misses that Fable is the recommendation and why (Opus-class + faster output) | DIVERGE | **High** |
| Overnight job hits AskUserQuestion (`keep-askuserquestion…`) | Lands on "assume it stalls" but doesn't know the 2.1.200 default change or the `/config` idle-timeout; suggests workarounds (disallow the tool) the guide doesn't need | PARTIAL | **High** |
| Permission mode for unattended runs (`use-auto-mode…`) | Recommends `acceptEdits` + allowlists; **doesn't know auto mode / its classifier exists**; gets bypass-only-in-sandbox right | DIVERGE | **High** |
| Bounding an ultracode run (`cap-dynamic-workflow-size…`) | "**I don't know 'ultracode' or a 'Dynamic workflow size' setting** — check the docs" | UNKNOWN | **Highest** |
| Reopen-artifact shortcut (`use-artifacts…`) | Knows artifacts well; **can't confirm Ctrl+]** | PARTIAL | Medium |
| Two failed corrections (`clear-context…`) | Rewind/clear + crisp restatement — matches the practice | AGREE | Low |
| Boilerplate on an expensive model (`delegate-routine-coding…`) | Delegate mechanical work to cheaper subagents, keep decisions on the lead — matches | AGREE | Low |
| Review the feature just built (`split-the-writer…`) | `/code-review`, `/verify`, own diff pass — matches and exceeds | AGREE | Low |

**Score: 3 AGREE / 2 PARTIAL / 3 DIVERGE-or-UNKNOWN.** The split is clean:
everything timeless the bare model already knew; everything **versioned or
post-cutoff** it missed or hedged on. Two caveats: the probes ran on Fable
(the strongest model — Sonnet/Haiku sessions will diverge *more*, so this is a
lower bound on value), and 8 scenarios is a small n (grow it with the corpus).

**Editorial consequence for the guide itself:** new practices should
prioritize versioned product facts (changed defaults, new settings, current
lineup) over timeless advice — that's the only class where the MCP beats the
model's own priors.

## Eval 2 — Retrieval: does search find the right practice?

Method: 24 queries (16 in-domain in two phrasings, 3 Spanish, 5 off-topic)
with ground-truth practice ids — `eval/queries.json`, scored by
`eval/run-evals.mjs`. The 2026-07-10 run found one real defect and its fix is
now deployed; both runs shown:

| Category | v1 (before fix) | v2 (stopwords + score≥2 + top-5) | v3 (ES synonyms + stemming) |
|---|---|---|---|
| direct hit@1 / hit@3 | 88% / **100%** | 88% / **100%** | 88% / **100%** |
| paraphrase hit@1 / hit@3 | 75% / **100%** | 88% / **100%** | **100%** / **100%** |
| spanish hit@1 / hit@3 | 67% (substring luck) | 33% (luck removed) | 67% / **100%** |
| off-topic queries returning noise | **3/5, up to all 8 practices (~1,350 tok)** | 2/5, max **1** practice (~150 tok) | 2/5, max **1** practice |

The defect: stopwords ("a", "with") substring-matched everything, so
`center a div with css` returned the entire corpus as confident noise. Fixed
in `lib.js` (stopword list, min term length 3, min score 2, top 5). In-domain
recall was untouched by the fix. Spanish was never really supported — its v1
"hits" were accidents; real support is backlog item #1.

Regression gate: in-domain hit@3 ≥ 80% or `npm run eval` exits 1. Run it after
any change to the search or the corpus.

## Eval 3 — Cost & latency: what does a consult cost the session?

Production, 2026-07-10:

| Tool | Response size | Warm latency |
|---|---|---|
| `search_practices` | ~300–900 tok (post-fix; misses cost ~25) | ~140 ms |
| `whats_new` | ~190 tok | ~155 ms |
| `list_practices` | ~350 tok | ~135 ms |
| `get_guide_section` | ~500–2,000 tok (by section) | ~130 ms |
| Cold start (first call after idle) | — | ~2 s |

A typical consult (one search, maybe one section read) is **~1–3k tokens and
under a second** — roughly 0.5–2% of a working session's context. The
break-even is one avoided mistake: a single wrong model choice on a 45-minute
run, or one stalled-overnight-job surprise, costs orders of magnitude more
than a season of consults. Cost is not the constraint; *precision of when to
call* is — which is what Layer 3 (the skill) controls.

## The playbook — day-to-day use

**Does Claude call it by itself?** Only half. The MCP tools carry triggering
descriptions ("use before deciding a model or effort level…"), but mid-task a
session rarely stops to consult a library on its own. The
`consult-the-guide` skill (Layer 3) is the forcing function: installed in
`~/.claude/skills/`, its description fires when the session is about to make
a Claude-Code-usage decision. Without it, expect to have to say "check the
guide". With it, consultation is automatic at the right moments and absent
elsewhere. (A one-line rule in `~/.claude/CLAUDE.md` is the blunter
alternative.)

**Consult it when** (matches the measured high-value class):
- Picking model/effort for a long or unattended run
- Choosing a permission mode, especially unattended
- Sizing/bounding a multi-agent or ultracode request
- Session start after time away: `whats_new` (~190 tok) — cheapest habit,
  covers the fast-moving surface
- "What's the best way to X in Claude Code?"

**Don't consult it for** (measured zero-value class):
- Anything about *your code* — bugs, CSS, pandas, k8s. Post-fix the search
  returns near-nothing for these, but the call itself is the waste.
- Timeless judgment questions the model already answers well (how to review,
  when to clear context) — fine to consult, but expect confirmation, not news.

**Slower or faster overall?** +140 ms per consult, a few consults per
session. Against that: the probes show a bare session recommending
`acceptEdits` where auto mode is the current answer, or not knowing the
workflow-size setting exists. One avoided misconfiguration pays for months of
calls. Net: faster, by the boring mechanism of fewer wrong turns.

## Improvement backlog (from these evals)

1. ~~**Bilingual/robust matching**~~ — DONE 2026-07-10: ES→EN synonym bridge
   + Spanish stopwords in `lib.js`; Spanish hit@3 33% → 100%. Embeddings still
   deliberately skipped (overkill at 8 practices, revisit at ~30+).
2. **Grow the corpus where the value is** — versioned product facts first
   (defaults that changed, new settings, current lineup). The probes are the
   gap-finder: anything a bare model already knows is low-priority to write.
   Now encoded in `editorial/TASTE.md` so the scout/weekly desks apply it.
3. ~~**Wire the eval into CI**~~ — DONE 2026-07-10: `mcp` job in
   `.github/workflows/ci.yml` runs `npm test` + `eval/ci.mjs` (hermetic:
   local dist as corpus) on every PR and push to main.
4. ~~**Rerun the marginal-value probes quarterly**~~ — DONE 2026-07-10:
   protocol + question bank in `eval/marginal-probes.md`, scheduled by
   `.github/workflows/probes.yml` (1st of Jan/Apr/Jul/Oct, manual via
   workflow_dispatch). As models absorb 2026 facts, practices decay from
   DIVERGE to AGREE; the run flags them for retirement or refresh.
5. ~~**Stemming**~~ — DONE 2026-07-10: light suffix trim in `variantsOf()`;
   paraphrase hit@1 88% → 100%.

## Re-running

```bash
cd mcp
npm run eval                      # against production
MCP_URL=http://127.0.0.1:8787/mcp npm run eval   # against a local server
```

The marginal-value probes (Eval 1) are prompts, not code: re-ask the 8
questions of a fresh, tool-less session and grade against the practices.
