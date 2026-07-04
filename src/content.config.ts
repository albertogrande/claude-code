import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Two collections, both frontmatter-driven so the radar agent can write them
// deterministically.
//
//  radar/  — dated updates. One file per entry: YYYY-MM-DD-slug.md
//  guide/  — the evergreen reference. One file per section: NN-slug.md
//
// The entry id is the filename without extension, which becomes the URL slug.

const radar = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/radar' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
    sources: z
      .array(z.object({ label: z.string(), url: z.string().url() }))
      .default([]),
  }),
});

const guide = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/guide' }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    summary: z.string(),
    updated: z.coerce.date(),
  }),
});

export const collections = { radar, guide };
