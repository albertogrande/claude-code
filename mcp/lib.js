// The guide MCP server logic — data layer, tools, and a plain Node http server.
// No side effects on import (server.js is the entrypoint that listens). Reads
// the live machine endpoints so it is always as current as the guide.

import { createServer } from 'node:http';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';

// ── Data layer ──────────────────────────────────────────────────────────────

const BASE = (process.env.GUIDE_BASE_URL || 'https://albertogrande.github.io/claude-code').replace(/\/$/, '');
const TTL_MS = Number(process.env.GUIDE_CACHE_TTL_MS || 5 * 60 * 1000);
const cache = new Map(); // path -> { at, data }

export function baseUrl() {
  return BASE;
}

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
  return [...v].filter((t) => t.length >= 3);
}

function scorePractice(p, query) {
  const q = query.toLowerCase().trim();
  if (!q) return 1;
  const terms = q.split(/\s+/).filter((t) => t.length >= 3 && !STOPWORDS.has(t));
  if (!terms.length) return 0;
  const fields = [
    [p.title, 5],
    [p.tags?.join(' '), 4],
    [p.when, 3],
    [p.do, 3],
    [p.why, 2],
    [p.note, 2],
    [p.section, 1],
  ];
  let score = 0;
  for (const term of terms) {
    const vars = variantsOf(term);
    for (const [textVal, weight] of fields) {
      const t = textVal && textVal.toLowerCase();
      if (t && vars.some((v) => t.includes(v))) score += weight;
    }
  }
  return score;
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
        query: z.string().describe('What you are trying to decide or do, e.g. "long unattended run model" or "bound workflow spend".'),
        tags: z.array(z.string()).optional().describe('Optional tag filter, e.g. ["models"] or ["workflow"].'),
      },
    },
    async ({ query, tags }) => {
      try {
        let practices = await getPractices();
        if (tags?.length) {
          const want = tags.map((t) => t.toLowerCase());
          practices = practices.filter((p) => (p.tags || []).some((t) => want.includes(t.toLowerCase())));
        }
        // Score ≥ 2 = at least a title/tags/when/do/why match; a lone section-name
        // hit (weight 1) is noise. Top 5 keeps a noisy query from dumping the
        // whole corpus into the caller's context.
        const ranked = practices
          .map((p) => ({ p, s: scorePractice(p, query) }))
          .filter((x) => x.s >= 2)
          .sort((a, b) => b.s - a.s)
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
      // Vercel may pre-parse JSON into req.body; otherwise read the stream.
      let body = req.body;
      if (body === undefined) {
        const chunks = [];
        for await (const c of req) chunks.push(c);
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

  if (path === '/' || path === '/health' || path === '/mcp') {
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
