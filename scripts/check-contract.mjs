#!/usr/bin/env node
// Validates the built machine endpoints (dist/*.json) against the shared
// field contract the MCP server consumes (mcp/contract.mjs). Runs as part of
// `npm run build`, so a field rename on either side fails the build here
// instead of silently breaking MCP retrieval in production.

import { readFileSync } from 'node:fs';
import { CONTRACT, validateEndpoint } from '../mcp/contract.mjs';

const problems = [];
for (const path of Object.keys(CONTRACT)) {
  let data;
  try {
    data = JSON.parse(readFileSync(`dist${path}`, 'utf8'));
  } catch (e) {
    problems.push(`${path}: unreadable in dist/ (${e.message})`);
    continue;
  }
  problems.push(...validateEndpoint(path, data));
}

if (problems.length) {
  console.error('check-contract: the machine endpoints violate mcp/contract.mjs:');
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log(`check-contract: ${Object.keys(CONTRACT).length} endpoints conform to the MCP contract.`);
