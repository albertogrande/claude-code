// The field contract between the site's machine endpoints (src/pages/*.json.ts)
// and this MCP server. Both sides check it: lib.js validates every fetched
// payload, and the site build validates dist/ output (scripts/check-contract.mjs)
// — so a field rename fails loudly on whichever side ships first instead of
// silently breaking retrieval.
//
// Optional per-item fields (practices: note/since/verify/probe) are not listed;
// only fields a consumer relies on unconditionally are required.

export const CONTRACT = {
  '/practices.json': {
    listKey: 'practices',
    item: ['id', 'title', 'when', 'do', 'why', 'section', 'section_url', 'tags', 'sources', 'updated'],
  },
  '/guide.json': {
    listKey: 'sections',
    item: ['id', 'title', 'order', 'summary', 'updated', 'url', 'body'],
  },
  '/weekly.json': {
    listKey: 'issues',
    item: ['id', 'title', 'week', 'date', 'summary', 'tags', 'url', 'body'],
  },
};

// Returns a list of human-readable problems; empty means the payload conforms.
export function validateEndpoint(path, data) {
  const spec = CONTRACT[path];
  if (!spec) return [];
  const problems = [];
  const list = data?.[spec.listKey];
  if (!Array.isArray(list)) {
    return [`${path}: missing array "${spec.listKey}"`];
  }
  // Check every item — a single malformed entry (e.g. one practice written
  // without a field) should fail, not just a broken first item.
  list.forEach((item, i) => {
    for (const f of spec.item) {
      if (item?.[f] === undefined) problems.push(`${path}: item ${i} (${item?.id ?? '?'}) missing field "${f}"`);
    }
  });
  return problems;
}
