---
title: Set per-server MCP timeouts for slow tools
when: An MCP server does long-running calls (a heavy search, a build, a remote job) and they die at ~60 seconds in fresh sessions.
do: Set request_timeout_ms for that server in .mcp.json (or --mcp-config). Since 2.1.206 the setting is actually honored — before, fresh sessions silently fell back to the 60s default.
why: The failure looks like a flaky remote server but is a client-side default; one config line makes the timeout intentional instead of accidental.
section: 04-skills-plugins-mcp-hooks
tags: [mcp]
since: "2.1.206"
verify: Configure request_timeout_ms above 60000 for a slow server and confirm a long call survives in a brand-new session.
updated: 2026-07-10
sources:
  - label: Claude Code changelog
    url: https://code.claude.com/docs/en/changelog
---

If long MCP calls still time out after 2.1.206, the limit you set is now real — raise it in config, not by retrying.
