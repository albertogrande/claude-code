---
title: 'Fable 5: the ceiling, not the default'
date: 2026-07-04
updated: 2026-07-05
summary: Claude Fable 5 is Anthropic's most capable model — and its most expensive. A researched guide to where it wins, when its premium is worth it over Opus 4.8, how to run it overnight, and how to prompt it — grounded in Anthropic's own docs and engineering posts.
dek: Anthropic's own advice is to start with Opus 4.8 and reserve Fable 5 for the work that needs the highest available capability. Here's how to tell which is which — and how to drive it when the answer is Fable.
tags: [models, workflow, cost, apps]
related:
  - label: Guide — models & effort
    href: /guide/01-models-and-effort
  - label: Guide — subagents, parallelism & workflows
    href: /guide/05-subagents-and-workflows
  - label: Guide — how engineering teams work
    href: /guide/08-how-teams-work
sources:
  - label: Anthropic — Introducing Claude Fable 5 & Mythos 5
    url: https://platform.claude.com/docs/en/about-claude/models/introducing-claude-fable-5-and-claude-mythos-5
  - label: Anthropic — Choosing a model
    url: https://platform.claude.com/docs/en/about-claude/models/choosing-a-model
  - label: Anthropic — Pricing
    url: https://platform.claude.com/docs/en/about-claude/pricing
  - label: Anthropic — Claude prompting best practices
    url: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
  - label: Anthropic — Effective harnesses for long-running agents
    url: https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
  - label: Anthropic — Effective context engineering for AI agents
    url: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
  - label: Anthropic — Claude Fable 5 (product)
    url: https://www.anthropic.com/claude/fable
  - label: Simon Willison — Claude Fable 5
    url: https://simonwillison.net/2026/Jun/9/claude-fable-5/
  - label: Latent Space — Anthropic Claude Fable 5 & Mythos
    url: https://www.latent.space/p/ainews-anthropic-claude-fable-5-mythos
---

`claude-fable-5` (GA June 9, 2026) sits at the top of the Claude 5 family — Anthropic's most capable *widely released* model, built for "the most demanding reasoning and long-horizon agentic work": large migrations, complex implementations, and multi-day autonomous sessions. (Mythos 5 is the same tier but invitation-only, via Project Glasswing.) It is also the most expensive model Anthropic ships — **$10 / $50 per million input / output tokens**, exactly twice Opus 4.8.

The single most useful thing to know comes straight from Anthropic's own model guidance:

> Start with Claude Opus 4.8 for complex agentic coding and enterprise work. For workloads that need the highest available capability, use Claude Fable 5.

So the vendor itself frames Fable 5 as the reserve, not the daily driver. And it adds a second lever most people skip: **tuning `effort` is often a better move than switching models at all.** Reach for Fable 5 when the task genuinely needs the ceiling — otherwise turn Opus 4.8 up before you turn the price up.

> **A note on sourcing.** Nearly everything below is grounded in Anthropic's own docs and engineering posts — the load-bearing "best at long-horizon coding / runs for days" claims are first-party positioning, not yet independently benchmarked, so read the capability superlatives as Anthropic's. The task-fit calls for *marketing copy* and *web design* are the exception: Anthropic's guidance is coding-centric, so those sections reason from cost and general model behaviour rather than Fable-5-specific evidence. Treat them as informed judgement, not doctrine.

Three design facts shape how you drive it:

- **Thinking is always on, adaptive-only.** There's no budget to tune and no off switch — you control depth with a single `effort` dial (`low` → `max`). The legacy `budget_tokens` control now returns a `400`; bound reasoning cost with `effort` (a soft signal) or `max_tokens` (a hard cap).
- **Turns are long by default.** A single hard request can run for many minutes — or, in a harness, for days — as it plans, builds, and checks its own work. Design around asynchrony.
- **There is no fast mode.** That's an Opus 4.8 / 4.7 feature. Fable 5 isn't built to be quick; it's built to be *right* on work worth waiting for. Which is exactly why its home is the overnight run, not the interactive chat.

## Where it fits, by task type

### Programming & agentic engineering — its sweet spot

Long-horizon coding is what Fable 5 was built and marketed for: large migrations, complex implementations, and multi-day autonomous sessions where a harness plans across stages, delegates to sub-agents, and verifies its own output. This is the one task type Anthropic explicitly names.

But the vendor's own ladder still says *start with Opus 4.8*. For everyday interactive coding, Opus 4.8 at high/`xhigh` effort is the workhorse at half the price; Sonnet 5 handles most coding for a fraction again. Reserve Fable 5 for the genuinely hard problem, the big migration, or the run you'll leave unattended — where one extra caliber of intelligence changes the outcome, not just the invoice. Before you switch models, try raising Opus 4.8's effort; that's the cheaper lever and often enough.

