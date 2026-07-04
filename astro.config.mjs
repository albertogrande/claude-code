// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

// SOTA — a GitHub Pages project site tracking the state of the art in Claude
// Code. Content is frontmatter-driven (see src/content.config.ts) so the
// autonomous radar agent can append dated entries reliably.
export default defineConfig({
  site: 'https://albertogrande.github.io',
  base: '/claude-code-sota',
  trailingSlash: 'ignore',
  integrations: [mdx(), sitemap()],
});
