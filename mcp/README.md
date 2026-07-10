# Guide MCP server

A remote [MCP](https://modelcontextprotocol.io) server that exposes this field
guide to your own Claude Code sessions, so an agent can consult the current
state of the art instead of guessing. Stateless — it reads the live site's
machine endpoints (`/practices.json`, `/guide.json`, `/weekly.json`), so it
tracks the guide with bounded staleness: up to the cache TTL (default 5 min,
`GUIDE_CACHE_TTL_MS`) plus the Pages CDN. Upstream fetches carry a timeout and
fall back to the last-known-good copy on error.

## Tools

| Tool | What it does |
|---|---|
| `search_practices({ query, tags? })` | Search atomic best-practices ("when X, do Y, because Z"). The primary tool. |
| `list_practices()` | List every practice, compact. |
| `list_guide_sections()` | List the evergreen sections (id, title, summary, updated). |
| `get_guide_section({ id })` | Read one section's full markdown. |
| `whats_new({ limit? })` | Latest weekly digest(s) + recently-updated sections. |

## Run locally

```bash
cd mcp
npm install
npm start          # listens on :8787/mcp, reads the live guide
npm test           # hermetic end-to-end test against a local build of dist/
```

Config via env:

- `PORT` — default `8787`.
- `GUIDE_BASE_URL` — default `https://albertogrande.github.io/claude-code`. Point at a fork/staging if needed.
- `GUIDE_CACHE_TTL_MS` — endpoint cache, default `300000` (5 min).

## Deploy (the one manual step)

The server needs a host with a public HTTPS URL (GitHub Pages is static-only, so
it can't run this).

### Recommended: Vercel (push-to-deploy)

`vercel.json` pins the build explicitly: `api/mcp.js` is deployed as a
`@vercel/node` serverless function and every path is routed to it (`POST /mcp`,
`GET /` health). The explicit `builds` config bypasses Vercel's framework /
Node-server auto-detection entirely — the auto-detected "Node server" build is
what kept failing (`Tsconfig not found`). Three clicks:

1. Vercel → **Add New… → Project** → import the `albertogrande/claude-code` repo.
2. Set **Root Directory = `mcp`**. Leave the framework as "Other"; no build
   command needed. Deploy.
3. Every push to `main` redeploys automatically (Vercel's GitHub integration).

The live production endpoint is `https://claude-code-mcp.vercel.app/mcp`.

Optional env (Project → Settings → Environment Variables): `GUIDE_BASE_URL`
(default `https://albertogrande.github.io/claude-code`), `GUIDE_CACHE_TTL_MS`.

### Alternative: any Node/container host (always-warm, no cold start)

```bash
docker build -t guide-mcp mcp/
docker run -p 8787:8787 guide-mcp
```

Put it behind HTTPS on Render / Railway / Fly.io / a VPS. Endpoint:
`https://<your-host>/mcp`. Same code as the Vercel path.

## Connect it to Claude Code

Live at `https://claude-code-mcp.vercel.app/mcp` (substitute your own host if
you deployed elsewhere):

**CLI**

```bash
# user scope → available in every project
claude mcp add --scope user --transport http claude-code-guide https://claude-code-mcp.vercel.app/mcp
```

**macOS / iOS apps** — Settings → Connectors → Add custom connector → paste the
`/mcp` URL. It then shows up in every session.

## Tell sessions when to use it (Layer 3)

An MCP is just data — Claude only consults it if told when. Two options:

1. **Skill (recommended):** copy `plugin/skills/consult-the-guide/` into
   `~/.claude/skills/`. It nudges Claude to query the guide before model/effort,
   permission-mode, context, or workflow decisions.
2. **Global rule:** add a line to `~/.claude/CLAUDE.md`:

   > Before deciding a model/effort level, a permission mode, a large context
   > operation, or a workflow shape, consult the `claude-code-guide` MCP
   > (`search_practices`, then `get_guide_section` if you need depth).

See `../docs/agent-access.md` for the full design.
