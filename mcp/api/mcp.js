// Vercel serverless adapter for the guide MCP server.
//
// Reuses the exact same buildMcpServer() as the Node server; only the transport
// plumbing differs. Stateless Streamable HTTP maps cleanly onto a serverless
// function: build a fresh server + transport per request.
//
// Deployed with Root Directory = `mcp`. The function is at /api/mcp; vercel.json
// rewrites /mcp -> /api/mcp so the connect URL is https://<host>/mcp.

import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { buildMcpServer } from '../src/server.js';
import { baseUrl } from '../src/data.js';

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'content-type, accept, authorization, mcp-session-id, mcp-protocol-version'
  );
  res.setHeader('Access-Control-Expose-Headers', 'mcp-session-id');
}

export default async function handler(req, res) {
  cors(res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method === 'GET') {
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ ok: true, service: 'claude-code-guide-mcp', guide: baseUrl(), endpoint: '/mcp' }));
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end('Method Not Allowed');
    return;
  }

  // Vercel parses JSON bodies into req.body. Fall back to reading the stream so
  // the same handler works under a plain Node harness (the test) too.
  let body = req.body;
  if (body === undefined) {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : undefined;
  } else if (typeof body === 'string') {
    body = body ? JSON.parse(body) : undefined;
  }

  const server = buildMcpServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on('close', () => {
    transport.close();
    server.close();
  });
  await server.connect(transport);
  await transport.handleRequest(req, res, body);
}
