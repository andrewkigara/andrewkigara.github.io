import type { CollectionEntry } from 'astro:content';
import { pad2 } from './sheets';

export type Frame = CollectionEntry<'album'>['data'];
export type CollectionKey = Frame['collection'];

export const COLLECTIONS: { key: CollectionKey; name: string; blurb: string }[] = [
  { key: 'field', name: 'FIELD SURVEY', blurb: 'photos I took' },
  { key: 'archive', name: 'ARCHIVE', blurb: 'photos of me' },
];

export const frameId = (f: Frame) => `${f.collection}-${pad2(f.frame)}`;
export const caption = (f: Frame) => `${pad2(f.frame)} — ${f.title} · ${f.year}`;
export const subcaption = (f: Frame) =>
  f.collection === 'archive' ? `Shot by ${f.shotBy ?? '[Name]'}` : (f.camera ?? '');
