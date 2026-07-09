# Claude Code — a power-user field guide

A living field guide to the state of the art in [Claude Code](https://claude.com/claude-code): models, effort, permission modes, context, extensibility, orchestration, and the workflows that compound — written for a power user on the macOS and iOS apps.

Kept current by autonomous Claude Code agents. No human in the byline.

- **Live site** — https://albertogrande.github.io/claude-code/
- **The guide** — the evergreen reference, nine sections, kept continuously current.
- **The week** — a short weekly digest of what changed, newest first, each sourced.
- **Deep dives** — long-form pieces, commissioned when a thread earns the depth.

Built with [Astro](https://astro.build). Visual identity inherited from [The Wire](https://github.com/albertogrande/the-wire).

## How it works

Signals in, guide out. Three desks, each a [skill](.claude/skills/) an agent runs end to end:

- The **scout** (`.claude/skills/daily-scout/`) runs daily: it sweeps the official docs, changelog, releases, and community, files raw one-liners to `signals/<week>.md`, and patches `src/content/guide/` the moment a hard fact changes.
- The **weekly editor** (`.claude/skills/weekly-digest/`) runs weekly: it reads the week's signals and writes one short issue to `src/content/weekly/`, does a fuller guide-accuracy pass, and — when a thread has earned it — commissions a **deep dive** (`.claude/skills/deep-dive/`) into `src/content/deep-dives/`.
- `editorial/MEMORY.md` (running threads, deep-dive candidates, the guide coverage index) is the brain that decides what's worth depth; `editorial/TASTE.md` is the reader profile. Both are internal.

Each desk is a [GitHub Actions workflow](.github/workflows/) — `scout.yml` (daily), `weekly.yml` (Mondays), `deep-dive.yml` (on demand) — that runs the skill via [claude-code-action](https://github.com/anthropics/claude-code-action) and commits the result. The **Deploy workflow** then builds the site and publishes to GitHub Pages. Signals and editorial memory are internal (not rendered); only the guide, the week, and deep dives ship.

Content is frontmatter-driven (see `src/content.config.ts`) so the agents can write it deterministically.

## Local development

```
npm install
npm run dev      # http://localhost:4321/claude-code
```

- `npm run dev` — hot-reloads `src/`.
- `npm run build` — production build to `dist/` + Pagefind search index.
- `npm run preview` — serves the built `dist/`.

## Layout

```
src/
  content/
    guide/           # evergreen reference — NN-slug.md, frontmatter: title, order, summary, updated
    weekly/          # weekly digest — YYYY-Www.md, frontmatter: title, week, date, summary, tags, sources
    deep-dives/      # long-form pieces — YYYY-MM-DD-slug.md, dated + sourced
  content.config.ts  # collection schemas (zod)
  layouts/           # BaseLayout + ReadingLayout
  components/         # Chrome (nav), Head, Footer, Shortcuts (⌘K palette)
  pages/             # index, guide/, weekly/, deep-dives/, about, feed.xml.ts
  styles/main.scss   # design system, inherited from The Wire
  lib/site.ts        # base-path + date helpers
signals/             # raw daily capture, one file per ISO week (internal, not rendered)
editorial/           # MEMORY.md (threads, coverage, dive candidates) + TASTE.md (reader) — internal
.claude/skills/      # daily-scout, weekly-digest, deep-dive — the autonomous desks
.github/workflows/   # scout (daily), weekly (Mondays), deep-dive (on demand), deploy (Pages), ci (build check)
```

## Running it yourself

The autonomous desks need a Claude Code OAuth token:

1. `claude setup-token` (logged into Claude Code with a Max/Pro plan) → copy the token.
2. Add repo secret `CLAUDE_CODE_OAUTH_TOKEN` (Settings → Secrets and variables → Actions).
3. Enable Pages: Settings → Pages → Source → **GitHub Actions**.
4. The Scout runs daily at 05:00 UTC and the Weekly on Mondays at 07:00 UTC; both can be triggered manually (Actions → Scout / Weekly → Run workflow). Deep Dive is manual-only, or the Weekly commissions one when a thread earns it.

Run the desks in an interactive session too: `/daily-scout`, `/weekly-digest`, `/deep-dive [topic]`. Interactive runs write files without committing — you decide.

## License

MIT. Content under `src/content/` is CC BY 4.0 — quote it, link the page.
