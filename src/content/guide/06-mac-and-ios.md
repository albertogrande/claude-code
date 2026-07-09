---
title: 'Your Mac & iOS command center'
order: 6
summary: The desktop app as a workspace, the phone as a remote, the cloud as an overnight worker — and the one continuous thread that flows across all three.
updated: 2026-07-08
---

Claude Code is no longer terminal-first. The desktop app is a spatial workspace; your phone is a remote control; the cloud runs jobs while you sleep. The feature that ties it together is that **one conversation flows across all three surfaces**.

## The desktop app is a workspace, not a terminal

The **Code** tab gives you draggable panes — chat, a file-by-file **diff viewer**, an embedded **preview** browser, a terminal, a plan pane, a tasks pane. Wire a few affordances into muscle memory:

- **Parallel sessions** — spin up several local sessions in the sidebar, each auto-isolated in its own worktree; split-view two side by side. Each carries its own model and permission mode. Opening or switching background sessions used to stall 15–20 seconds on macOS from a false low-memory detection (a 2.1.196 regression); fixed as of 2.1.203.
- **Diff & review** — click the +/− stats for a full diff; drop inline comments on lines and submit them as a batch; let Claude auto-review its own diff before you look.
- **Preview + auto-verify** — the preview pane runs your dev server; Claude can screenshot its own UI, click through it, and fix what's off, closing the visual loop without you.
- **Model & mode at hand** — the picker and permission mode sit by the composer; swap mid-session. A usage ring shows context and plan headroom.
- **Artifacts** — ask for a page instead of a wall of terminal text ("build a dashboard artifact of last week's deploy failures"); Claude publishes a live, self-contained page to a private claude.ai URL that updates as the session continues, and `Ctrl+]` reopens the latest one. Available on Pro and Max now, not just Team/Enterprise — on those two it's private to you, no sharing control.

## The three surfaces, and how work moves between them

**Desktop → phone: Remote Control.** Start a session on your Mac, keep it running, then steer it from the Claude iOS app or any browser. Same filesystem, same MCP servers, one synced thread.

**Phone → desktop: Dispatch.** Message a task from your phone; your awake desktop spawns a Code session to do the work locally, and pushes you a notification when it's done or needs a call.

**Cloud, unattended: Routines.** Scheduled Claude Code sessions that run on Anthropic's infrastructure — on a cron, a webhook, or GitHub events — even with your laptop closed. Backlog grooming, alert triage, nightly review.

## The async loop

This is the workflow the apps are built for:

> Kick off a long job on the Mac in **Auto** mode → close the lid → get a **push notification** on your phone when it needs a decision or finishes → open the session on your phone, steer or approve → walk back to the Mac and it's all one continuous thread.

Enable pushes in `/config`. As of 2.1.200, a question Claude asks mid-run (`AskUserQuestion`) waits for your real answer by default instead of auto-continuing on a timeout — so the notification you get really is the decision point, not a race against a clock you can't see. Opt back into an idle timeout via `/config` only for jobs scoped tightly enough that a guessed default is harmless.

## Reality check

The phone is a remote and a monitor, not a primary dev machine — it can't do local edits the way the Mac can, and Remote Control needs the desktop process alive. Several of these surfaces — computer use, trusted-device biometrics, the agent-monitoring view — are research previews and keep shifting, so treat specifics as a moving target and check the in-app state. [The week](/claude-code/weekly) tracks the changes as they land.
