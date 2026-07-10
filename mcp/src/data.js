// Data layer for the guide MCP server.
//
// Reads the live machine endpoints the Astro site publishes
// (/practices.json, /guide.json, /weekly.json) so the server is stateless and
// always current. A short in-memory cache avoids a fetch on every tool call.

const BASE = (process.env.GUIDE_BASE_URL || 'https://albertogrande.github.io/claude-code').replace(/\/$/, '');
const TTL_MS = Number(process.env.GUIDE_CACHE_TTL_MS || 5 * 60 * 1000);

const cache = new Map(); // path -> { at, data }

async function getJson(path) {
  const hit = cache.get(path);
  const now = Date.now();
  if (hit && now - hit.at < TTL_MS) return hit.data;
  const url = `${BASE}${path}`;
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`Fetch ${url} failed: ${res.status} ${res.statusText}`);
  const data = await res.json();
  cache.set(path, { at: now, data });
  return data;
}

export function baseUrl() {
  return BASE;
}

export async function getPractices() {
  const d = await getJson('/practices.json');
  return d.practices || [];
}

export async function getSections() {
  const d = await getJson('/guide.json');
  return d.sections || [];
}

export async function getWeekly() {
  const d = await getJson('/weekly.json');
  return d.issues || [];
}

// Case-insensitive term scoring over weighted fields. OR-with-ranking: a
// practice scores for every term it matches, so a multi-term query still
// surfaces the closest practices instead of requiring all terms to hit one.
export function scorePractice(p, query) {
  const q = query.toLowerCase().trim();
  if (!q) return 1;
  const terms = q.split(/\s+/).filter(Boolean);
  const fields = [
    [p.title, 5],
    [p.tags?.join(' '), 4],
    [p.when, 3],
    [p.do, 3],
    [p.why, 2],
    [p.section, 1],
  ];
  let score = 0;
  for (const term of terms) {
    for (const [text, weight] of fields) {
      if (text && text.toLowerCase().includes(term)) score += weight;
    }
  }
  return score; // 0 only if no term matched any field
}

export function formatPractice(p) {
  const src = (p.sources || []).map((s) => `${s.label} (${s.url})`).join('; ');
  return [
    `### ${p.title}`,
    `- When: ${p.when}`,
    `- Do: ${p.do}`,
    `- Why: ${p.why}`,
    `- Section: ${p.section}${p.section_url ? ` (${p.section_url})` : ''}`,
    src ? `- Sources: ${src}` : null,
  ]
    .filter(Boolean)
    .join('\n');
}
