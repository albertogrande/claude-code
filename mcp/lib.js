// The guide MCP server logic — data layer, tools, and a plain Node http server.
// No side effects on import (server.js is the entrypoint that listens). Reads
// the site's machine endpoints, so responses are current within the cache TTL
// (default 5 min) plus whatever the Pages CDN adds.

import { createServer } from 'node:http';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import { validateEndpoint } from './contract.mjs';

// ── Data layer ──────────────────────────────────────────────────────────────

const BASE = (process.env.GUIDE_BASE_URL || 'https://albertogrande.github.io/claude-code').replace(/\/$/, '');
const TTL_MS = Number(process.env.GUIDE_CACHE_TTL_MS || 5 * 60 * 1000);
const FETCH_TIMEOUT_MS = Number(process.env.GUIDE_FETCH_TIMEOUT_MS || 8000);
const cache = new Map(); // path -> { at, data } — kept past TTL for stale-on-error
const inflight = new Map(); // path -> Promise — dedupes concurrent cold fetches

export function baseUrl() {
  return BASE;
}

async function fetchFresh(path) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Fetch ${url} failed: ${res.status} ${res.statusText}`);
  const data = await res.json();
  const problems = validateEndpoint(path, data);
  if (problems.length) throw new Error(`Contract violation from ${url}: ${problems.slice(0, 3).join('; ')}`);
  cache.set(path, { at: Date.now(), data });
  return data;
}

async function getJson(path) {
  const hit = cache.get(path);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.data;
  let pending = inflight.get(path);
  if (!pending) {
    pending = fetchFresh(path).finally(() => inflight.delete(path));
    inflight.set(path, pending);
  }
  try {
    return await pending;
  } catch (e) {
    // Stale-on-error: an expired-but-present copy beats failing every tool
    // for the duration of an upstream blip.
    if (hit) return hit.data;
    throw e;
  }
}

const getPractices = async () => (await getJson('/practices.json')).practices || [];
const getSections = async () => (await getJson('/guide.json')).sections || [];
const getWeekly = async () => (await getJson('/weekly.json')).issues || [];

// OR-with-ranking: a practice scores for every term it matches, so a multi-term
// query still surfaces the closest practices instead of requiring all to hit one.
// Stopwords and short tokens are dropped first — the 2026-07-10 eval showed they
// let off-topic queries ("center a div with css") match the whole corpus.
const STOPWORDS = new Set([
  'a', 'an', 'the', 'i', 'im', 'my', 'me', 'we', 'our', 'you', 'your', 'it', 'its',
  'is', 'are', 'was', 'be', 'been', 'do', 'does', 'did', 'to', 'of', 'in', 'on',
  'at', 'by', 'for', 'with', 'and', 'or', 'not', 'no', 'this', 'that', 'these',
  'those', 'as', 'so', 'if', 'then', 'than', 'too', 'can', 'could', 'should',
  'would', 'will', 'just', 'about', 'how', 'what', 'which', 'when', 'where',
  'why', 'who', 'use', 'using', 'after', 'before',
  // Spanish (the corpus is English; ES terms match via SYNONYMS below)
  'que', 'qué', 'para', 'una', 'uno', 'unos', 'unas', 'los', 'las', 'del',
  'con', 'por', 'como', 'cómo', 'mis', 'tus', 'sus', 'son', 'este', 'esta',
  'estos', 'estas', 'más', 'muy', 'hay', 'ser', 'estar', 'hacer', 'cuál',
  'cuáles', 'cuándo', 'dónde', 'debo', 'puedo',
]);

// ES → EN bridge: the corpus is English but the reader often thinks in
// Spanish. Each query term also matches through its translations.
const SYNONYMS = {
  modelo: ['model'], modelos: ['models'],
  permiso: ['permission'], permisos: ['permissions'],
  modo: ['mode'], modos: ['modes'],
  desatendida: ['unattended'], desatendido: ['unattended'],
  ejecución: ['run'], ejecucion: ['run'], ejecutar: ['run'],
  tarea: ['task'], tareas: ['tasks'], larga: ['long'], largo: ['long'],
  contexto: ['context'], memoria: ['memory'], sesión: ['session'], sesion: ['session'],
  limpiar: ['clear'], limpio: ['clean', 'fresh'], limpia: ['clean', 'fresh'],
  revisar: ['review'], revisión: ['review'], revision: ['review'], revisor: ['reviewer'],
  código: ['code'], codigo: ['code'],
  coste: ['cost', 'spend'], costo: ['cost', 'spend'], gasto: ['spend'],
  presupuesto: ['budget'], barato: ['cheap'],
  flujo: ['workflow'], flujos: ['workflows'],
  agente: ['agent'], agentes: ['agents'], subagente: ['subagent'], subagentes: ['subagents'],
  nocturna: ['overnight'], nocturno: ['overnight'], noche: ['overnight'],
  pregunta: ['question'], preguntas: ['questions'],
  compartir: ['share'], salida: ['output'], atajo: ['shortcut'],
  fallo: ['fail'], falla: ['fail'], fallida: ['failed'], fallido: ['failed'],
  corrección: ['correction'], correccion: ['correction'], corregir: ['correct'],
  novedades: ['new'], nuevo: ['new'], nueva: ['new'],
  herramienta: ['tool'], herramientas: ['tools'], equipo: ['team'], equipos: ['teams'],
  búsqueda: ['search'], busqueda: ['search'], buscar: ['search'], delegar: ['delegate'],
};

// A term matches through itself, its translations, and a light stem
// ("correcting" → "correct" ⊂ "correction"; "stalls" → "stall").
function variantsOf(term) {
  const v = new Set([term, ...(SYNONYMS[term] || [])]);
  for (const t of [...v]) {
    if (t.length < 5) continue;
    if (t.endsWith('ing')) v.add(t.slice(0, -3));
    else if (t.endsWith('ed') || t.endsWith('es')) v.add(t.slice(0, -2));
    else if (t.endsWith('s')) v.add(t.slice(0, -1));
  }
  return [...v].filter((t) => t.length >= 3 || SHORT_TERMS.has(t));
}

// since/verify are indexed too — the corpus's measured edge is versioned
// facts, so a version string or a verify command must be findable.
// Lowercased once per practice per fetch — scoring reuses the cached form.
const fieldCache = new WeakMap();
function fieldsOf(p) {
  let f = fieldCache.get(p);
  if (!f) {
    f = [
      [p.title, 5],
      [p.tags?.join(' '), 4],
      [p.when, 3],
      [p.do, 3],
      [p.why, 2],
      [p.note, 2],
      [p.since, 2],
      [p.verify, 2],
      [p.section, 1],
    ]
      .filter(([t]) => t)
      .map(([t, w]) => [t.toLowerCase(), w]);
    fieldCache.set(p, f);
  }
  return f;
}

// Real 2-letter technical terms that the min-length filter would otherwise
// silently drop.
const SHORT_TERMS = new Set(['ci', 'gh', 'md', 'js', 'ts', 'ui', 'db', 'os']);

function queryTermVariants(query) {
  return (query || '')
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter((t) => (t.length >= 3 || SHORT_TERMS.has(t)) && !STOPWORDS.has(t))
    .map(variantsOf);
}

// Corpus-frequency boost per term: rare terms distinguish practices,
// ubiquitous ones ("run", "session") don't. Bounded to [0.6, 1.6] so it
// re-ranks without overriding the field-weight base score — the relevance
// filter thresholds on the unboosted score, keeping its meaning stable as
// the corpus grows.
function idfFromDf(df, n) {
  if (!df) return 1;
  const norm = (Math.log(1 + n / df) / Math.log(1 + n)) * 1.6;
  return Math.min(1.6, Math.max(0.6, norm));
}

// One matching pass over the corpus serves both document frequencies and
// scores. Per practice: termScores[i] = field-weight sum for term i, and
// `substantive` = some term matched a real content field (weight ≥ 2) —
// section-name-only hits, even across several terms, are noise.
function scoreCorpus(corpus, termVars) {
  const scored = new Map();
  for (const p of corpus) {
    const fields = fieldsOf(p);
    let substantive = false;
    const termScores = termVars.map((vars) => {
      let s = 0;
      for (const [t, weight] of fields) {
        if (vars.some((v) => t.includes(v))) {
          s += weight;
          if (weight >= 2) substantive = true;
        }
      }
      return s;
    });
    scored.set(p, { termScores, substantive });
  }
  const idfs = termVars.map((_, i) => {
    let df = 0;
    for (const { termScores } of scored.values()) if (termScores[i] > 0) df++;
    return idfFromDf(df, corpus.length);
  });
  return { scored, idfs };
}

function formatPractice(p) {
  const src = (p.sources || []).map((s) => `${s.label} (${s.url})`).join('; ');
  return [
    `### ${p.title}`,
    `- When: ${p.when}`,
    `- Do: ${p.do}`,
    `- Why: ${p.why}`,
    p.since ? `- Since: Claude Code ${p.since} (a versioned fact — cite it)` : null,
    p.verify ? `- Verify: ${p.verify}` : null,
    p.note ? `- Note: ${p.note}` : null,
    `- Section: ${p.section}${p.section_url ? ` (${p.section_url})` : ''}`,
    src ? `- Sources: ${src}` : null,
  ]
    .filter(Boolean)
    .join('\n');
}

