# Marginal-value probes — quarterly protocol

Measures what a **bare model** (no tools, no guide access) gets wrong that the
guide gets right. That delta is the MCP's reason to exist; when it shrinks,
practices have decayed into common knowledge and should be retired or
refreshed. Runs quarterly via `.github/workflows/probes.yml` (or on demand
with its workflow_dispatch), and is worth an extra run after any big model
release.

## Protocol

1. Read the current corpus from `src/content/practices/` in the checkout —
   not from production, which lags the repo until the next deploy.
2. For **each practice**, pose its underlying decision question to a **fresh
   subagent with no tools** ("Answer from your own knowledge ONLY. Do NOT use
   any tools…"), phrased neutrally — never leading with the practice's answer.
   Add new questions for practices added since the last run; drop questions
   whose practices were retired.
3. Grade each answer against the practice: **AGREE** (matches the
   recommendation), **PARTIAL** (right end-state, missing the versioned
   specifics), **DIVERGE/UNKNOWN** (wrong recommendation or admits ignorance).
4. Stamp each practice's frontmatter in `src/content/practices/` with the
   verdict — `probe: { status: agree|partial|diverge, date: <today> }` — so
   the corpus itself carries its decay state (the weekly editor retires
   `agree` practices). Then update `mcp/EVALS.md` (Eval 1 table + date) and
   note decayed practices in `editorial/MEMORY.md`. The workflow runs the
   retrieval regression eval as a gated step after you and commits.

Grading guardrails: quote the bare answer's key claim in the table; when in
doubt between PARTIAL and AGREE, ask "would the user have made the same
concrete choice?" — outcome-compatible-by-luck is PARTIAL, not AGREE.

## Question bank (v1, 2026-07-10 — one per practice)

| Practice | Probe question (pose verbatim, prefixed with the no-tools instruction) |
|---|---|
| `switch-to-fable-for-long-unattended-runs` | "I'm about to kick off a ~45-minute, largely unattended multi-file refactor in Claude Code (⟨current month/year⟩). Which Claude model should the session use, and why?" |
| `keep-askuserquestion-non-auto-continue-overnight` | "I'm leaving a Claude Code job running overnight and it might hit an AskUserQuestion prompt. As of ⟨date⟩, what is the default behavior if I'm not there to answer (does it auto-continue?), and should I change any setting before going to bed?" |
| `use-auto-mode-for-unattended-runs` | "I'm starting a long unattended Claude Code run and don't want to approve 200 permission prompts. Which permission mode should I use — and when, if ever, is bypass-permissions the right choice? (⟨date⟩)" |
| `clear-context-after-a-second-failed-correction` | "Claude has tried to fix the same bug twice in my session and it's still wrong. Should I explain the correction a third time, or do something else?" |
| `cap-dynamic-workflow-size-before-ultracode` | "I'm about to make an 'ultracode' multi-agent workflow request in Claude Code (⟨date⟩) and I'm not sure how big it will get. How do I bound its size/cost beforehand? Is the 'Dynamic workflow size' setting in /config an enforced hard ceiling on the number of agents?" |
| `delegate-routine-coding-to-a-subagent` | "My task is a multi-file change that's mostly mechanical boilerplate around a few real design decisions. My session runs an expensive top-tier model. How do I keep the token/allowance spend down without losing quality on the decisions?" |
| `use-artifacts-instead-of-pasting-long-output` | "Claude Code just produced a long PR walkthrough / investigation writeup. I was going to paste it into Slack. Is there a better way to share or keep it in the Claude apps (⟨date⟩)? Is there a keyboard shortcut to reopen the most recent one?" |
| `split-the-writer-from-the-reviewer` | "My Claude Code session just finished building a nontrivial feature. What's the best way to review/grade that work before I accept it?" |
| `run-doctor-when-setup-misbehaves` | "Claude Code is acting oddly after an update — a hook isn't firing and an MCP server is missing (⟨date⟩). What's the first thing I should do to diagnose it? Is there a built-in command, and does it fix anything or only report?" |
| `set-per-server-mcp-timeouts` | "One of my MCP servers does long-running calls and they die at about 60 seconds in fresh Claude Code sessions (⟨date⟩). Is there a per-server setting to raise that limit, and is it actually honored?" |
| `trim-claude-md-to-what-claude-cannot-derive` | "My checked-in CLAUDE.md has grown to several screens. What should stay in it and what should go — and is there tooling in Claude Code (⟨date⟩) that flags or proposes those trims?" |

The three 2026-07-10 additions enter the bank unprobed — their first verdicts
come with the next quarterly run.

## History

| Date | Model probed | AGREE | PARTIAL | DIVERGE/UNKNOWN | Notes |
|---|---|---|---|---|---|
| 2026-07-10 | Fable 5 | 3 | 2 | 3 | Baseline over the original 8 practices. Value concentrated in versioned facts (Fable lineup, auto mode, 2.1.200 default, workflow-size setting, Ctrl+]). Full table in EVALS.md. Bookkeeping note: the `probe:` frontmatter stamps for this run were applied late (with the 2026-07-10 QA pass), not by the run itself. |
