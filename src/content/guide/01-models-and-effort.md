---
title: 'Models & effort: the control panel'
order: 1
summary: The four models, the low→max effort ladder, fast mode, and the two keywords worth memorizing — plus quick picks by task.
updated: 2026-07-04
---

Two dials govern intelligence-per-token: **which model** and **how much effort** it spends thinking. The single cheapest upgrade to your output is learning to move them per task instead of leaving them parked.

## The four models

| Model | Model ID | Sweet spot | Context |
| --- | --- | --- | --- |
| **Fable 5** | `claude-fable-5` | The hardest problems and multi-hour autonomous runs — investigates, acts, then verifies itself. Never the default. | 1M |
| **Opus 4.8** | `claude-opus-4-8` | Complex agentic coding: deep debugging, multi-file refactors, architecture. Your heavy-lifting model. | 1M |
| **Sonnet 5** | `claude-sonnet-5` | The daily driver. Best speed-to-intelligence balance; the right default for most feature work. | 1M |
| **Haiku 4.5** | `claude-haiku-4-5` | Fast and cheap, near-frontier. Mechanical edits, renames, high-volume or subagent grunt work. | 200k |

Switch anytime with `/model` (opens a picker) or `/model opus`. On Max-tier accounts Opus 4.8 is the default; on Pro/Team-standard it's Sonnet 5. There's also `/model opusplan` — Opus reasons through the plan, then hands execution to Sonnet.

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

Fast mode runs **Opus at a faster output speed** — it is *not* a downgrade to a smaller model. Same intelligence, meaningfully higher tokens-per-second, at a premium price. Available on Opus 4.8 / 4.7; toggle with `/fast`. Reach for it when Opus is producing a lot of output and you're waiting on the stream, not on the thinking.

## Quick picks by task

| Task | Model | Effort |
| --- | --- | --- |
| Typo, rename, one-line fix | Haiku 4.5 | `low` |
| Standard feature / everyday coding | Sonnet 5 | `high` |
| Deep debug, multi-file refactor | Opus 4.8 | `xhigh` |
| Architecture, long autonomous session | Fable 5 | `xhigh` |
| Bulk / CI / subagent labour | Haiku 4.5 | `low` |

Start from your account default, then profile the task and move the dials. Log the expensive models to high-value work; let Haiku carry the mechanical volume.
