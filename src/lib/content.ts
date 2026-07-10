// Shared collection queries — the one place that knows how each collection is
// ordered. Pages and machine endpoints import these instead of re-writing the
// sort inline (the inline copies had lost the id tiebreak).

import { getCollection, type CollectionEntry } from 'astro:content';

type Dated = { id: string; data: { date: Date } };

// Newest first; id (filename) breaks same-day ties deterministically.
export const entryByDateDesc = (a: Dated, b: Dated) =>
  b.data.date.getTime() - a.data.date.getTime() || b.id.localeCompare(a.id);

export const getGuideSorted = async () =>
  (await getCollection('guide')).sort((a, b) => a.data.order - b.data.order);

export const getWeeklySorted = async () =>
  (await getCollection('weekly')).sort(entryByDateDesc);

export const getDivesSorted = async () =>
  (await getCollection('deep-dives')).sort(entryByDateDesc);

export const getPracticesSorted = async () =>
  (await getCollection('practices')).sort(
    (a, b) => a.data.section.localeCompare(b.data.section) || a.id.localeCompare(b.id)
  );

export type TaggedEntry =
  | { kind: 'weekly'; entry: CollectionEntry<'weekly'> }
  | { kind: 'deep-dive'; entry: CollectionEntry<'deep-dives'> }
  | { kind: 'practice'; entry: CollectionEntry<'practices'> };

// tag -> everything carrying it, across the three tagged collections.
export async function collectByTag(): Promise<Map<string, TaggedEntry[]>> {
  const [weekly, dives, practices] = await Promise.all([
    getWeeklySorted(),
    getDivesSorted(),
    getPracticesSorted(),
  ]);
  const map = new Map<string, TaggedEntry[]>();
  const add = (tag: string, item: TaggedEntry) => {
    if (!map.has(tag)) map.set(tag, []);
    map.get(tag)!.push(item);
  };
  for (const entry of weekly) for (const t of entry.data.tags) add(t, { kind: 'weekly', entry });
  for (const entry of dives) for (const t of entry.data.tags) add(t, { kind: 'deep-dive', entry });
  for (const entry of practices) for (const t of entry.data.tags) add(t, { kind: 'practice', entry });
  return map;
}
