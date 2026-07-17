# Editorial Memory

Agent-maintained. Read before running any desk (scout, weekly, deep-dive);
update after. Keep under ~150 lines — retire dead threads by deleting them
(git history preserves everything).

This is the brain that keeps the **guide** current and decides when a thread
has earned a **deep dive**. It is internal (not rendered).

## Standing editorial findings

- **2026-07-10, practice-value evals** (`mcp/EVALS.md`): the guide's measured
  edge over a bare model is versioned product facts only — write practices for
  those first (see TASTE.md). Probes rerun quarterly (Probes workflow);
  practices that decay to "model already knows this" get retired or refreshed.

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
  hooks streaming in headless runs (was idle-reaping remote workers). 07-10:
  2.1.206 makes background agents upgrade themselves right after you update
  Claude Code (was: slow stale-version upgrade on attach) and adds an
  `EnterWorktree` confirmation before entering a worktree outside
  `.claude/worktrees/` — one more guardrail on unattended fan-out. 07-11:
  2.1.207 turns auto mode default-on for Bedrock/Vertex/Foundry (was opt-in
  via env var) and moves the `autoMode` toggle out of repo-resident
  `.claude/settings.local.json` into user-only `~/.claude/settings.json` — a
  repo can no longer switch auto mode on for you; same release closes a gap
  where non-interactive runs (`claude -p`, SDK) recorded remote managed
  settings as consented without showing the security dialog. 07-12: same
  2.1.207 release also fixes an agent-teams mailbox crash loop, Remote
  Control losing task-status updates on reconnect and not showing
  desktop-hosted progress on mobile/web, and stops plugin option values
  (`pluginConfigs`) from being read out of repo-committed
  `.claude/settings.json` — same pattern as `autoMode`'s move to
  `~/.claude/settings.json`: trust-sensitive config pulled out of files a repo
  can silently ship. 07-14: 2.1.208 fixes background-session attach failing
  permanently after updates and lost replies to background agents (delivery
  failures now save-and-resend on restart); 2.1.209 same-day follow-up
  reverts an overly broad guard that had blocked `/model` and other dialogs
  inside `claude agents` background sessions. Direction: safer defaults, cost
  dials, trustworthy background subagents. Guide: covered across §05
  (subagents), §06 (apps), §08 (teams). 07-15: 2.1.210 closes two more trust
  gaps in unattended/fan-out work — `isolation: 'worktree'` subagents could
  run git-mutating commands against the *main* checkout instead of their own
  worktree, and the `ultracode` workflow opt-in could fire from
  non-human-originated input (webhook payloads, relayed PR comments), not
  just a person typing it; same release hardens the Agent tool against
  indirect prompt injection from subagent-read content. Same day: `claude
  attach` "job not found"/stuck-starting errors fixed, and killed background
  sessions no longer leave permanent `git worktree lock`s. 07-16: 2.1.211
  closes the week's trust gaps further — a PreToolUse hook's `ask` decision
  can no longer be silently overridden by the auto-mode classifier for
  unsandboxed Bash; background agent status checks now wait for real
  completion instead of fabricating a result; "always allow" permission
  rules save at the repo root so a worktree-granted approval persists across
  sibling worktrees; and permission previews relayed to chat channels are
  hardened against bidi-override/zero-width/look-alike-quote spoofing of the
  approval text. 07-17: 2.1.212 is the week's biggest single release on this
  thread — `/fork` redesigned to copy a conversation into a new background
  session (`claude agents` row) while the old in-session-subagent behavior
  moves to `/subtask`; new session-wide hard caps (200 subagent spawns, 200
  WebSearch calls, both `/clear`-resettable, both env-configurable) sit
  alongside the existing 16-concurrent/1,000-per-run caps — guide §05 patched,
  it had called the old caps "the only real backstop"; MCP tool calls over 2
  minutes now auto-background; Task tool's `mode` parameter is deprecated,
  subagents just inherit the parent session's permissions; worktree creation
  no longer follows a repo-committed symlink at `.claude/worktrees` (same
  isolation-escape class as 07-15's fix); and plan mode no longer auto-runs
  file-modifying Bash without a prompt, closing a gap practitioners have
  documented since early on (GH #6716).
  → [2026-W28](../src/content/weekly/2026-W28.md)
- **China's 'backdoor' warning on Claude Code** `→` — 07-09: China issues a
  nation-state security alert. 07-10: China's National Vulnerability Database
  names it a "built-in monitoring mechanism" and flags versions 2.1.91–2.1.196
  specifically; Anthropic responds that Chinese users "were not supposed to be
  using it in the first place" and reiterates the tracking code is an
  anti-distillation measure, not a backdoor. Ecosystem/policy story, not a
  product change — watching for whether it affects anything shipped. Guide:
  not covered (out of scope for a practitioner field guide unless it starts
  changing product behavior).
- **Cost control as a first-class habit** `↑` — the token meter is now a
  design constraint the reader manages, not an afterthought. W28: delegate
  routine coding to lower-power subagents (Willison); advisory workflow-size
  cap. 07-12: signal (unconfirmed at the time) that the May-13 50%-weekly-limit
  boost reverts July 13. 07-13: resolved — it didn't revert. Anthropic's
  official support article confirms a third extension, through **July 19,
  2026, 11:59:59 PM PT**, covering the 50% weekly-limit boost and Fable 5's
  plan-included access together (Pro/Max/Team/seat-based Enterprise, all
  platforms; 5-hour limits unaffected). After the window closes, Fable 5 usage
  runs on prepaid credits at $10/$50 per Mtok (2× Opus 4.8) with no grace
  period or auto-fallback if credits aren't funded first. Guide: §01 (models &
  effort), §05. Deep-dive candidate if a real (enforced) spend ceiling ships,
  or if the rolling-extension pattern itself becomes the story (three
  extensions in five weeks now). 07-16: 2.1.211 fixes a silent prompt-caching
  regression on Bedrock/Vertex/Mantle/Foundry billing the trailing
  system-context block as fresh input tokens every request — same shape as
  the 2.1.181 fix for custom `ANTHROPIC_BASE_URL`/Foundry setups; same
  release also makes `/clear` reset the statusline's cost counter (was
  silently carrying over spend from before the clear).

- **Harness-side context overhead** `→` — distinct from CLAUDE.md bloat (which
  the reader controls): the fixed token cost Claude Code's own system prompt
  and tool schemas add before a prompt is even read. 07-09: aihero.dev piece
  on trimming system-prompt overhead. 07-13: a 571-point HN thread
  (systima.ai) measures it directly — ~33k tokens of overhead on a fresh,
  MCP-free Claude Code session (~6.5k system prompt + ~24k across 27 tool
  schemas) vs OpenCode's ~7k (~2k + ~4.8k across 10 tools). 07-14: 2.1.208
  caches MCP tool-pool assembly for up to 7x faster tool rounds at high tool
  counts — relief on the *CPU/latency* side of many-MCP-tool sessions, but
  doesn't touch the ~24k-token schema cost itself; the token-overhead gap vs
  OpenCode stands. 07-17: 2.1.212 cuts inter-agent token usage by removing
  `SendMessage` body duplication — another partial, adjacent relief (fan-out
  messaging overhead, not the fixed per-session schema cost). Guide §03
  covers CLAUDE.md bloat but not this harness-fixed cost — thin coverage,
  recurring topic. Deep-dive candidate.

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
- **Harness-side context overhead** — see the running thread above. Fixed
  system-prompt/tool-schema token cost, distinct from CLAUDE.md bloat; guide
  §03 doesn't cover it at all yet. Watching for a third data point before
  promoting further.

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
