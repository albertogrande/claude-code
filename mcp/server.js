// Entrypoint. Vercel detects this as the Node server to run (it listens on the
// injected PORT); the same file runs under Docker / any Node host. All logic is
// in lib.js.
import { createHttpServer, baseUrl } from './lib.js';

const port = Number(process.env.PORT || 8787);
createHttpServer().listen(port, () => {
  console.log(`claude-code-guide MCP listening on :${port}/mcp (guide: ${baseUrl()})`);
});
