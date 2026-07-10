# MCP deploy status

**State:** FIXED — confirmed working on a Vercel preview deploy (2026-07-10).
Pending only: merge to `main` so Vercel promotes it to production (production
deploys only build from `main`). The MCP server itself was never the problem:
`npm test` is 10/10 locally and the data path works against the live guide.

## The fix

Every failed build shared one tell: Vercel's **auto-detected "Node server"
build** bundled the entrypoint with a resolver that couldn't resolve *any*
import (relative or npm) and reported `Tsconfig not found`. Instead of feeding
that detector yet another layout, the build is now pinned explicitly, which
**bypasses auto-detection altogether**:

- `vercel.json` — explicit `builds`: `api/mcp.js` via `@vercel/node`
  (serverless function, nft-traced deps, no bundler involved), plus a
  catch-all `routes` entry so `req.url` keeps the original path.
- `api/mcp.js` — serverless entrypoint; just re-exports `handleRequest`.
- `lib.js` — the http listener was extracted into `export handleRequest(req,
  res)`; `createHttpServer()` wraps it. Same code serves Docker/local and
  Vercel.
- `server.js` — unchanged role: standalone entrypoint for Docker / any Node
  host (Vercel no longer uses it; it's in `.vercelignore`).
- `tsconfig.json` — minimal JS-friendly config, belt-and-suspenders for the
  literal "Tsconfig not found" in case any detection still runs.

## How to verify

1. Vercel dashboard → the new deployment for this branch/commit should build
   green (Root Directory must still be `mcp`, framework "Other").
2. `curl https://<deployment>/` → `{"ok":true,...}` health JSON.
3. `curl -X POST https://<deployment>/mcp -H 'content-type: application/json' -H 'accept: application/json, text/event-stream' -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'`
   → the 5 tools.
4. Then merge to `main` for the production URL.

## If it is STILL red

1. Check Project Settings: Root Directory `mcp`, Framework Preset "Other",
   Build Command empty. If a stale setting persists, delete + re-import the
   project.
2. Fallback that already works: the tested `Dockerfile` on Render / Railway /
   Fly.io — always-warm Node host, sidesteps Vercel entirely.

## Once it deploys

- Connect: apps → Settings → Connectors → custom connector → `https://<host>/mcp`
  (or `claude mcp add --scope user --transport http claude-code-guide <url>/mcp`).
- Install `plugin/skills/consult-the-guide/` into `~/.claude/skills/`.
- Smoke test: `GET /` health, then a real `search_practices` call.

## History (first session, for reference)

The auto-detection error progression that motivated the pin: `main:
src/index.js` → could not resolve sibling imports; entry at `bin/serve.js` →
could not resolve `zod` / the MCP SDK either; `api/mcp.js` alone (no
`vercel.json`) → `No entrypoint found`; `server.js` + `lib.js` → could not
resolve `./lib.js`, `Tsconfig not found` every time. Diagnosis: the zero-config
Node-server builder resolves imports against the wrong root when Root
Directory is a subfolder — a builder problem, not a code problem.