### Marketing copy & campaigns — usually overqualified

*(Reasoned from cost and general model behaviour — Anthropic gives no Fable-5-specific copy guidance.)* The Claude 5 family writes in a clearer, warmer, less-hedged voice than prior generations, and Fable 5 is the most capable of them. But copy rarely stresses the ceiling. A headline, an email, a set of ad variants — Opus 4.8 or Sonnet 5 will match Fable 5's output at a fraction of the cost, and you'd dial effort to `low`/`medium` anyway. Fable 5 only starts to earn its price on the strategic, multi-part, research-heavy work: a whole campaign reasoned from a brief and market context, or a long brand system that must stay coherent across dozens of assets. "Three subject lines" is overkill; "design the launch end-to-end and keep the voice consistent across every channel" is a fair fight.

### Web & frontend design — right for systems, wasted on a page

*(Same caveat: extrapolated, not officially sourced.)* For a single landing page or a component tweak, Fable 5 is more model than the job needs. It earns its price on complex, stateful applications and large component systems, where design decisions must stay coherent across many files. Whichever model you use, two techniques matter more than the model choice — frontier models settle into a persistent house style if you leave the aesthetic open: **ask for 3–4 distinct visual directions and pick one before it builds**, or **hand it a concrete spec** (exact palette, type, spacing). Vague steering ("make it clean") just swaps one default for another.

## The model picker

Fable 5 costs 2× Opus 4.8 and, at Sonnet 5's introductory rate, ~5× Sonnet — and there's a hidden multiplier: it shares the newer tokenizer with Opus 4.8 and Sonnet 5, which emits **~30% more tokens per word** than the previous generation. Against an older model your cost-per-word climbs faster than the sticker suggests; against Opus 4.8 and Sonnet 5 the multiples are apples-to-apples. Prompt caching claws some of it back (a 90% discount on cached input).

| Model | Input /1M | Output /1M | Context | Reach for it when… |
| --- | --- | --- | --- | --- |
| **Fable 5** | $10.00 | $50.00 | 1M | The task needs the *highest available* capability, or runs unattended for a long time. |
| **Opus 4.8** | $5.00 | $25.00 | 1M | Anthropic's recommended **start** for complex agentic coding & enterprise work. Has fast mode. |
| **Sonnet 5** | $3.00 * | $15.00 * | 1M | Near-Opus quality on most coding, at Sonnet cost. |
| **Haiku 4.5** | $1.00 | $5.00 | 200K | Fast, cheap, simple tasks — classification, quick edits. |

<small>* Sonnet 5's introductory $2 / $10 rate runs through 2026-08-31, then reverts to $3 / $15 — at which point Fable 5's premium over Sonnet shrinks from ~5× to ~3.3×. All four support 128K max output (Haiku caps at 64K).</small>

Because turns run long and effort always spends thinking tokens, a single overnight Fable 5 session can bill in the tens of dollars — fine when the deliverable is worth it, wasteful on routine work at high effort. Bound it with `max_tokens` and a lower `effort` on the steps that don't need the ceiling.

## The overnight run — its home turf

