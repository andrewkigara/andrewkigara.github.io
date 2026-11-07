import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** "row-start / column-start / row-end / column-end", e.g. "1 / 1 / 3 / 4". */
const gridArea = z
  .string()
  .regex(/^\s*\d+\s*\/\s*\d+\s*\/\s*\d+\s*\/\s*\d+\s*$/, 'Use "row-start / column-start / row-end / column-end"');

/** One photo frame on the A-401 contact sheet. */
const album = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/album' }),
  schema: ({ image }) =>
    z.object({
      collection: z.enum(['field', 'archive']),
      frame: z.number().int().positive(), // 1, 2, 3… within its collection
      image: image().optional(), // optional, so placeholders render
      alt: z.string(),
      title: z.string(), // "Drexel commencement" or "[Location]"
      year: z.string(),
      camera: z.string().optional(), // field: "[Camera] · [Lens] · [Settings]"
      shotBy: z.string().optional(), // archive
      // Position on the 600×540 key plan. Set by hand, never from photo metadata.
      keyPlan: z.object({ x: z.number(), y: z.number(), bearing: z.number() }),
    }),
});

/** One room on the A-301 floor plan. */
const quests = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/quests' }),
  schema: z.object({
    room: z.number().int(), // 301…
    name: z.string(),
    status: z.enum(['active', 'dormant', 'complete']),
    started: z.string(),
    ended: z.string().optional(),
    summary: z.string(),
    log: z.array(z.object({ date: z.string(), entry: z.string() })),
    nextObjective: z.string().optional(),
    link: z.object({ label: z.string(), href: z.string() }).optional(),
    // CSS grid-area on the 6×4 desktop plan and the 2×6 phone plan.
    plan: z.object({ desktop: gridArea, phone: gridArea }),
  }),
});

/** One level of the A-201 building section. */
const floors = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/floors' }),
  schema: z.object({
    order: z.number(), // top to bottom
    kind: z.enum(['roof', 'current', 'coop', 'foundation']),
    level: z.string(), // "ROOF", "LEVEL 04", "FOUNDATION"
    elevation: z.string(), // "NEXT", "+[YEAR]"
    tag: z.string(),
    title: z.string(),
    meta: z.string().optional(),
    summary: z.string(),
    note: z.string().optional(), // hand-lettered markup note
    cantilever: z.boolean().default(false),
  }),
});

const link = z.object({
  label: z.string(),
  // Leave href out (or null) while the label is still a placeholder.
  href: z.string().nullish(),
});

/** Name, role, links, "currently on site", schedule and revisions. */
const site = defineCollection({
  loader: file('./src/content/site.json', { parser: (text) => ({ site: JSON.parse(text) }) }),
  schema: z.object({
    name: z.string(),
    shortName: z.string(),
    role: z.string(),
    employer: z.string(),
    base: z.string(),
    rev: z.string(),
    links: z.object({ github: link, linkedin: link, email: link, resume: link }),
    coverNotes: z.array(z.string()),
    narrative: z.string(),
    specifications: z.array(z.object({ label: z.string(), value: z.string() })),
    currentlyOnSite: z.object({
      date: z.string(),
      items: z.array(z.object({ label: z.string(), value: z.string() })),
    }),
    materials: z.array(z.object({ mark: z.string(), material: z.string(), spec: z.string() })),
    inspections: z.array(z.object({ name: z.string(), issuer: z.string(), year: z.string() })),
    revisions: z.array(z.object({ rev: z.string(), date: z.string(), note: z.string() })),
  }),
});

export const collections = { album, quests, floors, site };
