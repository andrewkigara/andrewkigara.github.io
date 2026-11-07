#!/usr/bin/env node
// Fails the build if any image in dist/ or public/ still carries GPS data.
//
// Astro's image pipeline re-encodes album photos with sharp, which drops EXIF,
// so dist/ should be clean. Files in public/ are served untouched, which is why
// album images never go there. This script is the safety net for both.
//
// Checks EXIF GPS IFDs (JPEG, PNG, TIFF, HEIC, AVIF via exifr; WebP via its
// EXIF chunk) and XMP packets (exif:GPSLatitude and friends) in any format.
import { readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import exifr from 'exifr';

const ROOTS = process.argv.slice(2).length ? process.argv.slice(2) : ['dist', 'public'];
const IMAGE = /\.(jpe?g|png|webp|avif|heic|heif|tiff?|gif)$/i;
const XMP_GPS = /(?:exif|exifEX|drone-dji):GPS(?:Latitude|Longitude|Altitude|Position)|GPSLatitude=|GPSLongitude=/;

async function* walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (err) {
    if (err.code === 'ENOENT') return;
    throw err;
  }
  for (const e of entries) {
    const path = join(dir, e.name);
    if (e.isDirectory()) yield* walk(path);
    else if (IMAGE.test(e.name)) yield path;
  }
}

/** EXIF payloads inside a WebP (RIFF) container. */
function webpExif(buf) {
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP') return null;
  const out = [];
  for (let off = 12; off + 8 <= buf.length; ) {
    const id = buf.toString('ascii', off, off + 4);
    const size = buf.readUInt32LE(off + 4);
    let data = buf.subarray(off + 8, off + 8 + size);
    if (id === 'EXIF') {
      if (data.toString('ascii', 0, 6) === 'Exif\0\0') data = data.subarray(6);
      out.push(data);
    }
    off += 8 + size + (size & 1);
  }
  return out;
}

async function gpsTags(buf) {
  const found = new Set();
  const sources = webpExif(buf) ?? [buf];
  for (const src of sources) {
    try {
      const gps = await exifr.parse(src, {
        tiff: true,
        ifd0: false,
        exif: false,
        ifd1: false,
        interop: false,
        gps: true,
        xmp: false,
        mergeOutput: false,
        translateKeys: true,
      });
      for (const key of Object.keys(gps?.gps ?? {})) found.add(key);
    } catch {
      // Not a format exifr reads, or no EXIF at all: the XMP scan below still runs.
    }
  }
  const xmp = buf.toString('latin1').match(XMP_GPS);
  if (xmp) found.add(`XMP ${xmp[0]}`);
  return [...found];
}

let checked = 0;
const failures = [];
for (const root of ROOTS) {
  for await (const file of walk(root)) {
    checked++;
    const tags = await gpsTags(await readFile(file));
    if (tags.length) failures.push(`${relative(process.cwd(), file)}: ${tags.join(', ')}`);
  }
}

if (failures.length) {
  console.error(`\n✗ GPS data found in ${failures.length} image(s):\n  ${failures.join('\n  ')}`);
  console.error('\nAlbum photos belong in src/content/album/, where the build re-encodes them without metadata.');
  process.exit(1);
}
console.log(`✓ check-exif: no GPS data in ${checked} image(s) under ${ROOTS.join(', ')}`);