Every design choice points at the same use case: **hand it a hard, well-specified job and walk away.** Long turns aren't a latency problem when you're asleep; no fast mode doesn't matter when nobody's waiting; thinking-always-on is exactly what you want working unsupervised. Anthropic markets it for "multi-day autonomous sessions," and its engineering team has published the harness pattern that makes those runs actually finish rather than hallucinate "done." The shape (model-agnostic best practice, but it's what Fable 5 is built to sit inside):

- **Two-agent design.** An *initializer* sets up the environment — an `init.sh`, a `claude-progress.txt` log, an initial git commit, and a structured feature/test-results file. A *coding agent* then reads the progress files, runs the baseline tests, works on **one feature at a time**, and commits leaving a clean state. Anthropic calls the one-feature-at-a-time discipline "critical."
- **Un-editable gates against fake completion.** Seed a comprehensive feature list — 200+ granular items — all **marked failing**, and forbid the agent from removing or editing tests. It can't claim victory until real gates pass, not because it decided it was done.
- **Verify like a user.** Give it browser automation (a Puppeteer MCP server) so it tests the running app as a human would — this "dramatically improved performance," surfacing bugs invisible from the code alone.
- **Engineer the context.** Anthropic's first lever is **compaction** — summarize a near-full window and reinitialize from the summary — then a **file-based memory tool** (public beta) for structured notes that persist outside the window, and **sub-agent delegation**, where a coordinator keeps the high-level plan and sub-agents do deep work in clean context and return ~1,000–2,000-token summaries.

Then the Fable-5-specific guardrails before you close the lid:

1. **Opt into refusal fallbacks.** Fable 5 runs safety classifiers that can decline a request — returned as `stop_reason: "refusal"` on a **successful HTTP 200**, not an error (a pre-output refusal isn't billed at all; a mid-stream one bills the streamed partial). Without the server-side `fallbacks` parameter (fall back to `claude-opus-4-8`), a false positive just *stops* the run — at 2 a.m., that's your whole night.
2. **Scope so a stalled question is safe.** An unanswered `AskUserQuestion` no longer auto-continues by default. Good — no silent guesses — but an ambiguous overnight job can then sit idle till morning. Specify enough up front that it never has to ask.
3. **Give it context-awareness.** Tell it the context auto-compacts so it can work indefinitely, must **not** stop early over token-budget worries, and should save state to memory before the window refreshes.
4. **Bound the spend.** `max_tokens` as a hard cap, `low`/`medium` effort on routine steps. Fable 5 at low effort often beats a prior model at its ceiling, and you're paying by the token all night.

## How to prompt it — like a senior, not a junior

The biggest mistake migrating to Fable 5 is over-instructing it. Anthropic's own prompting guidance is blunt about it: **prefer general instructions over prescriptive steps** — *"a prompt like 'think thoroughly' often produces better reasoning than a hand-written step-by-step plan,"* because the model's reasoning frequently exceeds what a human would prescribe. Three principles follow:

- **State the goal and constraints, not the steps.** Start agent development with a *minimal* prompt on the best model, then add clear instructions only to fix the failure modes you actually observe. Smarter models want less scaffolding and more autonomy.
- **Dial back legacy aggression.** "CRITICAL: You MUST use this tool" language now makes these models *overtrigger* tools and sub-agents. Soften to "Use this tool when…".
- **Give the whole spec up front, and give the reason.** Long-horizon coherence comes from planning against a clear goal; a single well-specified opening beats the same facts dripped across five turns. And tell it *why*: "I'm building [X] for [whom]; they need [what the output enables]; with that in mind…".

Then a handful of ready-to-paste snippets for the ways Fable 5 over-does things at higher effort:

**Context-awareness** (long / overnight runs):

> Your context window will be automatically compacted as it fills, so you can continue working indefinitely. Do not stop early due to token-budget concerns. Before the context refreshes, save your current progress and state to your memory file so you can resume.

**Grounded progress** (unattended runs):

> Before reporting progress, audit each claim against a tool result from this session. Only report work you can point to evidence for; if something isn't verified, say so. If tests fail, say so with the output; if a step was skipped, say that.

**No tidying** (stops unrequested refactors):

> Don't add features, refactor, or introduce abstractions beyond what the task requires. A bug fix doesn't need surrounding cleanup. Don't add error handling for scenarios that can't happen. Do the simplest thing that works well.

**Autonomous mode** (headless pipelines):

> You are operating autonomously. The user isn't watching and can't answer mid-task, so asking "Want me to…?" blocks the work. For reversible actions that follow from the request, proceed without asking. Before ending a turn, check your last paragraph: if it's a plan, a question, or a promise about work you haven't done, do that work now with tool calls instead.

For unattended runs, one more: Fable 5 narrates in dense working shorthand, so its *final* summary — which may be the first thing you read in the morning — can be hard to follow. Fix it: *"When you write the final summary, drop the working shorthand. Lead with the outcome in one plain sentence, then the one or two things you need from me, each explained as if new."*

## Five gotchas that will bite you once

| | |
| --- | --- |
| **30-day retention is required** | Fable 5 isn't available under zero-data-retention. If your org is set below 30 days, *every* request returns a `400` — with a valid payload. Check the retention config before debugging the request. |
| **No thinking config, no prefill** | `thinking: {type:"disabled"}` or a `budget_tokens` value is a `400` — omit it and steer with `effort`. Last-assistant-turn prefills also `400`; use structured outputs. |
| **Refusals arrive as HTTP 200** | A classifier decline returns `stop_reason: "refusal"`, not an error. Check `stop_reason` *before* reading `content`, and ship the `fallbacks` parameter so a false positive doesn't fail the call. |
| **Raw chain of thought is never returned** | You get summarized `thinking` blocks (`display: "summarized"`) — never the verbatim reasoning. Don't build logic that parses raw thoughts. |
| **The tokenizer inflates cost-per-word** | Same tokenizer as Opus 4.8, so counts port over cleanly between them — but ~30% higher than pre-4.7 models. Re-baseline cost against a representative sample, not a blanket multiplier. |

**Bottom line:** Anthropic built Fable 5 for the ceiling and tells you to reach for Opus 4.8 first — believe them. Keep Fable 5 in reserve for the hard build, the long migration, the campaign reasoned end-to-end, the run you start before bed. Point it at your genuinely hard problems, give it a clear goal and room to think, wire it into a harness with real verification gates, and gate the result on a check you trust. For everything else, turn up `effort` before you turn up the price.
