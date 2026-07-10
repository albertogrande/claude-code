// Hermetic eval for CI: serve the built ../dist as the corpus, start the MCP
// server against it, and run run-evals.mjs pointed at both — no network, no
// production dependency. Exit code = the eval's regression gate.
// Requires `npm run build` at the repo root first (same as test.mjs).

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', '..', 'dist');
const CT = { '.json': 'application/json', '.txt': 'text/plain', '.html': 'text/html' };

const files = createServer(async (req, res) => {
  try {
    const path = decodeURIComponent((req.url || '/').split('?')[0]);
    const buf = await readFile(join(DIST, path));
    res.writeHead(200, { 'content-type': CT[extname(path)] || 'application/octet-stream' });
    res.end(buf);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
});

const listen = (srv) => new Promise((r) => srv.listen(0, '127.0.0.1', () => r(srv.address().port)));

const filesPort = await listen(files);
process.env.GUIDE_BASE_URL = `http://127.0.0.1:${filesPort}`;
process.env.GUIDE_CACHE_TTL_MS = '0';

// Import AFTER env is set — lib.js reads GUIDE_BASE_URL at module load.
const { createHttpServer } = await import('../lib.js');
const mcp = createHttpServer();
const mcpPort = await listen(mcp);

const child = spawn(process.execPath, [join(__dirname, 'run-evals.mjs')], {
  stdio: 'inherit',
  env: { ...process.env, MCP_URL: `http://127.0.0.1:${mcpPort}/mcp` },
});
child.on('exit', (code) => {
  mcp.close();
  files.close();
  process.exit(code ?? 1);
});
