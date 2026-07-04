---
title: 'Context & memory: your real budget'
order: 3
summary: The finite context window, the commands that keep it healthy, and the difference between the CLAUDE.md you write and the memory Claude writes.
updated: 2026-07-04
---

Every file read, tool output, and message shares one context window. Performance degrades as it fills. Managing it is the single most underrated power-user skill.

## Keep the window healthy

| Command | What it does |
| --- | --- |
| `/context` | Visualize what's eating the window as a grid, with optimization hints. |
| `/compact` | Summarize the conversation to reclaim space mid-session. Add focus: `/compact focus on the API changes`. |
| `/clear` | Start fresh, keeping project memory. The move after two failed corrections. |
| subagents | Delegate exploration to a subagent with its own window; its digging never bloats your thread. |

**Golden rule:** if you've corrected Claude on the same thing more than twice, `/clear` and rewrite the opening prompt with what you just learned. The context is polluted with failed attempts, and a clean prompt beats a muddied session.

## CLAUDE.md — read at every session start

This is where persistent, project-specific truth lives: build commands Claude can't guess, style rules that differ from defaults, test runners, architecture decisions, gotchas. It survives compaction. The hierarchy, most-specific-wins:

| Scope | Location | Purpose |
| --- | --- | --- |
| Managed | org policy | Organization-wide rules from IT. |
| User | `~/.claude/CLAUDE.md` | Your preferences across every project. |
| Project | `./CLAUDE.md` | Team-shared, checked into the repo. |
| Local | `./CLAUDE.local.md` | Your private project notes (gitignore it). |

**Keep it ruthlessly short** — aim under ~200 lines. For each line ask: "would removing this cause a mistake?" If not, cut it. A bloated CLAUDE.md gets ignored because the real rules drown. Run `/init` to generate a starter from your codebase, and split big projects into path-scoped `.claude/rules/` files that only load when Claude touches matching files.

## CLAUDE.md vs. auto-memory

**You write CLAUDE.md** — instructions and rules. **Claude writes auto-memory** — things it learns as you work (build quirks, debugging insights, your habits), saved per-repo and reloaded each session. Say "remember that the API tests need a local Redis" and it files it away. Tidy it periodically with the `consolidate-memory` skill.

The two compound: the more you invest in project context, the more consistent the output — far more than any amount of prompt-wording ever buys you.
