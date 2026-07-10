// Vercel serverless entrypoint. vercel.json pins this file to @vercel/node and
// routes every path here; req.url keeps the original path, so handleRequest
// does its own routing (POST /mcp → MCP, GET / → health) exactly as it does
// under Docker / plain Node.
import { handleRequest } from '../lib.js';

export default handleRequest;
