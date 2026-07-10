// Hermetic end-to-end test: serve the built dist/ locally, point the MCP data
// layer at it, start the MCP server, and exercise every tool through the
// official MCP client. No network / no deploy required.
//
// Run from repo root after `npm run build`, or from mcp/ (it finds ../dist).

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
      const path = decodeURIComponent((req.url || '/').split('?')[0]);
      const file = join(DIST, path);
      const buf = await readFile(file);
      res.writeHead(200, { 'content-type': CT[extname(file)] || 'application/octet-stream' });
      res.end(buf);
    } catch {
      res.writeHead(404);
      res.end('not found');
    }
  });
}

const listen = (srv) => new Promise((r) => srv.listen(0, '127.0.0.1', () => r(srv.address().port)));

let failures = 0;
function check(name, cond, detail = '') {
  if (cond) console.log(`  ok  ${name}`);
  else {
    failures++;
    console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

const main = async () => {
  // 1. static server over dist/
  const files = staticServer();
  const filesPort = await listen(files);
  process.env.GUIDE_BASE_URL = `http://127.0.0.1:${filesPort}`;
  process.env.GUIDE_CACHE_TTL_MS = '0';

  // sanity: the endpoints exist
  const pj = await (await fetch(`${process.env.GUIDE_BASE_URL}/practices.json`)).json();
  check('practices.json served', pj.count > 0, `count=${pj.count}`);

  // 2. MCP server (import AFTER env is set)
  const { createHttpServer } = await import('./src/server.js');
  const mcp = createHttpServer();
  const mcpPort = await listen(mcp);

  // 3. MCP client over Streamable HTTP
  const { Client } = await import('@modelcontextprotocol/sdk/client/index.js');
  const { StreamableHTTPClientTransport } = await import('@modelcontextprotocol/sdk/client/streamableHttp.js');
  const client = new Client({ name: 'test', version: '1.0.0' });
  await client.connect(new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${mcpPort}/mcp`)));

  const { tools } = await client.listTools();
  const names = tools.map((t) => t.name).sort();
  check('5 tools registered', names.length === 5, names.join(','));
  check(
    'expected tool names',
    ['get_guide_section', 'list_guide_sections', 'list_practices', 'search_practices', 'whats_new'].every((n) => names.includes(n)),
    names.join(',')
  );

  const call = async (name, args = {}) => {
    const r = await client.callTool({ name, arguments: args });
    return { text: r.content?.map((c) => c.text).join('\n') || '', isError: !!r.isError };
  };

  const sp = await call('search_practices', { query: 'long unattended run model' });
  check('search_practices finds Fable', !sp.isError && /Fable/.test(sp.text));

  const spTag = await call('search_practices', { query: 'spend', tags: ['workflow'] });
  check('search_practices tag filter works', !spTag.isError && /workflow|spend|cap/i.test(spTag.text));

  const lp = await call('list_practices');
  check('list_practices returns items', !lp.isError && lp.text.split('\n').length >= 5);

  const ls = await call('list_guide_sections');
  check('list_guide_sections returns sections', !ls.isError && /01-models-and-effort/.test(ls.text));

  const gs = await call('get_guide_section', { id: 'context' });
  check('get_guide_section by substring', !gs.isError && /context/i.test(gs.text) && gs.text.length > 200);

  const gsMiss = await call('get_guide_section', { id: 'does-not-exist' });
  check('get_guide_section handles miss', gsMiss.isError);

  const wn = await call('whats_new');
  check('whats_new returns weekly + updates', !wn.isError && /The Week/.test(wn.text) && /Recently updated/.test(wn.text));

  await client.close();
  mcp.close();
  files.close();

  console.log(failures === 0 ? '\nAll MCP tests passed ✓' : `\n${failures} test(s) failed ✗`);
  process.exit(failures === 0 ? 0 : 1);
};

main().catch((e) => {
  console.error('test crashed:', e);
  process.exit(1);
});
