// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

// A GitHub Pages project site: a power-user field guide to Claude Code.
// Content is frontmatter-driven (see src/content.config.ts) so the autonomous
// editorial agents (scout, weekly, deep-dive) can write entries reliably.
export default defineConfig({
  site: 'https://albertogrande.github.io',
  base: '/claude-code',
  trailingSlash: 'ignore',
  integrations: [mdx(), sitemap()],
});
