---
title: Split the writer from the reviewer
when: A session just built a feature or made a nontrivial change.
do: Run /code-review, or spin a fresh subagent that sees only the diff, to grade the work before you accept it.
why: A fresh context isn't biased toward code it just wrote, so it catches what the author missed. It's the cheapest way to raise the floor on autonomous output.
section: 07-workflows-that-compound
tags: [workflow, teams]
updated: 2026-07-09
sources:
  - label: Guide — Workflows that compound
    url: https://albertogrande.github.io/claude-code/guide/07-workflows-that-compound
---

Writer/reviewer separation is the single highest-leverage habit for unattended work.
