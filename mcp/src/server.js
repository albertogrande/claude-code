// The MCP server: registers the guide tools and serves them over Streamable
// HTTP (stateless — a fresh server+transport per request, which works both for
// a long-running Node process and for serverless hosts).

import { createServer } from 'node:http';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import {
  getPractices,
  getSections,
  getWeekly,
  scorePractice,
  formatPractice,
  baseUrl,
} from './data.js';

const text = (s) => ({ content: [{ type: 'text', text: s }] });
const fail = (s) => ({ content: [{ type: 'text', text: s }], isError: true });

export function buildMcpServer() {
  const server = new McpServer({
    name: 'claude-code-guide',
    version: '1.0.0',
  });

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
        const ranked = practices
          .map((p) => ({ p, s: scorePractice(p, query) }))
          .filter((x) => x.s > 0)
          .sort((a, b) => b.s - a.s)
          .slice(0, 8)
          .map((x) => x.p);
        if (!ranked.length) return text(`No practices matched "${query}"${tags?.length ? ` with tags ${tags.join(', ')}` : ''}. Try list_practices to see everything.`);
        return text(ranked.map(formatPractice).join('\n\n'));
      } catch (e) {
        return fail(`Could not reach the guide at ${baseUrl()}: ${e.message}`);
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
        const body = practices
          .map((p) => `- [${p.section}] ${p.title} — when ${p.when}`)
          .join('\n');
        return text(body || 'No practices published yet.');
      } catch (e) {
        return fail(`Could not reach the guide at ${baseUrl()}: ${e.message}`);
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
        const body = sections
          .map((s) => `- ${s.id} — ${s.title} (updated ${s.updated})\n  ${s.summary}`)
          .join('\n');
        return text(body || 'No guide sections published yet.');
      } catch (e) {
        return fail(`Could not reach the guide at ${baseUrl()}: ${e.message}`);
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
        return fail(`Could not reach the guide at ${baseUrl()}: ${e.message}`);
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
        const n = limit ?? 2;
        const weeklyPart = issues.length
          ? issues
              .slice(0, n)
              .map((w) => `## ${w.title}\n*${w.week} · ${w.date} · ${w.url}*\n\n${w.summary}`)
              .join('\n\n')
          : 'No weekly digests yet.';
        const recent = [...sections]
          .sort((a, b) => (b.updated > a.updated ? 1 : b.updated < a.updated ? -1 : 0))
          .slice(0, 5)
          .map((s) => `- ${s.id} — ${s.title} (updated ${s.updated})`)
          .join('\n');
        return text(`# The Week\n\n${weeklyPart}\n\n# Recently updated guide sections\n\n${recent}`);
      } catch (e) {
        return fail(`Could not reach the guide at ${baseUrl()}: ${e.message}`);
      }
    }
  );

  return server;
}

// Stateless Streamable HTTP handler: build a fresh server + transport per POST.
async function handleMcp(req, res) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  let body;
  try {
    body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : undefined;
  } catch {
    res.writeHead(400, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ jsonrpc: '2.0', error: { code: -32700, message: 'Parse error' }, id: null }));
    return;
  }
  const server = buildMcpServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on('close', () => {
    transport.close();
    server.close();
  });
  await server.connect(transport);
  await transport.handleRequest(req, res, body);
}

export function createHttpServer() {
  return createServer(async (req, res) => {
    const path = (req.url || '/').split('?')[0];
    if (path === '/mcp' && req.method === 'POST') {
      try {
        await handleMcp(req, res);
      } catch (e) {
        if (!res.headersSent) {
          res.writeHead(500, { 'content-type': 'application/json' });
          res.end(JSON.stringify({ jsonrpc: '2.0', error: { code: -32603, message: String(e?.message || e) }, id: null }));
        }
      }
      return;
    }
    if (path === '/health' || path === '/') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ ok: true, service: 'claude-code-guide-mcp', guide: baseUrl(), endpoint: '/mcp' }));
      return;
    }
    res.writeHead(404, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'not found' }));
  });
}
