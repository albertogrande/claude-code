---
title: The state of Claude Code, mid-2026
date: 2026-07-04
kind: note
summary: A snapshot of where Claude Code stands — the model lineup, the effort ladder, the permission modes, and the shift to a desktop-and-mobile command center.
take: The single highest-leverage habit isn't a prompt trick — it's moving the model and effort dials per task instead of leaving them parked. Everything else compounds from there.
tags: [models, modes, apps, snapshot]
related:
  - label: 'Guide — start here'
    href: /guide/00-start-here
  - label: 'Guide — models & effort'
    href: /guide/01-models-and-effort
sources:
  - label: 'Claude Code docs — model configuration'
    url: 'https://code.claude.com/docs/en/model-config'
  - label: 'Build with Claude — effort'
    url: 'https://platform.claude.com/docs/en/build-with-claude/effort'
  - label: 'Claude Code docs — desktop app'
    url: 'https://code.claude.com/docs/en/desktop'
---

This is the inaugural radar entry — a baseline for everything that follows. Where does Claude Code actually stand in mid-2026?

## Models

Four production models, each with a job. **Opus 4.8** (`claude-opus-4-8`) is the heavy-lifting coder; **Sonnet 5** (`claude-sonnet-5`) is the balanced daily driver and the default on most subscription tiers; **Haiku 4.5** is the fast, cheap workhorse for mechanical and high-volume work; and **Fable 5** (`claude-fable-5`) is the frontier model for the hardest problems and long autonomous runs. Opus, Sonnet, and Fable all carry a 1M-token context window.

## Effort and speed

A `low → medium → high → xhigh → max` effort ladder now sits alongside the model picker, with `high` as the default. Two keywords are worth memorizing: `ultrathink` for a one-turn reasoning boost, and `ultracode` to opt a task into multi-agent orchestration. **Fast mode** (`/fast`) runs Opus at higher output speed — same model, quicker stream, premium price.

## Modes

Permission is a dial, cycled with `Shift+Tab`: **default** (ask everything), **accept-edits**, **plan** (read-only, propose-first), **auto** (a background safety classifier guards autonomous runs), and **bypass** (sandboxes only). Plan mode remains the single highest-leverage habit.

## The surface shift

The biggest change isn't any one feature — it's that Claude Code has become a **desktop-and-mobile command center**. The macOS app is a spatial workspace with parallel worktree-isolated sessions, diff and preview panes, and auto-verification. **Remote Control** lets you steer a running Mac session from your phone; **Dispatch** sends tasks the other way; **Routines** run scheduled agents in the cloud while your laptop is closed. One conversation flows across all three.

The [guide](/claude-code/guide) covers each of these in depth. This radar will track what changes from here.
