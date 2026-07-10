// Shared test/eval helper: serve a built dist/ directory over HTTP so the MCP
// data layer can be pointed at a local, hermetic corpus. Used by test.mjs and
// eval/ci.mjs — one copy, not two.

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const CT = { '.json': 'application/json', '.txt': 'text/plain', '.html': 'text/html' };

export function staticDistServer(dist) {
  return createServer(async (req, res) => {
    try {
      const path = decodeURIComponent((req.url || '/').split('?')[0]);
      const buf = await readFile(join(dist, path));
      res.writeHead(200, { 'content-type': CT[extname(path)] || 'application/octet-stream' });
      res.end(buf);
    } catch {
      res.writeHead(404);
      res.end('not found');
    }
  });
}

export const listen = (srv) => new Promise((r) => srv.listen(0, '127.0.0.1', () => r(srv.address().port)));
