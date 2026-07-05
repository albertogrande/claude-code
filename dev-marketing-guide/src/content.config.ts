import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Three collections, all frontmatter-driven so the autonomous editorial
// system can write them deterministically. The entry id is the filename
// without extension, which becomes the URL slug.
//
//  guide/    — the canonical, evergreen reference. One file per section:
//              NN-slug.md. Sections cite sources and carry a visible
//              changelog, so "kept current" is auditable, not asserted.
//  signals/  — dated intelligence. One file per entry: YYYY-MM-DD-slug.md.
//              Every signal has a required editorial `take`. `status` tracks
//              whether a signal was later promoted into an article — the
//              signal → article feedback loop lives in the data.
//  articles/ — long-form pieces promoted from signals (or commissioned).
//              YYYY-MM-DD-slug.md, with a `fromSignal` backlink when the
//              piece grew out of the feed.

// A cross-link to another page on the site (base-less path such as
// "/guide/02-positioning" or "/signals/2026-07-05-...") or a full external URL.
const related = z.array(z.object({ label: z.string(), href: z.string() }));

// Where to check the original. Every collection requires at least one.
const sources = z.array(z.object({ label: z.string(), url: z.string().url() }));

const guide = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/guide' }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    summary: z.string(),
    updated: z.coerce.date(),
    // Load-bearing references for the section's claims.
    sources: sources.default([]),
    // Revision history, newest first. The editorial system appends an entry
    // whenever a signal or article forces a change, so the reader can see
    // what moved and when.
    changelog: z
      .array(z.object({ date: z.coerce.date(), note: z.string() }))
      .default([]),
  }),
});

const signals = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/signals' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    // What kind of item this is — drives the category chip.
    //   launch     — a product/campaign/launch worth studying
    //   playbook   — a tactic or approach worth stealing
    //   data       — a report, benchmark, or dataset
    //   move       — people/org changes that shift the field
    //   discussion — a debate the field is having
    //   resource   — a tool, list, or reference worth saving
    //   note       — editorial/meta
    kind: z
      .enum(['launch', 'playbook', 'data', 'move', 'discussion', 'resource', 'note'])
      .default('note'),
    summary: z.string(),
    // The editorial point of view — required, not optional. A signal without
    // a take is a bookmark, and bookmarks don't get published here.
    take: z.string(),
    tags: z.array(z.string()).default([]),
    // Promotion state. The weekly article run flips `status` to "promoted"
    // and sets `promotedTo` when a signal is worked up into an article.
    status: z.enum(['noted', 'promoted']).default('noted'),
    promotedTo: z.string().optional(),
    // Which guide section this signal touches (base-less path), if any.
    // The scan records it; the guide refresh acts on it.
    guideImpact: z.string().optional(),
    related: related.default([]),
    sources: sources.min(1),
  }),
});

const articles = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    // Optional revision stamp for when a piece is refreshed after publication.
    updated: z.coerce.date().optional(),
    summary: z.string(),
    // A longer standfirst rendered under the title.
    dek: z.string().optional(),
    tags: z.array(z.string()).default([]),
    // Backlink to the signal this piece was promoted from, if any
    // (base-less path, e.g. "/signals/2026-07-05-...").
    fromSignal: z.string().optional(),
    related: related.default([]),
    sources: sources.min(2),
  }),
});

export const collections = { guide, signals, articles };
