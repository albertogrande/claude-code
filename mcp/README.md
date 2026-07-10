# Guide MCP server

A remote [MCP](https://modelcontextprotocol.io) server that exposes this field
guide to your own Claude Code sessions, so an agent can consult the current
state of the art instead of guessing. Stateless — it reads the live site's
machine endpoints (`/practices.json`, `/guide.json`, `/weekly.json`), so it is
always as current as the guide.

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

### Recommended: Vercel (serverless, push-to-deploy)

The stateless server maps cleanly onto a Vercel function — `api/mcp.js` is the
adapter, `vercel.json` rewrites `/mcp` → `/api/mcp`. Three clicks:

1. Vercel → **Add New… → Project** → import the `albertogrande/claude-code` repo.
2. Set **Root Directory = `mcp`**. Leave the framework as "Other"; no build
   command needed. Deploy.
3. Every push to `main` redeploys automatically (Vercel's GitHub integration).

Your MCP endpoint is then `https://<project>.vercel.app/mcp`.

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

Once it's live at `https://<your-host>/mcp`:

**CLI**

```bash
# user scope → available in every project
claude mcp add --scope user --transport http claude-code-guide https://<your-host>/mcp
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
