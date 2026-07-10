# Agent access — the guide as a product for agents

**Goal.** Make this field guide consumable not just by humans reading the site,
but by **Claude Code sessions in the owner's own projects** — so that when
deciding a model/effort, a permission mode, a context operation, or a workflow
shape, a session can consult the current state-of-the-art guidance instead of
guessing. The guide already stays current (scout + weekly); this exposes that
current knowledge to working agents.

**Scope (v1).** Personal — just the owner. No multi-tenant/public product yet.
Same repo (`claude-code`). Full model: a **remote MCP server**, because the
owner works mostly in the macOS/iOS apps where a remote MCP connector works and
a local stdio server does not.

## The reframe

For an agent, the unit of value is not the essay — it's the **retrievable
practice**: an atomic *"when X → do Y (because Z, source W)"*. So the work is
80% structuring the content for retrieval and 20% the transport (MCP). The prose
guide stays for humans; a parallel machine layer serves agents.

## Architecture — three layers

### Layer 1 — machine-readable guide (static, rides GitHub Pages)

Built from the existing content collections, no extra infra:

- **`practices/` collection** — atomic best-practices: `{ title, when, do, why,
  section, tags, sources, updated }`. This is what an agent actually wants. The
  scout/weekly maintain it alongside the guide.
- **Build-time endpoints:**
  - `/llms.txt` — curated index (the [llms.txt](https://llmstxt.org) standard).
  - `/llms-full.txt` — the whole guide + practices as plain markdown.
  - `/practices.json` — the practices, structured.
  - `/guide.json` — guide sections with raw markdown body.
  - `/weekly.json` — recent weekly digests (for "what changed lately").

These deploy automatically with the site. Any agent tool can already fetch them.

### Layer 2 — the remote MCP server (`mcp/`)

A small server that reads the Layer-1 endpoints from the **live site** (so it's
always current and stateless) and exposes tools:

- `search_practices({ query, tags? })` — the primary tool.
- `list_practices()` — everything, compact.
- `get_guide_section({ id })` — one section's markdown.
- `list_guide_sections()` — the index.
- `whats_new()` — latest weekly digest(s) + recently-updated sections.

Built on the official `@modelcontextprotocol/sdk` with **Streamable HTTP**
transport, so it runs locally (testable) and deploys to any Node-capable host.
The core (fetch guide → tool handlers) is a host-agnostic module; the transport
is a thin wrapper.

**Hosting.** A remote server needs a host (GitHub Pages is static-only). Chosen
host: **Vercel** — the stateless server maps onto a serverless function
(`mcp/api/mcp.js` + `mcp/vercel.json`), Vercel's GitHub integration redeploys on
every push, and it's free. The one manual step the owner does: import the repo
in Vercel with Root Directory `mcp`. Any Node/container host (the `Dockerfile`)
is the always-warm alternative — same code.

### Layer 3 — the "when to consult" logic (a Claude Code plugin)

The MCP is data; something has to tell a session *when* to use it. A small
**plugin** bundles the MCP connection + a skill whose instructions fire at the
right moments: at session start, and before choosing model/effort, a permission
mode, a big context operation, or a workflow shape → query the guide. Installed
once at user scope (`~/.claude`), it applies across all the owner's projects.

## Build order

1. **Layer 1** — practices collection + endpoints. Ships live via Pages. ✅ fully autonomous.
2. **Layer 2** — MCP server, tested locally against the live endpoints. Deploy needs the owner's host secret (one step).
3. **Layer 3** — the plugin/skill + connection instructions.

## Honest constraints

- The MCP **needs hosting** — the only step that needs the owner's account. Everything else is autonomous.
- The model **only consults the guide if told when** — Layer 3 is not optional.
- Keeping the server **stateless over the live endpoints** means always-latest with zero cache-invalidation work; the cost is a fetch per cold start (cheap, cacheable).
- Prompt-injection surface is negligible while the content is the owner's own; revisit if this ever goes public.
