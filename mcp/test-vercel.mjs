// Test the Vercel serverless adapter (api/mcp.js) under a harness that mimics
// Vercel's contract: JSON body pre-parsed into req.body, then handler(req,res).
// Proves the exact code path Vercel runs, without the Vercel CLI or a deploy.

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');
const CT = { '.json': 'application/json', '.txt': 'text/plain', '.html': 'text/html' };

function staticServer() {
  return createServer(async (req, res) => {
    try {
      const p = decodeURIComponent((req.url || '/').split('?')[0]);
      const buf = await readFile(join(DIST, p));
      res.writeHead(200, { 'content-type': CT[extname(p)] || 'application/octet-stream' });
      res.end(buf);
    } catch {
      res.writeHead(404);
      res.end('not found');
    }
  });
}

const listen = (srv) => new Promise((r) => srv.listen(0, '127.0.0.1', () => r(srv.address().port)));

let failures = 0;
const check = (name, cond, detail = '') => {
  if (cond) console.log(`  ok  ${name}`);
  else { failures++; console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ''}`); }
};

const main = async () => {
  const files = staticServer();
  const filesPort = await listen(files);
  process.env.GUIDE_BASE_URL = `http://127.0.0.1:${filesPort}`;
  process.env.GUIDE_CACHE_TTL_MS = '0';

  // Import the Vercel handler AFTER env is set.
  const { default: handler } = await import('./api/mcp.js');

  // Harness that mimics Vercel: parse a JSON body, attach as req.body, dispatch.
  const vercelLike = createServer(async (req, res) => {
    if (req.method === 'POST' || req.method === 'GET') {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      const raw = Buffer.concat(chunks).toString();
      if (raw && (req.headers['content-type'] || '').includes('application/json')) {
        try { req.body = JSON.parse(raw); } catch { req.body = undefined; }
      }
    }
    await handler(req, res);
  });
  const port = await listen(vercelLike);

  // Health (GET) works through the rewrite target.
  const health = await (await fetch(`http://127.0.0.1:${port}/api/mcp`)).json();
  check('GET health ok', health.ok === true && health.endpoint === '/mcp');

  // MCP client over the adapter.
  const { Client } = await import('@modelcontextprotocol/sdk/client/index.js');
  const { StreamableHTTPClientTransport } = await import('@modelcontextprotocol/sdk/client/streamableHttp.js');
  const client = new Client({ name: 'test', version: '1.0.0' });
  await client.connect(new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${port}/api/mcp`)));

  const { tools } = await client.listTools();
  check('5 tools via adapter', tools.length === 5, tools.map((t) => t.name).join(','));

  const call = async (name, args = {}) => {
    const r = await client.callTool({ name, arguments: args });
    return { text: r.content?.map((c) => c.text).join('\n') || '', isError: !!r.isError };
  };

  const sp = await call('search_practices', { query: 'bound workflow spend unattended' });
  check('search_practices works via adapter', !sp.isError && /workflow|Fable|cap/i.test(sp.text));

  const wn = await call('whats_new');
  check('whats_new works via adapter', !wn.isError && /The Week/.test(wn.text));

  await client.close();
  vercelLike.close();
  files.close();

  console.log(failures === 0 ? '\nVercel adapter tests passed ✓' : `\n${failures} test(s) failed ✗`);
  process.exit(failures === 0 ? 0 : 1);
};

main().catch((e) => {
  console.error('test crashed:', e);
  process.exit(1);
});
