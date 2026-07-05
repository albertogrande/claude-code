# dev/market

A living guide to the state of the art in **developer marketing** —
positioning, content, launches, community, and growth for products sold to
developers. Maintained by an autonomous editorial system built on Claude Code.

## The model

Three surfaces, one feedback loop:

| Surface | What | Cadence |
| --- | --- | --- |
| **Guide** (`src/content/guide/`) | Canonical evergreen reference, one file per section (`NN-slug.md`). Sections cite sources and carry a visible changelog. | Updated whenever a signal/article dates it; audited on demand |
| **Signals** (`src/content/signals/`) | Dated intelligence (`YYYY-MM-DD-slug.md`), at most one a day, always with a primary source and an editorial take. | Daily |
| **Articles** (`src/content/articles/`) | Deep dives, published only when a signal clears the promotion bar. Signals link forward (`promotedTo`), articles link back (`fromSignal`). | Conditional, evaluated weekly |

The editorial layer lives in `editorial/`:

- `STANDARDS.md` — the house standard: voice, structure, anti-slop rules,
  verification gates. Every skill writes against it.
- `SOURCES.md` — the sweep list (referents, regulars, fetchable endpoints).
- `MEMORY.md` — coverage index, open threads, reader notes.
- `queue/` — the scout's daily catch; unchosen candidates become article leads.

The desks are Claude Code skills in `.claude/skills/`:

- `daily-signal` — scout → writer → editor, one signal a day at most.
- `promote-article` — the weekly promotion decision and the deep dive.
- `guide-audit` — proactive re-verification of the canonical guide.

Automation is in `.github/workflows/`: `signal.yml` (daily 04:30 UTC),
`article.yml` (Thursdays 05:00 UTC), `ci.yml` (build check on PR/push),
`deploy.yml` (GitHub Pages). The Claude workflows need the repo secret
`CLAUDE_CODE_OAUTH_TOKEN` (from `claude setup-token`).

## Stack

Astro 5 · SCSS · Pagefind search · GitHub Pages. Content is 100%
frontmatter-driven and zod-validated at build time (`src/content.config.ts`),
so a malformed autonomous write fails CI instead of shipping.

```bash
npm install
npm run dev        # local dev (search needs a full build)
npm run build      # astro build + pagefind index → dist/
npm run preview
```

## Staging note

This project is currently staged as the `dev-marketing-guide/` subdirectory of
`albertogrande/claude-code`, pending extraction into its own repository. It is
self-contained: everything it needs (package.json, config, skills, workflows)
lives under this directory. On extraction, the `.github/workflows/` activate
as-is; revisit `site`/`base` in `astro.config.mjs` if the new repo isn't a
GitHub Pages project site named `dev-marketing-guide`.

## Licensing

Code MIT; published content CC BY 4.0.
