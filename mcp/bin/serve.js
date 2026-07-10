// Standalone Node entry (Docker / local / any always-warm host).
// Lives in bin/ (not src/index.js) so Vercel never treats it as the default
// source entrypoint — on Vercel only api/mcp.js is built.
import { createHttpServer } from '../src/server.js';
import { baseUrl } from '../src/data.js';

const port = Number(process.env.PORT || 8787);
const server = createHttpServer();
server.listen(port, () => {
  console.log(`claude-code-guide MCP listening on :${port}/mcp (guide: ${baseUrl()})`);
});
