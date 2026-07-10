// Retrieval + latency + cost eval for the guide MCP, run against a live
// deployment (default: production). Deterministic — no LLM calls. Measures:
//   1. Retrieval: hit@1 / hit@3 per category for queries.json
//   2. Off-topic precision: how much noise a non-guide query returns
//   3. Latency: health + repeated search calls (first call may be cold)
//   4. Cost: response size (chars ≈ tokens*4) per tool
// Gate: in-domain (direct+paraphrase) hit@3 must be ≥ 0.80 or exit 1, so this
// doubles as a regression test when the search or corpus changes.
//
// Usage: node eval/run-evals.mjs   (or npm run eval, from mcp/)
//   MCP_URL=https://claude-code-mcp.vercel.app/mcp  override target

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const MCP_URL = process.env.MCP_URL || 'https://claude-code-mcp.vercel.app/mcp';
const GUIDE = (process.env.GUIDE_BASE_URL || 'https://albertogrande.github.io/claude-code').replace(/\/$/, '');
const __dirname = dirname(fileURLToPath(import.meta.url));

let rpcId = 0;
async function callTool(name, args = {}) {
  const t0 = performance.now();
  const res = await fetch(MCP_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
    body: JSON.stringify({ jsonrpc: '2.0', id: ++rpcId, method: 'tools/call', params: { name, arguments: args } }),
  });
  const raw = await res.text();
  const ms = Math.round(performance.now() - t0);
  // Streamable HTTP answers either SSE ("data: {...}") or plain JSON.
  const dataLine = raw.split('\n').find((l) => l.startsWith('data: '));
  const payload = JSON.parse(dataLine ? dataLine.slice(6) : raw);
  const text = payload.result?.content?.map((c) => c.text).join('\n') ?? '';
  return { text, ms, chars: text.length, isError: !!payload.result?.isError || !!payload.error };
}

const returnedTitles = (text) => [...text.matchAll(/^### (.+)$/gm)].map((m) => m[1]);
const tokens = (chars) => Math.round(chars / 4); // rough heuristic
const pct = (n, d) => (d ? `${Math.round((n / d) * 100)}%` : 'n/a');

const main = async () => {
  console.log(`# Guide MCP eval — ${new Date().toISOString().slice(0, 10)}\n`);
  console.log(`Target: ${MCP_URL}\nCorpus: ${GUIDE}\n`);

  // Corpus: id -> title, for grading.
  const practices = (await (await fetch(`${GUIDE}/practices.json`)).json()).practices;
  const titleOf = Object.fromEntries(practices.map((p) => [p.id, p.title]));
  console.log(`Practices in corpus: ${practices.length}\n`);

  // ── 1+2. Retrieval ─────────────────────────────────────────────────────────
  const { queries } = JSON.parse(await readFile(join(__dirname, 'queries.json'), 'utf8'));
  const rows = [];
  for (const q of queries) {
    const r = await callTool('search_practices', { query: q.query });
    const titles = returnedTitles(r.text);
    const none = /^No practices matched/.test(r.text);
    const rank = q.expected ? titles.indexOf(titleOf[q.expected]) + 1 : 0; // 0 = not returned
    rows.push({ ...q, titles, none, rank, ms: r.ms, chars: r.chars });
    const mark = q.expected ? (rank === 1 ? 'hit@1' : rank > 0 && rank <= 3 ? `hit@3 (rank ${rank})` : rank > 0 ? `rank ${rank}` : 'MISS') : none ? 'clean (no results)' : `NOISE: ${titles.length} results`;
    console.log(`  [${q.category}] "${q.query}" → ${mark} (${r.ms}ms, ~${tokens(r.chars)} tok)`);
  }

  console.log('\n## Retrieval summary\n');
  const cats = [...new Set(queries.map((q) => q.category))];
  for (const c of cats) {
    const rs = rows.filter((r) => r.category === c);
    if (c === 'offtopic') {
      const clean = rs.filter((r) => r.none).length;
      const noise = rs.filter((r) => !r.none).map((r) => r.titles.length);
      console.log(`- offtopic: ${clean}/${rs.length} return "no match" cleanly; noisy ones returned ${noise.join(', ') || '-'} practices each`);
    } else {
      const h1 = rs.filter((r) => r.rank === 1).length;
      const h3 = rs.filter((r) => r.rank >= 1 && r.rank <= 3).length;
      console.log(`- ${c}: hit@1 ${h1}/${rs.length} (${pct(h1, rs.length)}), hit@3 ${h3}/${rs.length} (${pct(h3, rs.length)})`);
    }
  }

  // ── 3. Latency ─────────────────────────────────────────────────────────────
  console.log('\n## Latency (search_practices ×5, after the runs above — warm)\n');
  const lat = [];
  for (let i = 0; i < 5; i++) lat.push((await callTool('search_practices', { query: 'long unattended run model' })).ms);
  lat.sort((a, b) => a - b);
  console.log(`- min ${lat[0]}ms · median ${lat[2]}ms · max ${lat[4]}ms`);

  // ── 4. Cost per tool ───────────────────────────────────────────────────────
  console.log('\n## Response cost per tool (chars → ~tokens into your context)\n');
  const probes = [
    ['search_practices', { query: 'long unattended run model' }],
    ['list_practices', {}],
    ['list_guide_sections', {}],
    ['get_guide_section', { id: '01-models-and-effort' }],
    ['whats_new', {}],
  ];
  for (const [name, args] of probes) {
    const r = await callTool(name, args);
    console.log(`- ${name}: ${r.chars} chars ≈ ${tokens(r.chars)} tokens (${r.ms}ms)`);
  }

  // ── Gates ──────────────────────────────────────────────────────────────────
  // Three gated properties, so a regression in any of them ships red:
  //  1. in-domain recall (direct+paraphrase hit@3 ≥ 80%)
  //  2. off-topic precision — the whole point of the stopword/threshold work:
  //     ≥ 60% of off-topic queries return "no match", and none dumps > 2
  //     practices of confident noise
  //  3. Spanish recall (hit@3 ≥ 66%) — the ES→EN synonym bridge
  const gates = [];

  const gated = rows.filter((r) => r.category === 'direct' || r.category === 'paraphrase');
  const h3 = gated.filter((r) => r.rank >= 1 && r.rank <= 3).length;
  gates.push([`in-domain hit@3 = ${h3}/${gated.length} (threshold 80%)`, gated.length === 0 || h3 / gated.length >= 0.8]);

  const off = rows.filter((r) => r.category === 'offtopic');
  if (off.length) {
    const clean = off.filter((r) => r.none).length;
    const maxNoise = Math.max(0, ...off.filter((r) => !r.none).map((r) => r.titles.length));
    gates.push([`offtopic clean = ${clean}/${off.length} (threshold 60%)`, clean / off.length >= 0.6]);
    gates.push([`offtopic max noise = ${maxNoise} practices (threshold ≤ 2)`, maxNoise <= 2]);
  }

  const es = rows.filter((r) => r.category === 'spanish');
  if (es.length) {
    const esH3 = es.filter((r) => r.rank >= 1 && r.rank <= 3).length;
    gates.push([`spanish hit@3 = ${esH3}/${es.length} (threshold 66%)`, esH3 / es.length >= 0.66]);
  }

  console.log('');
  let ok = true;
  for (const [label, pass] of gates) {
    console.log(`GATE ${label} → ${pass ? 'PASS ✓' : 'FAIL ✗'}`);
    if (!pass) ok = false;
  }
  process.exit(ok ? 0 : 1);
};

main().catch((e) => {
  console.error('eval crashed:', e);
  process.exit(1);
});
