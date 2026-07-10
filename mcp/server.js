// Standalone entrypoint for Docker / any Node host: listens on PORT. All logic
// is in lib.js. Vercel does NOT use this file — it runs api/mcp.js as a
// serverless function (see vercel.json).
import { createHttpServer, baseUrl } from './lib.js';

const port = Number(process.env.PORT || 8787);
createHttpServer().listen(port, () => {
  console.log(`claude-code-guide MCP listening on :${port}/mcp (guide: ${baseUrl()})`);
});
