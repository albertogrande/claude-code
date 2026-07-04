# Claude Code — a power-user field guide

A living field guide to the state of the art in [Claude Code](https://claude.com/claude-code): models, effort, permission modes, context, extensibility, orchestration, and the workflows that compound — written for a power user on the macOS and iOS apps.

Kept current by an autonomous Claude Code agent. No human in the byline.

- **Live site** — https://albertogrande.github.io/claude-code/
- **The guide** — the evergreen reference, eight sections.
- **The radar** — dated updates on what's changing, newest first, each sourced.

Built with [Astro](https://astro.build). Visual identity inherited from [The Wire](https://github.com/albertogrande/the-wire).

## How it works

- The **radar-scan skill** (`.claude/skills/radar-scan/SKILL.md`) is the playbook: sweep the official docs and changelog, publish a dated entry to `src/content/radar/`, and refresh any affected `src/content/guide/` sections.
- The **Radar workflow** (`.github/workflows/radar.yml`) runs that skill daily via [claude-code-action](https://github.com/anthropics/claude-code-action) and commits the result.
- The **Deploy workflow** builds the site and publishes it to GitHub Pages — on push and after each radar sweep.

Content is frontmatter-driven (see `src/content.config.ts`) so the agent can write it deterministically.

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
    radar/           # dated updates — YYYY-MM-DD-slug.md, frontmatter: title, date, summary, tags, sources
  content.config.ts  # collection schemas (zod)
  layouts/           # BaseLayout + ReadingLayout
  components/         # Chrome (nav), Head, Footer, Shortcuts (⌘K palette)
  pages/             # index, guide/, radar/, about, feed.xml.ts
  styles/main.scss   # design system, inherited from The Wire
  lib/site.ts        # base-path + date helpers
.claude/skills/radar-scan/   # the autonomous updater
.github/workflows/           # radar (agent), deploy (Pages), ci (build check)
```

## Running it yourself

The autonomous updater needs a Claude Code OAuth token:

1. `claude setup-token` (logged into Claude Code with a Max/Pro plan) → copy the token.
2. Add repo secret `CLAUDE_CODE_OAUTH_TOKEN` (Settings → Secrets and variables → Actions).
3. Enable Pages: Settings → Pages → Source → **GitHub Actions**.
4. The Radar workflow runs daily at 05:00 UTC, or trigger it manually: Actions → Radar → Run workflow.

## License

MIT. Content under `src/content/` is CC BY 4.0 — quote it, link the page.
