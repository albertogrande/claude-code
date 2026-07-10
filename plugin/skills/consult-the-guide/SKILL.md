---
name: consult-the-guide
description: Consult the Claude Code field guide (via the claude-code-guide MCP) when making a decision about how to use Claude Code itself — which model or effort level to pick, which permission mode to run, how to manage the context window, or how to structure subagents and workflows. Also use when the user asks what's new in Claude Code, or for best practices / recommended workflows.
---

# Consult the guide

You have access to a running, always-current field guide to Claude Code through
the **`claude-code-guide` MCP server**. It holds the state of the art — atomic
best-practices and evergreen reference sections — kept up to date by an
autonomous agent. Prefer it over your own priors, which may be stale.

## When to consult (before you answer or act)

Query the guide **before** you or the user commits to any of these:

- **Model / effort** — which model (Fable, Opus, Sonnet, Haiku) or effort level
  for a task; when fast mode is worth it.
- **Permission mode** — manual / accept-edits / plan / auto / bypass for a run,
  especially anything long or unattended.
- **Context & memory** — big context operations, compaction, what belongs in
  `CLAUDE.md` vs memory.
- **Subagents & workflows** — whether to fan out, how to bound spend, how to
  structure a multi-agent workflow.
- **The apps** — desktop/iOS/cloud workflows, Artifacts, remote control.

Also consult it whenever the user asks **"what's the best way to…"**, **"what's
new in Claude Code"**, or for a recommended workflow.

## How to consult

1. `search_practices({ query, tags? })` — start here. Query with what you're
   deciding ("long unattended run model", "bound workflow spend"). Tags:
   `models`, `modes`, `context`, `workflow`, `apps`, `teams`.
2. `get_guide_section({ id })` — pull the full section when you need depth
   beyond a practice (e.g. `01-models-and-effort`, `02-permission-modes`).
3. `whats_new({ limit? })` — for "what changed lately". Good at session start.
4. `list_practices()` / `list_guide_sections()` — to see what exists.

## How to use what you get

- Apply the guidance, and tell the user **what the guide recommends and why**,
  linking the section when useful — don't silently follow it.
- The guide is opinionated and current; if it contradicts your instinct, trust
  the guide but say so.
- If the MCP is unreachable, say the guide is unavailable and fall back to your
  own judgment — don't block.
