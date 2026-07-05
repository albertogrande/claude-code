import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { SITE_NAME, SITE_TAGLINE } from '../lib/site';

// One RSS feed across signals and articles, newest first.
export async function GET(context: APIContext) {
  const site = context.site?.toString().replace(/\/$/, '') ?? '';
  const base = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '');
  const abs = (p: string) => `${site}${base}${p}`;

  const signals = (await getCollection('signals')).map((e) => ({
    title: e.data.title,
    date: e.data.date,
    summary: e.data.summary,
    link: abs(`/signals/${e.id}`),
  }));
  const articles = (await getCollection('articles')).map((e) => ({
    title: e.data.title,
    date: e.data.date,
    summary: e.data.summary,
    link: abs(`/articles/${e.id}`),
  }));

  const items = [...signals, ...articles]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 40);

  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${esc(SITE_NAME)}</title>
    <link>${abs('/')}</link>
    <description>${esc(SITE_TAGLINE)}</description>
    <language>en</language>
    ${items
      .map(
        (i) => `<item>
      <title>${esc(i.title)}</title>
      <link>${i.link}</link>
      <guid>${i.link}</guid>
      <pubDate>${i.date.toUTCString()}</pubDate>
      <description>${esc(i.summary)}</description>
    </item>`
      )
      .join('\n    ')}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
