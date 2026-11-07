/** The drawing set: one sheet per page, in order. */
export interface SheetInfo {
  /** Sheet number, e.g. "A-101". */
  no: string;
  href: string;
  /** Uppercase name used in navigation. */
  name: string;
  /** Title-block "SHEET TITLE". */
  title: string;
  /** Title-block "SCALE". */
  scale: string;
  /** Index card description (desktop and iPad). */
  description: string;
  /** Shorter line for the phone index of sheets. */
  short: string;
  /** Line in the phone sheet index dialog. */
  menu: string;
}

export const SHEETS: SheetInfo[] = [
  {
    no: 'A-000',
    href: '/',
    name: 'COVER',
    title: 'Cover',
    scale: '1:1',
    description: 'Name, notes, and the field of lines.',
    short: 'Name, notes, and the field of lines.',
    menu: 'Name, notes, and the field of lines.',
  },
  {
    no: 'A-101',
    href: '/profile',
    name: 'PROFILE',
    title: 'Profile',
    scale: '1:1',
    description: "Who I am, where I am, and what I'm working on.",
    short: "Who I am, where I am, and what I'm working on.",
    menu: "Who I am, where I am, and what I'm working on.",
  },
  {
    no: 'A-201',
    href: '/academic',
    name: 'ACADEMIC',
    title: 'Academic',
    scale: 'Years',
    description: 'Drexel to now, drawn as a building section. Co-ops are floors.',
    short: 'Drexel to now, drawn as a building section.',
    menu: 'Drexel to now, drawn as a building section.',
  },
  {
    no: 'A-301',
    href: '/side-quests',
    name: 'SIDE QUESTS',
    title: 'Side Quests',
    scale: '1 room : 1 hobby',
    description: 'Hobbies and interests, room by room, each with a status tag.',
    short: 'Hobbies and interests, room by room.',
    menu: 'Hobbies and interests, room by room.',
  },
  {
    no: 'A-401',
    href: '/album',
    name: 'ALBUM',
    title: 'Album',
    scale: 'NTS',
    description: 'Photos of me, and photos I took, pinned to a key plan.',
    short: 'Photos of me, and photos I took, pinned to a key plan.',
    menu: 'Photos of me, and photos I took.',
  },
];

export type SheetNo = (typeof SHEETS)[number]['no'];

/** Sheets outside the set (the 404 page). Not listed in navigation. */
const LOOSE: SheetInfo[] = [
  {
    no: 'X-404',
    href: '/404',
    name: 'NOT FOUND',
    title: 'Not found',
    scale: 'NTS',
    description: 'There is no sheet at this address.',
    short: 'There is no sheet at this address.',
    menu: 'There is no sheet at this address.',
  },
];

export function getSheet(no: string): SheetInfo {
  const sheet = [...SHEETS, ...LOOSE].find((s) => s.no === no);
  if (!sheet) throw new Error(`Unknown sheet ${no}`);
  return sheet;
}

/** Previous and next sheet, wrapping around at both ends. */
export function neighbours(no: string) {
  const i = SHEETS.findIndex((s) => s.no === no);
  const n = SHEETS.length;
  return {
    index: i,
    prev: SHEETS[i === -1 ? n - 1 : (i - 1 + n) % n]!,
    next: SHEETS[(i + 1) % n]!,
  };
}

export const pad2 = (n: number) => String(n).padStart(2, '0');

/** Build date as YYYY.MM.DD, in Maryland time. */
export function buildDate(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return `${get('year')}.${get('month')}.${get('day')}`;
}
