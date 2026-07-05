# Source registry

The sweep list for the scout, grouped by how to read them. Keep this file
current: when a source goes quiet or a new one earns a slot, edit it here —
the skills read this file instead of hard-coding URLs.

Everything must be public and fetchable without a login. No X/Twitter.

## Core referents — pure developer marketing

| Source | What it's good for | Where |
| --- | --- | --- |
| Jakub "Kuba" Czakon — Markepear | The sharpest pure dev-marketing writing; teardown-driven | https://www.markepear.dev/ · blog index at /blog · examples at /examples |
| Lee Robinson | DX-led marketing; ex-Vercel VP, now VP Developer Experience at Cursor (re-verify title) | https://leerob.com/ |
| Adam Frankl | *The Developer Facing Startup*; ex-Neo4j/JFrog/Sourcegraph | https://developerfacingstartup.dev/ |
| Martín "Gonto" Gontovnikas | ex-Auth0 VP Marketing; Hypergrowth Partners; *code to market* podcast | https://codetomarket.fm/ · https://www.hypergrowthpartners.com/ |

## Regulars

- **Draft.dev blog** (Karl Hughes) — technical content marketing: https://draft.dev/learn
- **Developer Marketing Alliance** (Ronak Ganatra) — community + `awesome-developer-marketing`: https://github.com/ronakganatra/awesome-developer-marketing
- **Scaling DevTools** (Jack Bridger) — podcast, strong guest analysis: https://scalingdevtools.com/
- **DevTools Brew** (Morgan Perry) — GTM/growth newsletter.
- **FletchPMM** — positioning/messaging for PLG and devtools: https://www.fletchpmm.com/
- **reo.dev blog** — developer-marketing resource roundups: https://www.reo.dev/blog
- **jackbridger/developer-newsletters** — directory of dev newsletters: https://github.com/jackbridger/developer-newsletters

## Specialists (check when the topic matches)

Zach Goldie (messaging), Nick Moore (content), Flo Merian (launches),
Emily Omier and Nevo David (open source), Itamar Ben Yair (growth) — most are
findable from Markepear's agency/specialist roundups.

## Community & discussion — fetchable endpoints

- Hacker News (Algolia API): `https://hn.algolia.com/api/v1/search_by_date?query=<q>&tags=story`
  Useful queries: `developer marketing`, `devrel`, `devtools launch`, plus the
  name of any company in this week's news.
- Reddit public JSON: `https://www.reddit.com/r/devrel/new.json?limit=25`,
  r/SaaS and r/startups searched for devtools GTM threads.
- Lobsters: `https://lobste.rs/search?q=<q>&what=stories&order=newest`
- Bluesky public search: `https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=<q>&sort=latest`

## Broad sweep

A WebSearch for `"developer marketing" OR "DevRel"` items from the last few
days, and launch-day checks on major DevTools vendors when something big
ships. Company engineering/marketing blogs count as primary sources for their
own launches.

## Standing cautions

- The claim that neptune.ai was acquired by OpenAI is **unverified** — do not
  repeat it without a primary source.
- Titles rot: re-verify roles before printing them (see STANDARDS.md, gate 3).
