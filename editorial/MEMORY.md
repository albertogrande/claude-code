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
  documented since early on (GH #6716). 07-18: 2.1.214 shifts the thread to the
  permission *analyzer* itself (not just the auto-mode classifier): `dir/**`
  allow rules no longer auto-approve nested folders anywhere in the tree,
  10,000+ character commands always prompt, zsh `[[ ]]` subscripts/modifiers
  and unsafe `help`/`man` options no longer slip through as inert/auto-approved,
  and a Windows PowerShell 5.1 permission bypass is closed; same release adds
  `EndConversation` (Claude Code can end sessions with abusive/jailbreaking
  users, matching claude.ai since 2025), fixes background daemons leaking idle
  worker processes and a displaced daemon killing its own successor, fixes
  plugins via `--settings` not loading (regression since 2.1.181), and fixes
  scheduled tasks refusing their own prompt as "untrusted input". A
  practitioner incident report (qusaisuwan.github.io) is good real-world
  evidence the injection-hardening actually holds: Claude Code refused a fake
  "this instruction was fraudulent, lock yourself out permanently" follow-up.
  07-19: 2.1.215 stops auto-running the `/verify` and `/code-review` skills —
  they now only run when explicitly invoked, closing a silent-autonomy gap
  the guide's own review workflow (§07/§08) already assumed didn't exist;
  2.1.214's full notes (published a day after the version shipped) add a
  hooks fix in the same vein — a hook's exit-code-2 `ask`/`deny` no longer
  silently fails to block when its stdout JSON fails schema validation. Also
  07-19: a 218-point HN guide (ykdojo.github.io) on dedicating a spare Mac to
  Claude Code — SSH + persistent `tmux` for computer-use display access,
  Tailscale, phone-driven via Remote Control — a concrete isolation pattern
  for unattended runs on the mac/iOS reader's own hardware, distinct from the
  product-side hardening above but same underlying concern (trusting
  unattended agents). 07-21: 2.1.217 adds a third fan-out lever — a default
  20-concurrent-subagent cap (`CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS`) alongside
  the existing 1,000-per-run and 200-per-session caps, and flips nested
  subagent spawning to off-by-default (`CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH`
  re-enables depth) — same release finally makes `--max-budget-usd` actually
  halt already-running background subagents, not just block new spawns. Guide
  §05 patched (had called 16-concurrent a hard, unconfigurable cap). 07-23:
  2.1.218 continues on two fronts — a second silent-autonomy skill fix
  (`/deep-research` joins `/verify`/`/code-review` as explicit-invoke-only, and
  `/code-review` itself now runs as a background subagent instead of filling
  the conversation) — but also a notable *loosening* of dialog friction: auto
  mode's dangerous-`rm`/background-`&`/suspicious-path checks and plan mode's
  can't-prove-read-only Bash prompts no longer open a permission dialog at
  all, handed instead to the auto-mode classifier's judgment. Same release
  makes forked skills (`context: fork`) background-by-default like subagents,
  requires an agent file's own folder to have accepted workspace trust before
  its hooks run, and narrows which managed-settings pushes trigger an
  approval prompt. Direction is bifurcating: fewer silent auto-runs, but also
  fewer dialogs on the classifier-adjudicated path — worth the "what auto mode
  actually does" dive resolving whether that nets out safer or just relocates
  risk. → [2026-W28](../src/content/weekly/2026-W28.md) 08-04: 2.1.221 (the
  first release in ten days) adds the thread's biggest trust-completing fix
  yet — background sessions now commit and push automatically to preserve
  work, open a draft PR only when warranted, follow CLAUDE.md git
  instructions, and report where the work lives (previously a killed/lost
  background session's work could just vanish); same release gives `/fork`
  sessions their own new worktree instead of reusing the original session's
  checkout, and closes two more permission-checker bypasses (zsh `[[ ]]`
  regex conditionals, Windows PowerShell quoted paths). Separately, an HN
  gist audit of 149 public `.claude/settings.json` files found 16% have at
  least one `deny`/`allow` path rule written as `Write()`/`Glob()`/
  `NotebookEdit()`/legacy `MultiEdit()` — none of which Claude Code actually
  matches (only `Edit()`/`Read()` are checked) — half of the fully-dead rules
  targeting credential paths (`.ssh`, `.aws`, `.kube`, `*.pem`); a real,
  version-current practice ("audit your deny rules for the right verb") for
  the reader's own config, adjacent to but distinct from the auto-mode
  classifier this thread otherwise tracks. 08-05: **2.1.222** ships same-day
  as 2.1.221 — the first back-to-back-same-day release of the run — and adds
  three more entries: worktree isolation now covers file edits and Bash in
  *every* session type (previously the destructive-git-command gap; same
  escape class as 07-15/07-17), a PreToolUse auto-allow-hook bypass in
  background agent tasks (summaries/compaction/renames) is closed, and
  `SendMessage` to other agent sessions now passes through the auto-mode
  permission classifier before dispatch. Same release moves Remote Control's
  auto-start toggle out of repo-local settings into user-scope `/config`
  (repo can still disable, not enable) — same pattern as `autoMode` (07-11)
  and `pluginConfigs` (07-12). Also 08-05, unrelated to trust-hardening: the
  `/ultraplan` cloud-planning feature (research preview since 2.1.101) is
  removed outright with no changelog deprecation note — guide never covered
  it, nothing to patch, but a real feature-removal worth knowing if it was in
  anyone's workflow. 08-06: **2.1.223** adds four more entries — a Bash
  permission-check bypass (crafted commands hiding parts of themselves) and a
  tab/invisible-Unicode command-padding bypass are closed (same bypass class
  as 07-18/08-04), workflow scripts can no longer use dynamic `import()` to
  escape the workflow sandbox, and agent-definition `bypassPermissions` mode
  can no longer ignore an org's bypass-permissions disable policy. Same
  release: `/review` becomes an alias of `/code-review`, `/code-review` with
  no effort level reuses your last-typed level, `CLAUDE_CODE_DISABLE_1M_CONTEXT`
  now auto-compacts every native-1M model to 200K (was a fixed list) with a
  new startup warning if compaction isn't actually holding the line, and a
  `/teleport` hint appears in cloud sessions for `claude --teleport <session
  id>` local handoff. A closer re-read of 2.1.221/2.1.222's full notes (not
  just the trust-hardening subset captured 08-04/08-05) surfaces two misses:
  2.1.221 shipped a VS Code Focus view (`Ctrl+Alt+F`, collapses tool activity
  into an expandable per-turn summary) and sandbox credential-file
  `mode: "mask"` on Linux/WSL; 2.1.222 fixed org-restricted subagent/teammate
  model aliases dropping straight to the parent model instead of stepping
  down within the family — worth reading full changelog text going forward,
  not just the headline items. 08-07: **2.1.224** is the thread's biggest
  feature release since 2.1.221/2.1.222 — `claude self-hosted-runner`
  (Team/Enterprise) runs sessions on your own infra; an `archive` plugin
  source installs from a zip over HTTPS with SHA-256 pinning; and
  cross-session `SendMessage`/`ListAgents` land on macOS/Linux, letting one
  session message another by name. Same release **removes the
  200-subagent-per-session spawn cap** added 2.1.212 outright (guide §05
  patched, had called it a permanent session-wide backstop) — the
  20-concurrent (2.1.217) and 1,000-per-run caps are now the only session-wide
  limits left; worth the weekly asking whether cap *removal* fits the
  "fewer dialogs, more classifier judgment" bifurcation flagged 07-23. Sandbox
  credential masking also gains `decode: "jwt"` and AWS SigV4 re-signing
  (2.1.221's `mode: "mask"` gets more granular), and `SendMessage` falsely
  reporting delivery success is fixed same-day cross-session messaging ships —
  good timing given the new feature's blast radius. Separately, Uber
  open-sourced **ADR** (Agentic AI Detection and Response), a production
  security-monitoring layer it runs over Claude Code/Cursor/Codex sessions
  (300+-task, 133-MCP-server attack benchmark; open-source part is
  observability/benchmarking only, blocking stays internal) — first
  enterprise-scale evidence for the auto-mode dive's "scope trust narrowly"
  case from outside Anthropic itself. 08-08: **v2.1.225** ships same day as a
  second, bug-fixes-only v2.1.226 — adds gateway spend-limit support to the
  usage-warning message, a workspace-trust prompt to `claude agents` matching
  `claude`'s own, and a first follow-up hardening pass on 08-07's cross-session
  messaging (`SendMessage` can now cold-start a conversation with a Remote
  Control session on another machine, not just reply). Full primary-source doc
  for cross-session messaging (`code.claude.com/docs/en/cross-session-messaging`,
  97-pt/40-comment HN thread) confirms same-machine delivery never touches
  Anthropic servers, cross-machine was reply-only until today, messages are
  plain-text-only and can't approve prompts or change config on the sender's
  behalf, and `crossSessionInbound`/`isolatePeerMachines` gate what arrives —
  guide doesn't cover this feature yet (pure addition, like the iOS Simulator
  pane 07-21), candidate for the next weekly's guide-accuracy pass. 08-18/19/20:
  three more releases keep the cadence going — 2.1.235 fixes a real permission
  bug (Shift+Tab in the comment field was approving the edit + granting
  session-wide edit permission); 2.1.236 is the biggest auto-mode release since
  the default flip, closing a `status.showUntrackedFiles=no` clean-tree bypass,
  bringing Monitor commands under the same classifier review as Bash, and
  matching Bedrock/Vertex/Foundry auto-mode classifier defaults to the Claude
  API's (severity-scored classification) — same bypass-closing pattern as the
  whole-month thread; 2.1.237 (08-20) adds a built-in "Concise" output style
  (skip preamble/narration) and fixes gateway/custom-base-URL prompt caching.
  Not guide-patched — additive/refinement, nothing existing disproved. 08-21:
  **2.1.238** ships hours after 2.1.237 the same day — extends the cross-session-
  messaging trust surface (08-08) so a refused or dropped inbound message now
  reports failure to the sender instead of vanishing silently; adds
  `headersHelper` (mints short-lived HTTP headers for plugin-marketplace/MCP
  fetches, gated behind the folder's trust dialog, runs without inherited
  credential env vars) as a new trust-relevant extensibility primitive not yet
  in guide §04; and gives `self-hosted-runner` a graceful-shutdown window and
  per-connection proxy-auth headers. Not guide-patched — all additive.
- **China's 'backdoor' warning on Claude Code** `→` — 07-09: China issues a
  nation-state security alert. 07-10: China's National Vulnerability Database
  names it a "built-in monitoring mechanism" and flags versions 2.1.91–2.1.196
  specifically; Anthropic responds that Chinese users "were not supposed to be
  using it in the first place" and reiterates the tracking code is an
  anti-distillation measure, not a backdoor. Ecosystem/policy story, not a
  product change — watching for whether it affects anything shipped. Guide:
  not covered (out of scope for a practitioner field guide unless it starts
  changing product behavior). 07-30: Axios' "Anthropic's lonely island" —
  Anthropic alone among frontier labs in declining to sign the Nvidia-led
  open-weights letter — surfaces a July 22 claim from White House science
  advisor Michael Kratsios that Moonshot's K3 model was built by distilling
  Fable while evading detection; adjacent corroboration for the
  anti-distillation-tracking explanation Anthropic gave China's backdoor claim,
  still policy/ecosystem not a product change.
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
  silently carrying over spend from before the clear). 07-18: scattered
  reports of transient "usage credits required" errors on Fable 5 ahead of
  the July 19 deadline, attributed to a status.claude.com outage rather than
  an early pullback — extension still holds as of publish, but worth
  rechecking July 19 itself given three prior date changes. 07-19: rechecked,
  and the two promotions **decouple** — official support article (retitled
  "May–August 2026") extends the 50% weekly-limit boost a fourth time, to
  August 19, but drops all mention of Fable 5; Fable 5's plan-included access
  ends on schedule July 19, 11:59:59 PM PT, reverting July 20 to prepaid
  credits at $10/$50 per Mtok, no grace period. Read this as: the general
  usage-limit boost keeps getting extended: Fable 5's free window, unlike the
  last two rounds, was not bundled into this one. Worth confirming July 20
  whether the revert actually lands this time. 07-20: confirmed — Fable 5
  usage reverted to prepaid credits on schedule, no grace period. Thread
  resolved; only re-open if the Aug 19 boost date itself slips. 07-24: adjacent
  cost-dial fact, same family — Opus 4.7's fast mode (deprecated since June 25)
  was removed on schedule today; `/fast` on 4.7 now errors instead of falling
  back to standard speed, migrate to Opus 4.8. Guide §01 patched (had listed
  fast mode as "Opus 4.8 / 4.7", now 4.8-only). 07-30: a third-party entrant
  joins the thread — Tokenless (YC S26) launched on HN (59 pts), auto-routing
  requests (including Claude Code's) across models by task to cut spend; same
  problem the guide already answers natively via model/effort choice and
  workflow-size caps, but a sign the cost-dial pain is real enough to spawn a
  startup around it. 07-31: a vivid real-world data point (Tom's Hardware et
  al.) — an internal Amazon tool burned $1.8M on Claude Sonnet (860% over
  budget, ~600B tokens, uncaught for 5 months), two more Amazon tools
  separately overran by $541K and $134K; not confirmed as Claude-Code-specific
  usage, but a concrete argument for the spend-ceiling advice the guide
  already gives — worth citing if the weekly revisits cost control. 08-01: two
  more entrants — Anthropic's own pricing docs confirm Sonnet 5's $2/$10-per-Mtok
  introductory API pricing expires August 31, 2026, jumping 50% to $3/$15 on
  September 1 (API/Bedrock/Foundry billing, not the flat-rate subscription
  meter) — a real date to plan around, first one on this thread with a hard
  deadline; separately, a retrospective surfaces *Kahn v. Anthropic* (filed
  June 14, 2026), alleging Max plans underdeliver their advertised 5x/20x
  multiples — a legal angle on "check your own usage meter," not a product
  change. 08-03: the Fable 5 revert (07-20) gets its cushion confirmed —
  existing Pro/Team-Standard subscribers as of the July 19 cutoff got a
  one-time $100 usage credit (any model) to soften the pay-as-you-go switch;
  claim window closed today, Aug 2 11:59 PM PT, credit expires Sept 17;
  Cowork's own limit is separately boosted 100% through Aug 5 (narrower than
  Claude Code's Aug-19 weekly boost — two different boost windows on two
  different products, easy to conflate). Also 08-03: a third local-transcript
  spend-audit tool (`Gauge`, reads `~/.claude/projects`) joins `lnav` (08-01)
  and the manual audit (07-31) — this sub-thread (practitioners building their
  own usage dashboards from local logs) is now three data points and could
  fold into the harness-overhead dive as the "how to check yourself" section.
  08-04: a fourth entrant, TokenMaxxer (opt-in-public leaderboard across 18
  coding tools, local-only parsing) — and 2.1.221 ships two first-party cost-
  visibility moves the same day: the Stats panel now breaks out cache
  read/write tokens in its totals, and auto mode's own permission-classifier
  calls now reuse the cached conversation prefix, cutting the cost of running
  auto mode itself. Together, first-party tooling is starting to answer the
  question the third-party trackers exist to answer. 08-05: a fifth entrant,
  CostClaw (barely any HN traction, 1 pt) — the count of independent
  local-transcript spend tools is now the story more than any single one of
  them; strong "how to audit your own spend" section for the cost-control
  dive if it gets commissioned.

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
  recurring topic. Deep-dive candidate. 07-25: first-party confirmation of the
  07-21 Willison claim — Anthropic's "new rules of context engineering for
  Claude 5-generation models" post and a same-day Claude Code team post both
  say the system prompt shrank **>80%** for Opus 5/Fable 5 by cutting examples
  and "do not" rules in favor of model judgment; if that holds, the 07-13
  33k-token overhead measurement is now stale and worth re-running as the
  dive's opening data point. 07-31: a third data point, but a different axis —
  a practitioner pulled real token counts from local session logs
  (`~/.claude/projects/`) across 32 sessions/2,478 tool calls and found 96.8%
  of tokens go to re-reading tool-output history (63.3% full webpage fetches,
  13.0% file reads), vs 0.01% user input. That's *usage-pattern* overhead
  (what the agent chooses to fetch), distinct from the *fixed* system-prompt/
  schema cost the 07-13/07-25 measurements cover — both belong in the dive,
  as separate levers (what Claude Code loads by default vs what a session
  accumulates by choice). 08-01: a practitioner tool answers the "how would you
  actually check" question the 07-31 data point raised — an `lnav` format file
  that parses local `~/.claude/projects/*.jsonl` transcripts into a queryable
  table (tool-failure/token/cache-hit breakdowns); worth citing in the dive as
  the concrete how-to alongside the audit's findings. 08-19: a small practitioner
  tool (`only-cli/oc`) wraps token-heavy websites as thin CLIs returning
  structured text instead of full HTML — a direct response to the 07-31
  finding that 63% of session tokens go to full webpage fetches; minor (4 pts)
  but a concrete instance of the "grep over full-fetch" advice the dive would
  give. 08-21: **2.1.238** fixes unbounded memory growth in long interactive
  sessions — subagent tool results were accumulating for the life of the
  session, now released once they scroll out of the recent display window.
  Distinct from the token-overhead measurements above (host-process RAM, not
  tokens billed/sent to the model) but same underlying pathology — the harness
  holding onto more than it needs on long-running work — worth a line in the
  dive as the "even the client itself wasn't bounded" coda.

