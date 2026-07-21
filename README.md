# Claude Code: a power-user field guide

[![CI](https://img.shields.io/github/actions/workflow/status/albertogrande/claude-code/ci.yml?branch=main&label=CI)](https://github.com/albertogrande/claude-code/actions/workflows/ci.yml)
[![Deploy](https://img.shields.io/github/actions/workflow/status/albertogrande/claude-code/deploy.yml?branch=main&label=Deploy)](https://github.com/albertogrande/claude-code/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/github/license/albertogrande/claude-code)](LICENSE)

A field guide to [Claude Code](https://claude.com/claude-code) on Mac and iOS.

<!-- TODO(author): add a site screenshot here -->

Kept current by autonomous Claude Code agents. No human in the byline.

- **Live site**: https://albertogrande.github.io/claude-code/
- **The guide**: the evergreen reference, nine sections, kept continuously current.
- **The week**: a short weekly digest of what changed, newest first, each sourced.
- **Deep dives**: long-form pieces, commissioned when a thread earns the depth.

Built with [Astro](https://astro.build). Visual identity inherited from [The Wire](https://github.com/albertogrande/the-wire).

## How it works

Signals in, guide out. Three desks, each a [skill](.claude/skills/) an agent runs end to end:

- The **scout** (`.claude/skills/daily-scout/`) runs daily: it sweeps the official docs, changelog, releases, and community, files raw one-liners to `signals/<week>.md`, and patches `src/content/guide/` the moment a hard fact changes.
- The **weekly editor** (`.claude/skills/weekly-digest/`) runs weekly: it reads the week's signals and writes one short issue to `src/content/weekly/`, does a fuller guide-accuracy pass, and, when a thread has earned it, commissions a **deep dive** (`.claude/skills/deep-dive/`) into `src/content/deep-dives/`.
- `editorial/MEMORY.md` (running threads, deep-dive candidates, the guide coverage index) is the brain that decides what's worth depth; `editorial/TASTE.md` is the reader profile. Both are internal.

Each desk is a [GitHub Actions workflow](.github/workflows/): `scout.yml` (daily), `weekly.yml` (Mondays), `deep-dive.yml` (on demand). Each runs the skill via [claude-code-action](https://github.com/anthropics/claude-code-action) and commits the result. The **Deploy workflow** then builds the site and publishes to GitHub Pages. Signals and editorial memory are internal (not rendered); only the guide, the week, and deep dives ship.

Content is frontmatter-driven (see `src/content.config.ts`) so the agents can write it deterministically.

## Local development

Prerequisites: Node 20 and npm (the version CI builds and deploys against).

```
npm install
npm run dev      # http://localhost:4321/claude-code
```

- `npm run dev`: hot-reloads `src/`.
- `npm run build`: production build to `dist/` + Pagefind search index.
- `npm run preview`: serves the built `dist/`.

## Layout

```
src/
  content/
    guide/           # evergreen reference: NN-slug.md, frontmatter: title, order, summary, updated
    weekly/          # weekly digest: YYYY-Www.md, frontmatter: title, week, date, summary, tags, sources
    practices/       # atomic best-practices: {when, do, why, section, since, verify}; human page at /practices, agents read /practices.json
    deep-dives/      # long-form pieces: YYYY-MM-DD-slug.md, dated + sourced
  content.config.ts  # collection schemas (zod)
  layouts/           # BaseLayout + ReadingLayout
  components/        # Chrome (nav), Head, Footer, Shortcuts (⌘K palette), TagList, ArticleFoot
  pages/             # index, guide/, weekly/, deep-dives/, practices/, tags/, about, 404, feed.xml.ts
                     #  + machine endpoints: llms.txt, llms-full.txt, practices.json, guide.json, weekly.json
  styles/main.scss   # design system, inherited from The Wire
  lib/               # site.ts (base-path + dates) + content.ts (shared collection queries)
scripts/             # build gates: check-refs (internal links), check-contract (endpoints ↔ MCP), check-sources (URL liveness), append-ledger
signals/             # raw daily capture, one file per ISO week (internal, not rendered)
editorial/           # MEMORY.md (threads, coverage, dive candidates) + TASTE.md (reader), internal
usage/               # ledger.csv: per-run cost/duration, appended by the workflows
mcp/                 # remote MCP server exposing the guide to your own sessions (+ tests, evals)
plugin/skills/       # consult-the-guide: tells sessions when to query the MCP
docs/agent-access.md # design doc for the agent-access model
.claude/skills/      # daily-scout, weekly-digest, deep-dive: the autonomous desks
.github/workflows/   # scout (daily), weekly (Mondays), deep-dive (dispatched), probes (quarterly), deploy (Pages), ci
.github/actions/     # commit-and-push (rebase-safe), notify-failure (pipeline-failure issues)
```

## Running it yourself

The autonomous desks need a Claude Code OAuth token:

1. `claude setup-token` (logged into Claude Code with a Max/Pro plan) → copy the token.
2. Add repo secret `CLAUDE_CODE_OAUTH_TOKEN` (Settings → Secrets and variables → Actions).
3. Enable Pages: Settings → Pages → Source → **GitHub Actions**.
4. The Scout runs daily at 05:00 UTC and the Weekly on Mondays at 07:00 UTC; both can be triggered manually (Actions → Scout / Weekly → Run workflow). Deep Dive is manual-only, or the Weekly commissions one when a thread earns it.

Run the desks in an interactive session too: `/daily-scout`, `/weekly-digest`, `/deep-dive [topic]`. Interactive runs write files without committing; you decide.

## Use the guide from your own sessions

The guide is also a **source agents can query**, not just a site to read. It
publishes machine endpoints (`/llms.txt`, `/llms-full.txt`, `/practices.json`,
`/guide.json`, `/weekly.json`) and ships a small **remote MCP server** (`mcp/`)
that lets your own Claude Code sessions consult the current state of the art
before deciding a model, a permission mode, a context operation, or a workflow.
See [`mcp/README.md`](mcp/README.md) to run/deploy/connect it and
[`docs/agent-access.md`](docs/agent-access.md) for the design.

## License

MIT. Content under `src/content/` is CC BY 4.0: quote it, link the page.
