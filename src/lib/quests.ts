import type { CollectionEntry } from 'astro:content';

export type Quest = CollectionEntry<'quests'>['data'];

/** Parse "row-start / col-start / row-end / col-end". */
export function span(area: string) {
  const [r0, c0, r1, c1] = area.split('/').map((v) => parseInt(v, 10)) as [number, number, number, number];
  return { cols: c1 - c0, rows: r1 - r0 };
}

/** Room name size on the desktop plan: narrow rooms get the small cut, the big room the large one. */
export function roomSize(q: Quest): 's' | 'm' | 'l' {
  const d = span(q.plan.desktop);
  if (d.cols === 1) return 's';
  return d.cols * d.rows >= 6 ? 'l' : 'm';
}

/** Room name size on the phone plan. */
export function roomSizePhone(q: Quest): 'm' | 'l' {
  const p = span(q.plan.phone);
  return p.cols * p.rows >= 4 ? 'l' : 'm';
}

export function questMeta(q: Quest): string {
  if (q.status === 'complete') return `ROOM ${q.room} · ${q.started} – ${q.ended ?? '[YEAR]'} · COMPLETE`;
  if (q.status === 'dormant') return `ROOM ${q.room} · STARTED ${q.started} · DORMANT`;
  return `ROOM ${q.room} · STARTED ${q.started}`;
}

export const roomId = (q: Quest) => `room-${q.room}`;