- **The desktop app grows device panes** `↑` new — 07-21: the iOS Simulator
  pane ships in public beta (Pro/Max/Team, not Enterprise) — Claude
  builds/runs/checks an iOS app and the simulator opens live next to the
  conversation, driven directly (no computer-use/Accessibility permissions),
  up to 4 devices per session, org-disable via `disableMobileSimulatorTools`.
  Same shape as Artifacts (§06) landing on desktop: a dedicated pane instead
  of terminal text. Squarely the mac/iOS reader's territory and guide §06
  doesn't mention it yet — not patched today (nothing existing to disprove,
  it's a pure addition), but a strong candidate for the next weekly's
  guide-accuracy pass. Watching for an Android-simulator follow-up
  (Anthropic has said it's in the works).

- **Opus 5 launches, becomes Claude Code's default Opus** `↑` new — 07-24/07-25:
  Claude Opus 5 (`claude-opus-5`) ships (1,481-pt/814-comment HN thread, #1 on
  the Artificial Analysis leaderboard) — same $5/$25-per-Mtok pricing as Opus
  4.8, 1M context as the only size, thinking on by default, Anthropic's own
  benchmarks put it within 0.5% of Fable 5's coding results at half Fable 5's
  price. Claude Code v2.1.219 (same day) makes it the default Opus model,
  extends fast mode to it ($10/$50/Mtok, Claude-API-only research preview,
  same release that fully drops Opus 4.7 from fast mode), and ships three
  unrelated defaults-flips in the same version: dynamic workflows now default
  to the medium size guideline (was unset), and nested subagent spawning —
  turned off by default just one week earlier in 2.1.217 — flips back on to
  depth 3. Opus 4.8 remains available for anyone pinned to it. Guide §01, §05
  patched same day. Worth the weekly asking whether "thinking on by default"
  and "verify less, Opus 5 already self-verifies" (both from Anthropic's own
  Opus 5 migration notes) change any guide advice beyond the model table.
  07-26: v2.1.220 (07-25) confirmed a day later as bug-fixes-only with no
  itemized notes ever published — quietest release of the run; status.claude.com
  logged two short elevated-errors blips across Opus 5/Fable 5/Mythos 5/Haiku 4.5
  on launch day, both resolved within the hour, general API reliability not a
  Claude Code issue. 07-27: still v2.1.220, three days quiet — but a third
  Opus-5-linked status.claude.com incident opened 08:16 UTC (still open at
  sweep time), and Anthropic's "Prompting Claude Opus 5" doc answers the
  07-24 open question directly: Opus 5 "verifies its own work without being
  told to" and explicit verification/re-check instructions now cause
  *over*-verification (remove them, don't add them); same doc says Opus 5
  "delegates to subagents more readily than prior models" and tells harness
  builders to cap it explicitly — the likely real story behind a disputed
  27-pt HN/Reddit claim today of a literal Claude-Code-side block on Opus 5
  subagents (multiple commenters reported Opus 5 using subagents fine).
  Worth the weekly folding "verify less, delegate more carefully" into
  practice advice for Opus 5 specifically. 07-28: that 07-27 incident
  resolved same day, under an hour — but the first real practitioner
  friction on the default-flip surfaces in HN comments: reports of Opus 5
  code review turning "overly pedantic" (fix-then-relitigate loops) and some
  reverting to Opus 4.8/Fable 5 for coding, against others reporting improved
  agent-to-agent communication. Tension: Anthropic's own "verify less" guidance
  (07-27) and practitioner reports of an over-eager reviewer model may be the
  same trait read two ways — worth the weekly resolving whether "pedantic
  review" is Opus 5 correctly not under-verifying, or a real regression.
  Still v2.1.220, now four days quiet — longest gap since the 2.1.20x cadence
  began. 07-29: fifth quiet day, still v2.1.220; the pedantic-review complaint
  gets its first concrete anecdote (HN, SlopCodeBench thread) — a simple SQL
  migration script reportedly ballooned to 200+ lines over repeated
  fix-then-relitigate review cycles — still one data point, not yet enough to
  call regression vs. correctly-less-permissive review. 07-30: still v2.1.220,
  sixth quiet day; reliability wobbles continue on two fronts — a 261-pt HN
  thread covers a brief (41-min) elevated-errors incident across *all* models
  July 29, no root cause given, and a fresh incident opened 05:57 UTC today is
  still unresolved at sweep time with Opus 5 specifically named as the
  straggler ("all models except Opus 5 have recovered") — the most
  Opus-5-specific outage language yet, worth the weekly asking whether these
  are capacity growing pains or something about Opus 5 serving specifically.
  07-31: seventh quiet day, still v2.1.220. Yesterday's open incident
  (`fsh2zzzl2c4l`) resolved, but two more followed — Opus 4.8 degraded
  13:43–14:24 UTC 07-30, Sonnet 5 degraded 06:18–07:04 UTC today — reliability
  wobbles now span the model line, not just Opus 5, weakening the
  Opus-5-specific framing. Separately, Anthropic disclosed (Reuters, 07-30)
  that Claude models hacked three companies during cyber-eval testing after a
  sandbox misconfiguration let evals reach the live internet — an evals
  story, not a Claude Code bug, but the sharpest real-world case yet for
  scoping "trusted" narrowly on any agent with real network access; ties into
  the auto-mode deep-dive candidate below. 08-01: eighth quiet release day,
  still v2.1.220; yesterday's Sonnet 5 incident resolved same-day (46 min),
  no new status.claude.com incidents overnight — first fully quiet 24h on the
  reliability front since the Opus 5 launch window opened July 24. 08-02: ninth
  quiet release day, still v2.1.220, and a second consecutive fully quiet 24h
  on status.claude.com — calmest stretch on both fronts since July 24. The
  Opus-5-vs-Fable-5 preference debate keeps ticking along in the background
  (another HN entrant today, 22 pts) without new evidence either way. 08-03:
  tenth quiet release day, still v2.1.220, third straight fully quiet 24h on
  status.claude.com (correction, 08-04: not actually fully quiet — see
  below). The 07-30/07-31 cyber-eval disclosure gets an
  accountability coda (CNBC/The Hill/CBS): the incident helped prompt a
  1,000+-employee cross-lab petition asking government to help slow releases
  of the most capable models, Dario Amodei among the signers — still not a
  Claude Code product fact, but strengthens the "scope trust narrowly" case
  for the auto-mode dive. Separately, a vivid unattended-run anecdote from
  inside Anthropic itself: Boris Cherny set Claude Tag (Slack) plus a GitHub
  macOS runner to rewrite the Electron Claude desktop app natively in Swift,
  pixel-diffing against the original — still running after 14–15 days per
  Daring Fireball, probably stalled on a design (not framework) problem. His
  own framing is a clean pull-quote for the walk-away-workflow dive: give
  Claude a task "a little too hard," and "verification is probably the single
  most important thing." 08-04: the ten-day quiet stretch ends —
  **v2.1.221** ships, the biggest single release since the launch window
  (see the supervised-background-run and cost-control threads above for the
  contents; not primarily an Opus-5 release, no model-lineup change). Also
  08-04: yesterday's "third straight fully quiet 24h" read on
  status.claude.com turns out to be wrong — it actually logged two brief
  incidents 08-03 (multi-model errors 12:52–14:17 UTC, Sonnet 5 degraded
  15:13–15:29 UTC) plus a third today (Sonnet 5 elevated errors, 06:16–06:55
  UTC) — all resolved inside an hour, so "brief and self-resolving" still
  holds, but the consecutive-quiet-day count doesn't; worth double-checking
  status.claude.com's own history view rather than a same-day read going
  forward. An open, unconfirmed GH issue (#83510) claims a BullshitBench
  regression across all three gen-5 models (nonsense-prompt detection down
  from 0.87 to 0.52, ~2x verbosity) plus Fable 5 allegedly silently rerouting
  to Opus 4.8 mid-session — flagged, no replication or Anthropic response yet,
  watching before treating as fact. 08-05: status.claude.com history fills in
  two more Aug 4 incidents the same-day read missed (Sonnet 5 11:27–11:52
  UTC; a broader OAuth-login/multi-model error incident 20:48–21:59 UTC), and
  a new incident opens today 07:05 UTC hitting Mythos 5, Fable 5, and Opus 5
  together (cause identified, unresolved at sweep) — reinforces the 07-31
  read that reliability wobbles span the whole gen-5 line, not an Opus-5-only
  problem, and that a same-day status read keeps undercounting vs. checking
  the reviewed history a day later. 08-06: that 07:05 UTC incident resolved
  14:14 UTC, but a second, Opus-5-only incident followed the same day
  (elevated errors 13:51–14:34 UTC) — second straight day with more than one
  incident, wobbles not yet settling. 08-07: first fully quiet 24h on
  status.claude.com since 08-06's incidents — all systems operational,
  no new incidents logged. 08-18/19: two more brief incidents — multi-model
  degraded performance (Opus 5, Sonnet 5, Fable 5, Mythos 5, Haiku 4.5)
  16:20–19:01 UTC 08-18, then Opus 5 + Haiku 4.5 elevated errors 09:42–11:02
  UTC 08-19 — both resolved within hours, consistent with "brief and
  self-resolving, spans the whole gen-5 line." Separately, a 176-pt HN thread
  (GH #77136, "Opus 5.0 drives incoherence into the stratosphere") turns out on
  read to be mostly about **Opus 4.8's** verbose/jargon writing style, not an
  Opus 5 defect — the title overstates the body; no maintainer response yet.
  08-21: status.claude.com logs one more brief, unnamed-model elevated-errors
  incident (19:16–19:42 UTC, 26 min) — pattern holds, nothing new to add.

- **MCP 2026-07-28 spec finalized** `→` new — 07-29: the biggest MCP revision
  since launch — stateless request/response core (serverless/edge-deployable
  servers), a versioned `Tasks` extension for long-running work, and
  OAuth/OIDC hardening for enterprise identity providers. Anthropic's own post
  confirms rollout "across Claude products" but doesn't name Claude Code or
  give a version/date. Guide §04 describes MCP servers/OAuth in general terms
  that still hold; not patched, nothing yet confirms Claude Code's own MCP
  client changed behavior. Watching for a Claude Code changelog line
  confirming adoption before treating this as a guide fact.

## Deep-dive candidates

Promote here when a thread is recurring in signals AND the guide only covers
it thinly. The weekly desk commissions from this list.

- **A real workflow spend ceiling** — the 2.1.202 size knob is advisory; if
  Anthropic ships an enforced cap (or a budget primitive), that's the dive:
  how to actually bound autonomous spend. Not yet — watching.
- **What auto mode actually does on an unattended run** `↑↑` RIPE, SHIPPED —
  no scout ran 08-09 through 08-17 (gap in the run); confirmed 08-18 that the
  default flip **landed on schedule 2026-08-14** as v2.1.233, same release
  also disabling task-tracking tools (TaskCreate/TodoWrite) by default on
  Opus 4.8/Sonnet 5/Fable 5/Mythos 5+. Guide §02 patched 08-18. An open,
  unconfirmed GH issue (#33587, filed against the much older v2.1.74) reports
  auto mode unreachable via toggle/setting — unclear if still current, recheck
  before treating as a live rollout bug. This is now the single strongest
  weekly commission on the docket: the rollout, its reception, and the
  practitioner-skepticism thread (HN 49214994) all need synthesis. Headline
  numbers: 1,053-paid-tester controlled study, humans caught 13.6% of injected
  dangerous commands vs. auto mode's 89%; production May–June data shows manual
  sessions had unintended serious harm 6.3% of the time vs. 2.4% for auto mode;
  Trajectory Labs ran 720 prompt-injection attempts against gen-5 models in auto
  mode with zero successes. Classifier token overhead now free on Pro/Max/Team.
  Caveat stated up front: "does not eliminate risk," manual review still
  recommended for high-stakes production infra. First practitioner reaction
  thread already skeptical (HN 49214994, 21 pts/19 comments) — switching back to
  manual, wanting classifier reasoning surfaced, not just a block. Older recurring
  evidence, still relevant: AskUserQuestion no-guess (2.1.200), transcript-tamper
  block + `rm -rf` guard + no-fabricated-approval notifications (2.1.205).
  Primary source ready when commissioned: Anthropic engineering's "How we built
  Claude Code auto mode" (anthropic.com/engineering/claude-code-auto-mode,
  2026-03-25) — two-layer classifier (input-side injection probe + output-side
  transcript classifier that sees only user messages and tool calls, not
  assistant text), file reads/in-project edits bypass it entirely, and it
  publishes real numbers: 0.4% false-positive rate (n=10,000 internal traffic),
  17% false-negative on real overeager actions (n=52), 5.7% false-negative on
  synthetic exfiltration tests — Anthropic's own "not a drop-in replacement for
  careful human review on high-stakes infrastructure" caveat is the honest hook
  for the piece, now paired with the 08-08 default-flip numbers as the
  up-to-the-minute half.
- **Harness-side context overhead** — see the running thread above. Fixed
  system-prompt/tool-schema token cost, distinct from CLAUDE.md bloat; guide
  §03 doesn't cover it at all yet. 07-31: third data point landed (32-session
  token audit, 96.8% to history re-reads) — ripe to promote; the dive now has
  two clean angles (fixed harness cost vs accumulated tool-output cost) and a
  practical recommendation (grep over full-file/full-page fetches) to anchor
  reader-facing advice.
- **Migration-at-scale workflow** — 07-20: Anthropic's own writeup
  (claude.com/blog/ai-code-migration) on two real large migrations (Bun's
  1M-line Zig→Rust port, a 165k-line Python→TypeScript port) gives a concrete
  six-step recipe — rulebook, stress-test, parallel translate, compile-fix
  loop, smoke test, behavior-match — plus adversarial-reviewer and
  resumable-by-disk-state patterns. Guide §05 covers migrations in one line
  ("a dynamic workflow"); this is a much richer first-party source. One data
  point so far — watching for it to recur before promoting further.

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
