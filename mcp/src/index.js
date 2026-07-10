// Entry point: start the guide MCP server on $PORT (default 8787).
import { createHttpServer } from './server.js';
import { baseUrl } from './data.js';

const port = Number(process.env.PORT || 8787);
const server = createHttpServer();
server.listen(port, () => {
  console.log(`claude-code-guide MCP listening on :${port}/mcp (guide: ${baseUrl()})`);
});
