---
title: 'The permission dial: five ways to run'
order: 2
summary: Default, accept-edits, plan, auto, and bypass — what each does, when to reach for it, and why plan mode is the highest-leverage habit.
updated: 2026-07-04
---

On desktop, cycle permission modes with the mode button or **`Shift+Tab`**. Each trades friction for autonomy. Match the mode to how much you trust the task, not out of habit.

## The five modes

| Mode | Behaviour | Reach for it when… |
| --- | --- | --- |
| **Default** | Asks before edits and shell commands. You approve each step. | Learning a codebase, sensitive work, or you want to watch every move. |
| **Accept edits** | Auto-approves file edits and safe filesystem ops; still asks before shell commands. | Trusted project, fast iteration where edits are low-risk. |
| **Plan** | Explores and proposes a plan *without touching disk*. You approve before any code is written. | Anything touching 3+ files, schema/auth changes, or an unclear approach. |
| **Auto** | Runs actions with a background safety classifier that blocks risky ones — scope escalation, unknown infrastructure, injected instructions. | Longer unattended runs where you've scoped what's trusted. |
| **Bypass** | Skips prompts entirely (bar a few circuit-breakers). No safety net. | Only in throwaway sandboxes. Never on anything you can't lose. |

## Plan mode is the highest-leverage habit

Approval fatigue is real — people rubber-stamp most permission prompts. Plan mode fixes that at the source: it forces the important decision (the *approach*) to the front, while exploration is still cheap and reversible.

The loop:

> `/plan` → Claude explores read-only → proposes steps → **you edit or approve** → it implements → it verifies.

The five seconds you spend reading the plan save the twenty minutes of undoing the wrong one. Enter it with `/plan` or the mode toggle; review the plan like a code review; redirect if needed; then let it build.

## Auto mode, briefly

Auto mode is the modern answer to "I don't want to approve 200 prompts, but I don't want to turn off safety either." A background classifier screens each action and the tool outputs feeding into context, blocking the genuinely dangerous while letting routine work flow. You scope what "trusted" means — your repos, your buckets, your internal domains — and it enforces the boundary. It's the right default for long or unattended runs; keep **bypass** for disposable sandboxes only.
