---
title: 'Models & effort: the control panel'
order: 1
summary: The four models, the low→max effort ladder, fast mode, and the two keywords worth memorizing — plus quick picks by task.
updated: 2026-07-25
---

Two dials govern intelligence-per-token: **which model** and **how much effort** it spends thinking. The single cheapest upgrade to your output is learning to move them per task instead of leaving them parked.

## The four models

| Model | Model ID | Sweet spot | Context |
| --- | --- | --- | --- |
| **Fable 5** | `claude-fable-5` | The hardest problems and multi-hour autonomous runs — investigates, acts, then verifies itself. Never the default. | 1M |
| **Opus 5** | `claude-opus-5` | Complex agentic coding: deep debugging, multi-file refactors, architecture. Your heavy-lifting model. | 1M |
| **Sonnet 5** | `claude-sonnet-5` | The daily driver. Best speed-to-intelligence balance; the right default for most feature work. | 1M |
| **Haiku 4.5** | `claude-haiku-4-5` | Fast and cheap, near-frontier. Mechanical edits, renames, high-volume or subagent grunt work. | 200k |

Opus 5 replaced Opus 4.8 as the default Opus model on July 24, 2026 (2.1.219) — same $5/$25-per-Mtok pricing as 4.8, but Anthropic's own benchmarks put it within 0.5% of Fable 5's coding results at half Fable 5's price, plus thinking on by default. Opus 4.8 (`claude-opus-4-8`) still works if you pin to it. Switch anytime with `/model` (opens a picker) or `/model opus`. On Max-tier accounts Opus is the default; on Pro/Team-standard it's Sonnet 5. There's also `/model opusplan` — Opus reasons through the plan, then hands execution to Sonnet.

## The effort ladder

Effort is a behavioural dial, not a hard token cap. Lower effort means fewer tool calls, less thinking, faster and cheaper. Higher effort means more exploration and deeper reasoning. **`high` is the default** on the current models.

| Level | What it's for |
| --- | --- |
| `low` | Speed and cost over polish. Renames, copy tweaks, mechanical edits, high-volume batch work. |
| `medium` | Trim cost while keeping quality reasonable. Routine generation and refactors. |
| `high` | **Default.** The right call for ~80% of real coding — thorough but efficient. |
| `xhigh` | Extended agentic work: long refactors, unfamiliar-codebase investigations, 30-minute-plus runs. |
| `max` | Frontier problems only — novel design, deep audits. Diminishing returns elsewhere. |

Set it with `/effort xhigh`.

## Two keywords worth memorizing

- **`ultrathink`** — drop it anywhere in a single prompt to buy deeper reasoning for that one turn, without changing your session effort.
- **`ultracode`** — opts a substantive task into multi-agent orchestration (see the workflows section). Also settable as a session effort via `/effort ultracode`.

## Fast mode — same brain, quicker hands

Fast mode runs **Opus at a faster output speed** — it is *not* a downgrade to a smaller model. Same intelligence, meaningfully higher tokens-per-second, at a premium price. Toggle with `/fast`. Reach for it when Opus is producing a lot of output and you're waiting on the stream, not on the thinking.

Fast mode now covers Opus 5 and Opus 4.8 — Opus 4.7 was dropped from fast mode entirely on July 24, 2026 (2.1.219), after its fast mode had been deprecated since June 25 and erroring on request since earlier that same day. The 4.7 model itself still works at standard speed; migrate to Opus 4.8 or Opus 5 to keep the speedup. Opus 5 fast mode is $10/$50 per Mtok, same rate as 4.8's, but is currently a research preview on the Claude API only — not yet on Bedrock, Vertex, or Foundry.

## Quick picks by task

| Task | Model | Effort |
| --- | --- | --- |
| Typo, rename, one-line fix | Haiku 4.5 | `low` |
| Standard feature / everyday coding | Sonnet 5 | `high` |
| Deep debug, multi-file refactor | Opus 5 | `xhigh` |
| Architecture, long autonomous session | Fable 5 | `xhigh` |
| Bulk / CI / subagent labour | Haiku 4.5 | `low` |

Start from your account default, then profile the task and move the dials. Log the expensive models to high-value work; let Haiku carry the mechanical volume.
