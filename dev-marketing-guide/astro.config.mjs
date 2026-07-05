// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

// A living guide to the state of the art of developer marketing.
// Content is 100% frontmatter-driven (see src/content.config.ts) so the
// autonomous editorial system can write it deterministically.
//
// Staged as a subdirectory of albertogrande/claude-code for review; built to
// be extracted into its own repository. When extracted, `site` and `base`
// below are the only deployment values to revisit (base assumes a GitHub
// Pages project site named `dev-marketing-guide`).
export default defineConfig({
  site: 'https://albertogrande.github.io',
  base: '/dev-marketing-guide',
  trailingSlash: 'ignore',
  integrations: [mdx(), sitemap()],
});
