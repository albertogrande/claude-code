---
title: The permission mode you've been calling "default" is now "Manual"
date: 2026-07-04
kind: release
summary: Claude Code 2.1.200 renames the ask-before-every-action permission mode to "Manual" across the CLI, --help, VS Code, and JetBrains, and stops AskUserQuestion dialogs from auto-continuing on idle by default.
take: A cosmetic rename, but a useful one — "default" never described what the mode does, and "Manual" finally matches the mental model of a five-mode dial. The AskUserQuestion change matters more in practice, since silent auto-continues on a clarifying question were an easy way for an unattended session to run off with a wrong assumption.
tags: [modes, workflow]
related:
  - label: Guide — the permission dial
    href: /guide/02-permission-modes
sources:
  - label: Claude Code changelog — 2.1.200
    url: https://code.claude.com/docs/en/changelog
  - label: Choose a permission mode
    url: https://code.claude.com/docs/en/permission-modes
---

Version 2.1.200 (July 3, 2026) renames the mode that reviews every edit and command from an unlabeled "default" to **Manual** in the CLI, `claude --help`, the VS Code extension, and the JetBrains plugin. Nothing about its behavior changes — it's still read-only until you approve each action — but the config value and the CLI's own flag both still accept `default`, so nothing in `settings.json` or a hook needs to change: `--permission-mode manual` and `"defaultMode": "manual"` are simply accepted as aliases for `default`.

The same release also changes `AskUserQuestion` dialogs so they no longer auto-continue after an idle timeout by default — previously, a clarifying question Claude asked mid-session could silently resolve itself if you stepped away. You can opt back into the old idle-timeout behavior from `/config` if you relied on it for unattended runs.

Both changes ship alongside a long list of background-agent reliability fixes in the same version (stale daemon locks, stalled progress indicators after sleep/wake, rate-limited subagents returning empty results) — worth a skim if you run background sessions regularly.