// ── MCP server ──────────────────────────────────────────────────────────────

const text = (s) => ({ content: [{ type: 'text', text: s }] });
const fail = (s) => ({ content: [{ type: 'text', text: s }], isError: true });

export function buildMcpServer() {
  const server = new McpServer({ name: 'claude-code-guide', version: '1.0.0' });

  server.registerTool(
    'search_practices',
    {
      title: 'Search Claude Code best-practices',
      description:
        'Search the field guide for atomic best-practices ("when X, do Y, because Z") on using Claude Code — models/effort, permission modes, context, subagents/workflows, the apps. Use before deciding a model or effort level, a permission mode, a big context operation, or a workflow shape.',
      inputSchema: {
        query: z.string().optional().describe('What you are trying to decide or do, e.g. "long unattended run model" or "bound workflow spend". Omit to browse by tag alone.'),
        tags: z.array(z.string()).optional().describe('Optional tag filter, e.g. ["models"] or ["workflow"]. An unknown tag returns the valid vocabulary.'),
      },
    },
    async ({ query, tags }) => {
      try {
        const all = await getPractices();
        const vocab = [...new Set(all.flatMap((p) => p.tags || []))].sort();
        let practices = all;
        if (tags?.length) {
          const want = tags.map((t) => t.toLowerCase());
          const unknown = want.filter((t) => !vocab.some((v) => v.toLowerCase() === t));
          if (unknown.length) {
            return text(`Unknown tag${unknown.length > 1 ? 's' : ''} ${unknown.join(', ')}. Valid tags: ${vocab.join(', ')}.`);
          }
          practices = all.filter((p) => (p.tags || []).some((t) => want.includes(t.toLowerCase())));
        }

        const termVars = queryTermVariants(query || '');
        if (!termVars.length) {
          // A query that reduced to nothing (all stopwords/too short) is not
          // a browse request — say so instead of dumping the tag set.
          if ((query || '').trim()) {
            return text(`The query "${query}" is all stopwords or too-short terms — nothing usable to match on. Try more specific words, or browse with tags alone. Valid tags: ${vocab.join(', ')}.`);
          }
          // Tag-only browse: the filter already narrowed the set. Capped so a
          // broad tag can't dump the whole corpus into the caller's context.
          if (tags?.length) {
            const CAP = 10;
            if (!practices.length) return text(`No practices tagged ${tags.join(', ')}.`);
            const shown = practices.slice(0, CAP);
            const more = practices.length - shown.length;
            return text(
              shown.map(formatPractice).join('\n\n') +
                (more > 0 ? `\n\n(${more} more tagged ${tags.join(', ')} — add a query to narrow.)` : '')
            );
          }
          return text(`Pass a query, a tag filter, or both. Valid tags: ${vocab.join(', ')}.`);
        }

        // One pass over the full corpus (not the tag-filtered subset) yields
        // both scores and stable IDF statistics.
        const { scored, idfs } = scoreCorpus(all, termVars);
        // Base score ≥ 2 with at least one substantive-field match — a lone
        // section-name hit (or several of them across terms) is noise. Top 5
        // keeps a noisy query from dumping the whole corpus into the caller's
        // context.
        const ranked = practices
          .map((p) => {
            const { termScores, substantive } = scored.get(p);
            const base = termScores.reduce((a, b) => a + b, 0);
            const weighted = termScores.reduce((a, b, i) => a + b * idfs[i], 0);
            return { p, base, weighted, substantive };
          })
          .filter((x) => x.base >= 2 && x.substantive)
          .sort((a, b) => b.weighted - a.weighted)
          .slice(0, 5)
          .map((x) => x.p);
        if (!ranked.length) return text(`No practices matched "${query}"${tags?.length ? ` with tags ${tags.join(', ')}` : ''}. Try list_practices to see everything.`);
        return text(ranked.map(formatPractice).join('\n\n'));
      } catch (e) {
        return fail(`Could not reach the guide at ${BASE}: ${e.message}`);
      }
    }
  );

  server.registerTool(
    'list_practices',
    {
      title: 'List all best-practices',
      description: 'List every best-practice in the guide, compact. Good for a quick scan of what guidance exists.',
      inputSchema: {},
    },
    async () => {
      try {
        const practices = await getPractices();
        return text(practices.map((p) => `- [${p.section}] ${p.title} — when ${p.when}`).join('\n') || 'No practices published yet.');
      } catch (e) {
        return fail(`Could not reach the guide at ${BASE}: ${e.message}`);
      }
    }
  );

  server.registerTool(
    'list_guide_sections',
    {
      title: 'List guide sections',
      description: 'List the evergreen guide sections (id, title, summary, last-updated). Use to find which section to read in full with get_guide_section.',
      inputSchema: {},
    },
    async () => {
      try {
        const sections = await getSections();
        return text(sections.map((s) => `- ${s.id} — ${s.title} (updated ${s.updated})\n  ${s.summary}`).join('\n') || 'No guide sections published yet.');
      } catch (e) {
        return fail(`Could not reach the guide at ${BASE}: ${e.message}`);
      }
    }
  );

  server.registerTool(
    'get_guide_section',
    {
      title: 'Read a guide section in full',
      description: 'Return the full markdown of one evergreen guide section. Pass its id (e.g. "01-models-and-effort") or a substring of it.',
      inputSchema: {
        id: z.string().describe('The section id or a substring, e.g. "context" or "03-context-and-memory".'),
      },
    },
    async ({ id }) => {
      try {
        const sections = await getSections();
        const q = id.toLowerCase();
        const match =
          sections.find((s) => s.id.toLowerCase() === q) ||
          sections.find((s) => s.id.toLowerCase().includes(q)) ||
          sections.find((s) => s.title.toLowerCase().includes(q));
        if (!match) return fail(`No section matched "${id}". Use list_guide_sections to see the ids.`);
        return text(`# ${match.title}\n*Section ${match.id} · updated ${match.updated} · ${match.url}*\n\n${match.body}`);
      } catch (e) {
        return fail(`Could not reach the guide at ${BASE}: ${e.message}`);
      }
    }
  );

  server.registerTool(
    'whats_new',
    {
      title: "What's new in Claude Code",
      description: "Return the latest weekly digest(s) and the most recently updated guide sections — a quick way to catch up on what changed. Use at the start of a session or when the user asks what's new.",
      inputSchema: {
        limit: z.number().int().min(1).max(8).optional().describe('How many recent weekly digests to include (default 2).'),
      },
    },
    async ({ limit }) => {
      try {
        const [issues, sections] = await Promise.all([getWeekly(), getSections()]);
        const weeklyPart = issues.length
          ? issues.slice(0, limit ?? 2).map((w) => `## ${w.title}\n*${w.week} · ${w.date} · ${w.url}*\n\n${w.summary}`).join('\n\n')
          : 'No weekly digests yet.';
        const recent = [...sections]
          .sort((a, b) => (b.updated > a.updated ? 1 : b.updated < a.updated ? -1 : 0))
          .slice(0, 5)
          .map((s) => `- ${s.id} — ${s.title} (updated ${s.updated})`)
          .join('\n');
        return text(`# The Week\n\n${weeklyPart}\n\n# Recently updated guide sections\n\n${recent}`);
      } catch (e) {
        return fail(`Could not reach the guide at ${BASE}: ${e.message}`);
      }
    }
  );

  return server;
}

