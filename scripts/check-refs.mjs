#!/usr/bin/env node
// Referential-integrity gate. The autonomous writers author frontmatter and
// markdown; a typo'd guide id or a base-less internal link ships as a silently
// broken link. This runs in `npm run build`, so it fails the build instead.
//
// Checks:
//   1. every practice's `section:` names a real guide section
//   2. every internal `related[].href` resolves to a real route
//   3. body links: internal markdown links must carry the site base
//      (/claude-code/...) and resolve; relative ./x.md links are errors
//      (they 404 on the built site)

import { readFileSync, readdirSync } from 'node:fs';

const BASE = (readFileSync('astro.config.mjs', 'utf8').match(/base:\s*'([^']+)'/) || [])[1] || '';

const mdFiles = (dir) => readdirSync(dir).filter((f) => /\.mdx?$/.test(f));
const ids = (dir) => new Set(mdFiles(dir).map((f) => f.replace(/\.mdx?$/, '')));

const guideIds = ids('src/content/guide');
const weeklyIds = ids('src/content/weekly');
const diveIds = ids('src/content/deep-dives');
const practiceIds = ids('src/content/practices');

// Tag vocabulary across the tagged collections → valid /tags/<tag> routes.
const tags = new Set();
for (const dir of ['weekly', 'deep-dives', 'practices']) {
  for (const f of mdFiles(`src/content/${dir}`)) {
    const m = readFileSync(`src/content/${dir}/${f}`, 'utf8').match(/^tags:\s*\[([^\]]*)\]/m);
    if (m) m[1].split(',').map((t) => t.trim()).filter(Boolean).forEach((t) => tags.add(t));
  }
}

const STATIC_ROUTES = new Set([
  '/', '/guide', '/weekly', '/deep-dives', '/practices', '/tags', '/about',
  '/feed.xml', '/llms.txt', '/llms-full.txt', '/guide.json', '/practices.json', '/weekly.json',
]);

// href is a base-less site path (the `related` convention) — resolve it.
function resolves(href) {
  const [path, hash] = href.split('#');
  const clean = path.replace(/\/$/, '') || '/';
  if (clean === '/practices' && hash) return practiceIds.has(hash);
  if (STATIC_ROUTES.has(clean)) return true;
  let m;
  if ((m = clean.match(/^\/guide\/([^/]+)$/))) return guideIds.has(m[1]);
  if ((m = clean.match(/^\/weekly\/([^/]+)$/))) return weeklyIds.has(m[1]);
  if ((m = clean.match(/^\/deep-dives\/([^/]+)$/))) return diveIds.has(m[1]);
  if ((m = clean.match(/^\/tags\/([^/]+)$/))) return tags.has(m[1]);
  return false;
}

const problems = [];

for (const dir of ['guide', 'weekly', 'deep-dives', 'practices']) {
  for (const f of mdFiles(`src/content/${dir}`)) {
    const file = `src/content/${dir}/${f}`;
    const text = readFileSync(file, 'utf8');
    const fmEnd = text.indexOf('---', 3);
    const fm = text.slice(0, fmEnd);
    const body = text.slice(fmEnd);

    // 1. practice.section must be a real guide section
    if (dir === 'practices') {
      const m = fm.match(/^section:\s*["']?([^\s"']+)/m);
      if (!m) problems.push(`${file}: missing section`);
      else if (!guideIds.has(m[1])) problems.push(`${file}: section "${m[1]}" is not a guide section`);
    }

    // 2. related hrefs (frontmatter): base-less site paths or external URLs
    for (const m of fm.matchAll(/^\s*href:\s*["']?(\S+?)["']?\s*$/gm)) {
      const href = m[1];
      if (/^https?:\/\//.test(href)) continue;
      if (!href.startsWith('/')) problems.push(`${file}: related href "${href}" is not absolute`);
      else if (BASE && href.startsWith(`${BASE}/`))
        problems.push(`${file}: related href "${href}" must be base-less (drop ${BASE})`);
      else if (!resolves(href)) problems.push(`${file}: related href "${href}" resolves to nothing`);
    }

    // 3. body markdown links
    for (const m of body.matchAll(/\]\(([^)\s]+)\)/g)) {
      const href = m[1];
      if (/^(https?:|mailto:|#)/.test(href)) continue;
      if (/^\.{1,2}\//.test(href)) {
        problems.push(`${file}: relative body link "${href}" breaks on the built site — use ${BASE}/<path>`);
      } else if (href.startsWith('/')) {
        if (BASE && !href.startsWith(`${BASE}/`) && href !== BASE) {
          problems.push(`${file}: body link "${href}" is missing the site base ${BASE}`);
        } else if (!resolves(href.slice(BASE.length) || '/')) {
          problems.push(`${file}: body link "${href}" resolves to nothing`);
        }
      }
    }
  }
}

if (problems.length) {
  console.error('check-refs: broken internal references:');
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log(
  `check-refs: ok — ${practiceIds.size} practices, ${guideIds.size} guide sections, ${weeklyIds.size} weeklies, ${diveIds.size} dives, ${tags.size} tags.`
);
