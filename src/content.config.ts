import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Three rendered collections, all frontmatter-driven so the editorial agents
// can write them deterministically.
//
//  guide/    — the evergreen reference. One file per section: NN-slug.md.
//              This is the product: kept continuously current.
//  weekly/   — the weekly digest ("The Week"). One file per ISO week:
//              YYYY-Www.md. A short "what changed" read to stay current.
//  deep-dives/ — long-form researched pieces, commissioned when a thread
//              earns it. One file per piece: YYYY-MM-DD-slug.md.
//
// Raw daily capture lives in `signals/` (repo root, internal) and editorial
// memory in `editorial/` — neither is rendered; they feed the collections
// above. See .claude/skills/ for the playbooks.
//
// The entry id is the filename without extension, which becomes the URL slug.

const guide = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/guide' }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    summary: z.string(),
    updated: z.coerce.date(),
  }),
});

const weekly = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/weekly' }),
  schema: z.object({
    title: z.string(),
    // ISO week id, e.g. "2026-W28" — also the filename/slug.
    week: z.string(),
    // Publish date (the week's Monday), drives ordering and the feed.
    date: z.coerce.date(),
    summary: z.string(),
    // Optional revision stamp when a digest is corrected after publication.
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    // Cross-links to guide sections or deep dives. `href` is a base-less site
    // path (e.g. "/guide/01-models-and-effort") or a full external URL.
    related: z
      .array(z.object({ label: z.string(), href: z.string() }))
      .default([]),
    // Where to check the week's claims — changelog entries, blog posts, threads.
    sources: z
      .array(z.object({ label: z.string(), url: z.string().url() }))
      .default([]),
  }),
});

// practices/ — atomic, retrievable best-practices for agent consumption (and a
// human-readable page). Each is a "when X → do Y (because Z)" unit tied to a
// guide section. Surfaced to agents via /practices.json and the MCP server.
const practices = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/practices' }),
  schema: z.object({
    // Short imperative name, e.g. "Switch to Fable for long unattended runs".
    title: z.string(),
    // The trigger condition — when this applies.
    when: z.string(),
    // The action to take.
    do: z.string(),
    // Why it works / the rationale.
    why: z.string(),
    // The guide section id this belongs to, e.g. "01-models-and-effort".
    section: z.string(),
    // Controlled vocabulary — search_practices filters by tag, so drift would
    // silently break the filter. Extend the enum deliberately, not ad hoc.
    tags: z
      .array(
        z.enum([
          'models',
          'modes',
          'context',
          'skills',
          'plugins',
          'mcp',
          'hooks',
          'workflow',
          'subagents',
          'apps',
          'teams',
        ])
      )
      .default([]),
    // The versioned fact that made this true (e.g. "2.1.200"). The corpus's
    // measured edge over a bare model is versioned facts — carry the version.
    since: z.string().optional(),
    // How to check it still holds (a command, a setting to look at).
    verify: z.string().optional(),
    // Stamped by the quarterly Probes workflow: does a bare model already give
    // this answer? `agree` practices are candidates to retire or refresh.
    probe: z
      .object({
        status: z.enum(['agree', 'partial', 'diverge']),
        date: z.coerce.date(),
      })
      .optional(),
    sources: z
      .array(z.object({ label: z.string(), url: z.string().url() }))
      .default([]),
    updated: z.coerce.date(),
  }),
});

const deepDives = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/deep-dives' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    // Optional revision stamp for when a dive is refreshed after publication.
    updated: z.coerce.date().optional(),
    summary: z.string(),
    // A longer standfirst rendered under the title.
    dek: z.string().optional(),
    tags: z.array(z.string()).default([]),
    related: z
      .array(z.object({ label: z.string(), href: z.string() }))
      .default([]),
    sources: z
      .array(z.object({ label: z.string(), url: z.string().url() }))
      .default([]),
  }),
});

export const collections = { guide, weekly, practices, 'deep-dives': deepDives };