// ── HTTP server ─────────────────────────────────────────────────────────────

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type, accept, authorization, mcp-session-id, mcp-protocol-version');
  res.setHeader('Access-Control-Expose-Headers', 'mcp-session-id');
}

// Stateless: a fresh server + transport per request.
async function dispatch(req, res, body) {
  const server = buildMcpServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on('close', () => {
    transport.close();
    server.close();
  });
  await server.connect(transport);
  await transport.handleRequest(req, res, body);
}

// Handles one request: POST /mcp (MCP), GET / (health). Plain (req, res)
// signature so it works both as an http.Server listener (server.js, Docker,
// tests) and as a Vercel serverless function (api/mcp.js).
export async function handleRequest(req, res) {
  cors(res);
  const path = (req.url || '/').split('?')[0];

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (path === '/mcp' && req.method === 'POST') {
    try {
      // Vercel may pre-parse JSON into req.body; otherwise read the stream —
      // bounded, so the self-hosted path can't be OOMed by a huge body.
      const MAX_BODY = 1024 * 1024;
      let body = req.body;
      if (body === undefined) {
        const chunks = [];
        let size = 0;
        for await (const c of req) {
          size += c.length;
          if (size > MAX_BODY) {
            res.writeHead(413, { 'content-type': 'application/json' });
            res.end(JSON.stringify({ jsonrpc: '2.0', error: { code: -32600, message: 'Request body too large' }, id: null }));
            return;
          }
          chunks.push(c);
        }
        body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : undefined;
      } else if (typeof body === 'string') {
        body = body ? JSON.parse(body) : undefined;
      }
      await dispatch(req, res, body);
    } catch (e) {
      if (!res.headersSent) {
        res.writeHead(500, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ jsonrpc: '2.0', error: { code: -32603, message: String(e?.message || e) }, id: null }));
      }
    }
    return;
  }

  // This server is stateless and doesn't offer a server-initiated SSE stream,
  // so a non-POST /mcp gets the spec's 405 rather than masquerading as health.
  if (path === '/mcp') {
    res.writeHead(405, { 'content-type': 'application/json', allow: 'POST, OPTIONS' });
    res.end(JSON.stringify({ jsonrpc: '2.0', error: { code: -32000, message: 'Method not allowed — POST JSON-RPC to /mcp' }, id: null }));
    return;
  }

  if (path === '/' || path === '/health') {
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ ok: true, service: 'claude-code-guide-mcp', guide: BASE, endpoint: '/mcp' }));
    return;
  }

  res.writeHead(404, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ error: 'not found' }));
}

// Returns a Node http server over handleRequest. Used by the standalone
// entrypoint (server.js — Docker / any Node host) and by the tests.
export function createHttpServer() {
  return createServer(handleRequest);
}
