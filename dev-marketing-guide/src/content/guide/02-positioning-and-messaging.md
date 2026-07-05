---
title: Positioning and messaging
order: 2
summary: How to say what a devtool is so a skeptical developer keeps reading — features over adjectives, claims they can falsify, words to ban.
updated: 2026-07-05
sources:
  - label: Markepear (Jakub Czakon) — homepage teardowns and messaging work
    url: https://www.markepear.dev/
  - label: Adam Frankl — The Developer Facing Startup
    url: https://developerfacingstartup.dev/
  - label: Lee Robinson — Developer marketing (leerob.com)
    url: https://leerob.com/n/developer-marketing
  - label: Helen Min — Developer marketing in the age of AI (Oct 2025)
    url: https://www.helenmin.com/blog/developer-marketing-in-the-age-of-ai
changelog:
  - date: 2026-07-05
    note: Section seeded at launch.
---

Position a devtool as a concrete capability a developer can verify, not a
benefit they're asked to believe. Developer messaging fails in one specific
way — sounding like marketing — and every rule in this section is a defense
against that failure.

## Features over benefits, shown over told

Classic B2B messaging leads with outcomes ("ship faster", "reduce risk") and
holds the mechanism back for the demo. Developers invert this: the mechanism
*is* the message. Helen Min's enduring-principles list puts "features over
benefits" and "show, don't tell" at the top, and the strongest devtool
homepages follow it — real code above the fold, an honest quickstart, the
actual latency number. The benefit statement earns its place only after the
reader believes the mechanism.

## Make claims a developer can falsify

A claim that can't be tested reads as noise; a claim that could embarrass
you reads as information. "Deploys in under 90 seconds on the free tier" is
positioning; "blazing fast deploys" is filler. Frankl's book devotes a
chapter to words you should never use with developers — the empty
intensifiers of enterprise marketing ("seamless", "revolutionary",
"enterprise-grade") — and his broader point is structural, not stylistic:
developers treat unverifiable language as evidence that the product can't
speak for itself. Lee Robinson's writing standard is the same rule applied
to prose: cut buzzwords, verify every code sample and link, and resist
claiming a thing is "simple" when it isn't — the reader will find out within
the hour.

## Position against the real alternative

The developer's alternative is rarely your named competitor. It's a script
someone on the team already wrote, an open-source project with 20k stars, or
doing nothing. Czakon's homepage-teardown work at Markepear keeps landing on
this: messaging that assumes "choosing between vendors" when the developer is
actually deciding "is this worth replacing my duct tape" misses the actual
objection. State plainly what your tool does that the duct tape doesn't,
and what it costs to find out — in minutes, not in "contact us".

## One sentence, no dependencies

The whole position should survive being said in one sentence to a developer
with no context: what it is, who it's for, what it replaces. If the sentence
needs the category explained first, the positioning is doing the category's
work instead of the product's. This is also, increasingly, how your message
travels anyway: repeated secondhand in a Slack thread, a Reddit comment, or
an AI assistant's summary — environments that strip your design, your
social proof, and your nuance, and keep only the claim.
