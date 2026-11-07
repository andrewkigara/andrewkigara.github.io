// Adds a Content-Security-Policy <meta> tag to every built page.
//
// GitHub Pages cannot send custom response headers, so the policy has to live
// in the document. After the build, this hashes every inline <script> and
// <style> on each page (the no-flash mode script, small hoisted scripts and
// inlined component CSS) and allows exactly those, alongside 'self'.
//
// It also fails the build if any page uses an inline style="" attribute, since
// a hash-based style-src would silently block it in the browser.
import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const sha256 = (text) => `'sha256-${createHash('sha256').update(text, 'utf8').digest('base64')}'`;

async function* htmlFiles(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(path);
    else if (entry.name.endsWith('.html')) yield path;
  }
}

/** @param {{ directives?: string[] }} [options] */
export default function metaCsp({ directives = [] } = {}) {
  return {
    name: 'meta-csp',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const offenders = [];
        let pages = 0;
        for await (const file of htmlFiles(root)) {
          let html = await readFile(file, 'utf8');
          // Only inline elements (no src) need hashes; external files are covered by 'self'.
          const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)]
            .map((m) => m[1])
            .filter((body) => body.trim() !== '');
          const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
          if (/<[^>]+\sstyle=/.test(html)) offenders.push(file.slice(root.length));

          const policy = [
            ...directives,
            ['script-src', "'self'", ...new Set(scripts.map(sha256))].join(' '),
            ['style-src', "'self'", ...new Set(styles.map(sha256))].join(' '),
          ].join('; ');
          const meta = `<meta http-equiv="content-security-policy" content="${policy}">`;
          html = html.replace(/<meta charset="utf-8"\s*\/?>/i, (charset) => `${charset}${meta}`);
          if (!html.includes(meta)) throw new Error(`meta-csp: no <meta charset> found in ${file}`);
          await writeFile(file, html);
          pages++;
        }
        if (offenders.length) {
          throw new Error(
            `meta-csp: inline style="" attributes would be blocked by the CSP. Move them to a class in:\n  ${offenders.join('\n  ')}`,
          );
        }
        logger.info(`CSP meta tag added to ${pages} pages`);
      },
    },
  };
}
