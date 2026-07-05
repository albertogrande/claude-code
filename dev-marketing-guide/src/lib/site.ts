// Small shared helpers: base-path prefixing (GitHub Pages serves under
// /dev-marketing-guide) and UTC-stable date formatting.

export const SITE_NAME = 'dev/market';
export const SITE_TAGLINE = 'The state of the art in developer marketing, kept current.';

const RAW_BASE = import.meta.env.BASE_URL ?? '/';
const BASE = RAW_BASE.replace(/\/$/, ''); // "/dev-marketing-guide"

export function withBase(p: string): string {
  return `${BASE}${p.startsWith('/') ? '' : '/'}${p}`;
}

const fmt = (d: Date, opts: Intl.DateTimeFormatOptions) =>
  d.toLocaleDateString('en-GB', { timeZone: 'UTC', ...opts });

export const fmtLong = (d: Date) =>
  fmt(d, { day: 'numeric', month: 'long', year: 'numeric' }); // 5 July 2026
export const fmtMed = (d: Date) =>
  fmt(d, { day: 'numeric', month: 'short', year: 'numeric' }); // 5 Jul 2026
export const fmtShort = (d: Date) =>
  fmt(d, { day: 'numeric', month: 'short' }); // 5 Jul

export const isoDate = (d: Date) => d.toISOString().slice(0, 10); // 2026-07-05

export function byDateDesc<T extends { data: { date: Date }; id: string }>(a: T, b: T) {
  const d = b.data.date.getTime() - a.data.date.getTime();
  return d !== 0 ? d : b.id.localeCompare(a.id);
}

export function byOrder<T extends { data: { order: number } }>(a: T, b: T) {
  return a.data.order - b.data.order;
}
