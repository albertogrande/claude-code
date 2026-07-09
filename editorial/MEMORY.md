# Editorial Memory

Agent-maintained. Read before running any desk (scout, weekly, deep-dive);
update after. Keep under ~150 lines — retire dead threads by deleting them
(git history preserves everything).

This is the brain that keeps the **guide** current and decides when a thread
has earned a **deep dive**. It is internal (not rendered).

## Running threads

Each thread carries a momentum tag (`↑` gaining / `→` steady / `↓` stalling)
and, when evidence cuts against it, a `Tension:` note inline. A thread that
keeps recurring in signals and isn't well covered by the guide is a
**deep-dive candidate** (flag it below).

- **The supervised background run** `↑` — Claude Code is maturing the
  walk-away job into a first-class workflow. W28: `AskUserQuestion` stops
  auto-guessing (2.1.200); dynamic workflow-size dial (2.1.202); switching
  away from a running agent no longer nukes its work + macOS switch stall
  fixed (2.1.203). 07-09: 2.1.205 hardens auto mode (blocks transcript-file
  tampering, asks before `rm -rf` on an unresolved var, notifications state no
  human input occurred — no fabricated approvals); 2.1.204 fixes SessionStart
  hooks streaming in headless runs (was idle-reaping remote workers). Direction:
  safer defaults, cost dials, trustworthy background subagents. Guide: covered
  across §05 (subagents), §06 (apps), §08 (teams).
  → [2026-W28](../src/content/weekly/2026-W28.md)
- **Cost control as a first-class habit** `↑` — the token meter is now a
  design constraint the reader manages, not an afterthought. W28: delegate
  routine coding to lower-power subagents (Willison); advisory workflow-size
  cap. Guide: §01 (models & effort), §05. Deep-dive candidate if a real
  (enforced) spend ceiling ships.

## Deep-dive candidates

Promote here when a thread is recurring in signals AND the guide only covers
it thinly. The weekly desk commissions from this list.

- **A real workflow spend ceiling** — the 2.1.202 size knob is advisory; if
  Anthropic ships an enforced cap (or a budget primitive), that's the dive:
  how to actually bound autonomous spend. Not yet — watching.
- **What auto mode actually does on an unattended run** `↑` — recurring across
  W28: AskUserQuestion no-guess (2.1.200), transcript-tamper block + `rm -rf`
  guard + no-fabricated-approval notifications (2.1.205). The guide covers it in
  one paragraph (§02 "Auto mode, briefly"); a dive on the real safety model of a
  walk-away run — what's screened, what still gets through, how to scope
  "trusted" — is close to ripe. Candidate for the next weekly.

## Guide coverage index

The nine evergreen sections and what each owns. Keep the scout/weekly honest
about *where* a fact belongs.

- `00-start-here` — orientation, what the guide is, how it updates
- `01-models-and-effort` — model IDs (Fable 5, Opus 4.8, Sonnet 5, Haiku 4.5), effort, fast mode
- `02-permission-modes` — the permission dial, plan mode, allow/deny
- `03-context-and-memory` — context window, CLAUDE.md, memory, compaction
- `04-skills-plugins-mcp-hooks` — the extensibility surface
- `05-subagents-and-workflows` — subagents, parallelism, dynamic workflows, spend
- `06-mac-and-ios` — the apps: desktop, iOS, remote control, background sessions, Artifacts
- `07-workflows-that-compound` — the durable habits
- `08-how-teams-work` — team/org state of the art

## Coverage index (published)

Weeklies and dives, newest first. Append one line each time.

- 2026-W28 · *The week Claude Code learned to be left alone* · unattended runs, cost dials (2.1.200–2.1.203), Artifacts to Pro/Max
- 2026-07-04 · dive · *Fable 5 — the ceiling, not the default* · models & effort
