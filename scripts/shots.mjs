#!/usr/bin/env node
// Screenshot every sheet at phone, iPad and desktop widths in both modes.
//
//   npm run build && npm run shots              # site → shots/site/
//   npm run shots -- --mockups                  # also the design-reference mockups → shots/mockups/
//   BASE_URL=http://localhost:4321 npm run shots   # use a server that is already running
//
// Uses the installed Google Chrome if there is one, otherwise Playwright's Chromium
// (run `npx playwright install chromium` once).
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const PAGES = [
  { slug: 'a000-cover', path: '/' },
  { slug: 'a101-profile', path: '/profile' },
  { slug: 'a201-academic', path: '/academic' },
  { slug: 'a301-side-quests', path: '/side-quests' },
  { slug: 'a401-album', path: '/album' },
  { slug: 'sheets', path: '/sheets' },
];
const WIDTHS = [390, 834, 1440];
const MODES = ['dark', 'light'];
const MOCKUPS = [
  ['Main', 1440], ['Profile', 1440], ['Academic', 1440], ['SideQuests', 1440], ['Album', 1440],
  ['PhoneCover', 390], ['PhoneProfile', 390], ['PhoneAcademic', 390], ['PhoneSideQuests', 390],
  ['PhoneAlbum', 390], ['PhoneMenu', 390],
];
const out = resolve('shots');
const withMockups = process.argv.includes('--mockups');

async function launch() {
  try {
    return await chromium.launch({ channel: 'chrome' });
  } catch {
    return chromium.launch();
  }
}

async function reachable(url) {
  try {
    return (await fetch(url)).ok;
  } catch {
    return false;
  }
}

// Reuse a running `astro preview` (Astro allows only one), or start one.
async function startPreview() {
  const base = process.env.BASE_URL ?? 'http://localhost:4321';
  if (await reachable(base)) return { base, stop() {} };
  const child = spawn('npx', ['astro', 'preview', '--port', new URL(base).port || '4321'], { stdio: 'ignore' });
  for (let i = 0; i < 200; i++) {
    if (await reachable(base)) return { base, stop: () => child.kill() };
    await new Promise((r) => setTimeout(r, 150));
  }
  child.kill();
  throw new Error('astro preview did not start (did you run `npm run build`?)');
}

const browser = await launch();
const server = await startPreview();
const problems = [];
try {
  await mkdir(resolve(out, 'site'), { recursive: true });
  for (const mode of MODES) {
    for (const width of WIDTHS) {
      const context = await browser.newContext({
        viewport: { width, height: width < 640 ? 844 : width < 1024 ? 1112 : 900 },
        deviceScaleFactor: 1,
        isMobile: width < 640,
        hasTouch: width < 640,
        colorScheme: mode,
      });
      await context.addInitScript((m) => localStorage.setItem('mode', m), mode);
      const page = await context.newPage();
      page.on('console', (msg) => msg.type() === 'error' && problems.push(`${page.url()} @${width}: ${msg.text()}`));
      page.on('pageerror', (err) => problems.push(`${page.url()} @${width}: ${err.message}`));
      for (const p of PAGES) {
        await page.goto(server.base + p.path, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
        if (overflow > 0) problems.push(`${p.path} @${width} ${mode}: scrolls sideways by ${overflow}px`);
        // Grow the viewport to the page instead of using fullPage: Chrome's full-page capture
        // drops touch emulation, so phone shots would show the mouse wording on the cover.
        const viewport = page.viewportSize();
        const height = await page.evaluate(() => document.documentElement.scrollHeight);
        await page.setViewportSize({ width, height });
        await page.screenshot({ path: resolve(out, 'site', `${p.slug}-${width}-${mode}.png`) });
        await page.setViewportSize(viewport);
      }
      await context.close();
    }
  }
  if (withMockups) {
    await mkdir(resolve(out, 'mockups'), { recursive: true });
    for (const [name, width] of MOCKUPS) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await page.goto(pathToFileURL(resolve('design-reference', `${name}.dc.html`)).href, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: resolve(out, 'mockups', `${name}.png`), fullPage: true });
      await page.close();
    }
  }
} finally {
  server.stop();
  await browser.close();
}
console.log(`Screenshots written to ${out}`);
if (problems.length) {
  console.log(`\nProblems:\n  ${problems.join('\n  ')}`);
  process.exitCode = 1;
}
