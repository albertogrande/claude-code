// Standalone Node entry (Docker / local / any always-warm host).
// Lives in bin/ (not src/index.js) so Vercel never treats it as a source
// entrypoint — on Vercel only api/mcp.js is built. Shares all logic with the
// serverless function via api/mcp.js.
import { createHttpServer, baseUrl } from '../api/mcp.js';

const port = Number(process.env.PORT || 8787);
createHttpServer().listen(port, () => {
  console.log(`claude-code-guide MCP listening on :${port}/mcp (guide: ${baseUrl()})`);
});
