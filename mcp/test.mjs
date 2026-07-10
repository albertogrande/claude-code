// Hermetic end-to-end test: serve the built dist/ locally, point the MCP data
// layer at it, start the MCP server, and exercise every tool through the
// official MCP client. No network / no deploy required.
//
// Run from repo root after `npm run build`, or from mcp/ (it finds ../dist).

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { staticDistServer, listen } from './static-dist.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');

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
  const files = staticDistServer(DIST);
  const filesPort = await listen(files);
  process.env.GUIDE_BASE_URL = `http://127.0.0.1:${filesPort}`;
  process.env.GUIDE_CACHE_TTL_MS = '0';

  // sanity: the endpoints exist
  const pj = await (await fetch(`${process.env.GUIDE_BASE_URL}/practices.json`)).json();
  check('practices.json served', pj.count > 0, `count=${pj.count}`);

  // 2. MCP server (import AFTER env is set)
  const { createHttpServer } = await import('./lib.js');
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
  const fableTitle = pj.practices.find((p) => p.id === 'switch-to-fable-for-long-unattended-runs')?.title;
  check('search_practices ranks Fable practice first', !sp.isError && !!fableTitle && sp.text.startsWith(`### ${fableTitle}`), sp.text.slice(0, 80));

  // The filter must actually filter: every returned practice carries the tag,
  // and practices without it are absent. (The old assertion could not fail —
  // the "no match" message itself contained the word "workflow".)
  const tagged = pj.practices.filter((p) => (p.tags || []).includes('workflow'));
  const untagged = pj.practices.filter((p) => !(p.tags || []).includes('workflow'));
  const spTag = await call('search_practices', { tags: ['workflow'] });
  check(
    'tag-only browse returns exactly the tagged practices',
    !spTag.isError &&
      tagged.every((p) => spTag.text.includes(p.title)) &&
      untagged.every((p) => !spTag.text.includes(p.title)),
    `tagged=${tagged.length}`
  );

  const spBadTag = await call('search_practices', { query: 'model', tags: ['model'] });
  check('unknown tag returns the valid vocabulary', !spBadTag.isError && /Valid tags:/.test(spBadTag.text) && /models/.test(spBadTag.text));

  const spEmpty = await call('search_practices', {});
  check('empty search asks for query or tag', !spEmpty.isError && /Valid tags:/.test(spEmpty.text));

  const withSince = pj.practices.find((p) => p.since);
  if (withSince) {
    const spSince = await call('search_practices', { query: `${withSince.since} version` });
    check('since field is searchable', !spSince.isError && spSince.text.includes(withSince.title), `since=${withSince.since}`);
  }

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

  // Protocol surface: /mcp only speaks POST; health lives on / and /health.
  const getMcp = await fetch(`http://127.0.0.1:${mcpPort}/mcp`);
  check('GET /mcp returns 405', getMcp.status === 405, `status=${getMcp.status}`);
  const health = await (await fetch(`http://127.0.0.1:${mcpPort}/`)).json();
  check('health served on /', health.ok === true && health.endpoint === '/mcp');

  // Dead upstream with an empty cache → a clear tool error, not a hang.
  // (?deadUpstream re-evaluates lib.js so it reads the poisoned env and
  // starts with a fresh cache.)
  process.env.GUIDE_BASE_URL = 'http://127.0.0.1:9'; // discard port — nothing listens
  process.env.GUIDE_FETCH_TIMEOUT_MS = '2000';
  const { createHttpServer: deadServer } = await import('./lib.js?deadUpstream');
  const dead = deadServer();
  const deadPort = await listen(dead);
  const deadClient = new Client({ name: 'test-dead', version: '1.0.0' });
  await deadClient.connect(new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${deadPort}/mcp`)));
  const deadCall = await deadClient.callTool({ name: 'list_practices', arguments: {} });
  check('dead upstream returns isError', !!deadCall.isError && /Could not reach the guide/.test(deadCall.content?.[0]?.text || ''));
  await deadClient.close();
  dead.close();

  // Stale-on-error: kill the upstream after a successful fetch; TTL=0 forces
  // a refetch, which fails — the last-known-good copy must be served.
  files.closeAllConnections?.();
  await new Promise((r) => files.close(r));
  const spStale = await call('search_practices', { query: 'long unattended run model' });
  check('stale-on-error serves last-known-good corpus', !spStale.isError && /Fable/.test(spStale.text));

  await client.close();
  mcp.close();

  console.log(failures === 0 ? '\nAll MCP tests passed ✓' : `\n${failures} test(s) failed ✗`);
  process.exit(failures === 0 ? 0 : 1);
};

main().catch((e) => {
  console.error('test crashed:', e);
  process.exit(1);
});
