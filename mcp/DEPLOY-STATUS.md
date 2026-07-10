# MCP deploy status — handoff note

**State:** the MCP server works locally and against the live guide; the **Vercel
deploy is blocked** on a build-time module-resolution error. Picking up in a
later session.

## What works (verified)

- `npm start` → server listens on `:8787`, `GET /` health OK, `GET /mcp` 200.
- `npm test` → 10/10 end-to-end (5 tools, search/list/get/whats_new) against a
  local build of `dist/`.
- Data path verified against **live production** endpoints
  (`https://albertogrande.github.io/claude-code/practices.json` etc. are 200).
- Layers 1 (endpoints) and 3 (`plugin/skills/consult-the-guide`) are done and
  live. Only the Vercel hosting of Layer 2 is stuck.

## The Vercel blocker

Every Vercel build fails at **module resolution** with the same tell —
`Tsconfig not found` — regardless of structure. Error progression:

1. `main: src/index.js` → `Could not resolve './server.js' / './data.js' in src/index.js`.
2. Removed `main`, `.vercelignore`'d `src/index.js` → same, still built `src/index.js`.
3. Moved entry to `bin/serve.js` → error jumped to `src/server.js`: `Could not
   resolve 'zod' / '@modelcontextprotocol/sdk/server/mcp.js' / './data.js'`.
4. Consolidated into `api/mcp.js`, deleted `src/` → **`No entrypoint found`**
   (Vercel wants `server.js`/`index.js`/`main`, NOT the `api/` convention).
5. Current: `server.js` + `lib.js` → `Could not resolve './lib.js' in server.js`
   — a **sibling relative import** fails. `Tsconfig not found` again.

**Diagnosis:** Vercel is treating this as a **Node server** (not `api/`
serverless functions) and its builder bundles the entrypoint with a resolver
that can't resolve *any* import — relative or npm — and reports `Tsconfig not
found`. This is a builder/config problem, not our code (the exact graph runs
fine under plain `node` and in the tests).

## Next things to try (in order)

1. **Add a minimal `mcp/tsconfig.json`.** The literal error is "Tsconfig not
   found" — Vercel's bundler may require one even for JS. Cheapest first shot.
   Try `{ "compilerOptions": { "module": "NodeNext", "moduleResolution":
   "NodeNext", "target": "ES2022", "allowJs": true }, "include": ["*.js"] }`.
2. **Check Vercel Project Settings** (dashboard): Framework Preset should be
   "Other", Build Command empty, Output Directory empty. A stale preset/build
   command could be forcing the bundler. Consider deleting and re-importing the
   project fresh with Root Directory `mcp`.
3. **Try a `vercel.json`** pinning the build, e.g.
   `{ "builds": [{ "src": "server.js", "use": "@vercel/node" }] }`, or the
   functions form. (We removed the earlier rewrite-only vercel.json.)
4. **Try CommonJS** — drop `"type": "module"`, rename to `.cjs`, use `require`.
   Vercel's builder may handle CJS resolution more reliably than ESM here.
5. **Fallback that already works: don't use Vercel.** The `Dockerfile` is tested
   and builds a working image. Deploy it to **Render / Railway / Fly.io** (or a
   VPS) for an always-warm Node host — sidesteps Vercel's builder entirely. Given
   how hard Vercel is fighting, this may be the pragmatic answer.

## Current layout (mcp/)

- `server.js` — entrypoint: listens on `PORT`, imports `lib.js`.
- `lib.js` — data layer + `buildMcpServer()` + `createHttpServer()`.
- `test.mjs` — hermetic e2e (serves `../dist`, drives the MCP client).
- `Dockerfile` — working Node image (the fallback host path).
- `package.json` — `type: module`, `main: server.js`, deps: SDK + zod.
- `.vercelignore` — excludes `test.mjs`, `Dockerfile`, `README.md`.

## Once it deploys

- Connect: apps → Settings → Connectors → custom connector → `https://<host>/mcp`
  (or `claude mcp add --scope user --transport http claude-code-guide <url>/mcp`).
- Install `plugin/skills/consult-the-guide/` into `~/.claude/skills/`.
- Smoke test: `GET /mcp` health, then a real `search_practices` call.
