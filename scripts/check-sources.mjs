#!/usr/bin/env node
// Source-liveness gate. Extracts URLs from changed content files (frontmatter
// `url:` fields and markdown links) and checks each resolves. Definitively
// dead links (404/410/DNS failure) fail the run; transient or ambiguous
// statuses (403/429/5xx/timeouts — usually bot-blocking) only warn, so the
// pipeline doesn't flake on flaky hosts.
//
// Usage:
//   node scripts/check-sources.mjs --changed   # changed files only (default)
//   node scripts/check-sources.mjs --all       # every content file
//
// "Changed" means uncommitted working-tree changes (the writer workflows run
// this before committing); with a clean tree it falls back to HEAD~1..HEAD
// (CI on push/PR-merge commits). If neither yields files, it exits 0.

import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';

const CONTENT_PATHS = ['src/content', 'signals'];
const TIMEOUT_MS = 10_000;
const CONCURRENCY = 8;
const UA =
  'Mozilla/5.0 (compatible; claude-code-guide-linkcheck/1.0; +https://albertogrande.github.io/claude-code/)';

function sh(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

function changedFiles() {
  // Uncommitted changes first (writer workflows run pre-commit).
  const dirty = sh(`git status --porcelain -- ${CONTENT_PATHS.join(' ')}`)
    .split('\n')
    .filter(Boolean)
    .map((l) => l.slice(3).trim())
    // A rename line is "old -> new"; keep the new path.
    .map((p) => (p.includes(' -> ') ? p.split(' -> ')[1] : p));
  if (dirty.length) return dirty;
  // Clean tree: the last commit's changes (CI on push / PR merge commits).
  return sh(`git diff --name-only HEAD~1..HEAD -- ${CONTENT_PATHS.join(' ')}`)
    .split('\n')
    .filter(Boolean);
}

function allFiles() {
  return sh(`git ls-files -- ${CONTENT_PATHS.map((p) => p + '/**/*.md').join(' ')}`)
    .split('\n')
    .filter(Boolean);
}

function extractUrls(text) {
  const urls = new Set();
  // frontmatter/source lists: url: https://…
  for (const m of text.matchAll(/\burl:\s*(https?:\/\/\S+)/g)) urls.add(m[1]);
  // markdown links: [label](https://…)
  for (const m of text.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)) urls.add(m[1]);
  // bare links in signals one-liners
  for (const m of text.matchAll(/(?<![("\]])\bhttps?:\/\/[^\s)"'<>\]]+/g)) urls.add(m[0]);
  return [...urls].map((u) => u.replace(/[).,;:!?'"]+$/, ''));
}

async function check(url) {
  for (const method of ['HEAD', 'GET']) {
    try {
      const res = await fetch(url, {
        method,
        redirect: 'follow',
        headers: { 'user-agent': UA, accept: '*/*' },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (res.ok) return { url, verdict: 'ok', detail: `${res.status}` };
      if (res.status === 404 || res.status === 410)
        return { url, verdict: 'dead', detail: `${res.status}` };
      if (res.status === 405 && method === 'HEAD') continue; // retry as GET
      return { url, verdict: 'warn', detail: `${res.status}` };
    } catch (err) {
      const code = err?.cause?.code ?? err?.name ?? 'error';
      if (code === 'ENOTFOUND' || code === 'EAI_AGAIN')
        return { url, verdict: 'dead', detail: String(code) };
      if (method === 'GET') return { url, verdict: 'warn', detail: String(code) };
    }
  }
  return { url, verdict: 'warn', detail: 'unreachable' };
}

const mode = process.argv.includes('--all') ? 'all' : 'changed';
const files = (mode === 'all' ? allFiles() : changedFiles()).filter(
  (f) => f.endsWith('.md') && existsSync(f)
);

if (!files.length) {
  console.log(`check-sources: no ${mode === 'all' ? '' : 'changed '}content files — nothing to check.`);
  process.exit(0);
}

const urlToFiles = new Map();
for (const f of files) {
  for (const u of extractUrls(readFileSync(f, 'utf8'))) {
    if (!urlToFiles.has(u)) urlToFiles.set(u, []);
    urlToFiles.get(u).push(f);
  }
}

const urls = [...urlToFiles.keys()];
console.log(`check-sources: ${urls.length} unique URLs across ${files.length} file(s).`);

const results = [];
for (let i = 0; i < urls.length; i += CONCURRENCY) {
  results.push(...(await Promise.all(urls.slice(i, i + CONCURRENCY).map(check))));
}

let dead = 0;
for (const r of results) {
  if (r.verdict === 'ok') continue;
  const where = urlToFiles.get(r.url).join(', ');
  if (r.verdict === 'dead') {
    dead++;
    console.error(`DEAD (${r.detail}) ${r.url}\n  in: ${where}`);
  } else {
    console.warn(`warn (${r.detail}) ${r.url}\n  in: ${where}`);
  }
}

if (dead) {
  console.error(`\ncheck-sources: ${dead} dead link(s). Fix or remove them before publishing.`);
  process.exit(1);
}
console.log('check-sources: no dead links.');
