# andrewkigara.com

Source for https://andrewkigara.com: Andrew Kigara's personal site, drawn as an architectural drawing set. Every page is a sheet with a
sheet number, a title block and a structural grid:

| Sheet | Route | Page |
| --- | --- | --- |
| A-000 | `/` | Cover, with the field of curves that bend toward the cursor |
| A-101 | `/profile` | Profile |
| A-201 | `/academic` | Education and work, drawn as a building section |
| A-301 | `/side-quests` | Hobbies, drawn as a floor plan |
| A-401 | `/album` | Photo album pinned to a key plan |

Built with [Astro](https://astro.build) (static output, TypeScript, no UI framework), self-hosted
fonts and plain CSS. `design-reference/` holds the mockups (reference only, never imported). The
build spec, `BUILD_PROMPT.md`, is kept locally and is git-ignored.

## Run it locally

Needs Node 22.23 or newer.

```sh
npm install
npm run dev       # http://localhost:4321 with hot reload
npm run build     # type-check, build to dist/, then fail if any image has GPS data
npm run preview   # serve dist/ (the CSP meta tag only exists in the built site)
npm run shots     # screenshot every sheet at 390, 834 and 1440px, light and dark → shots/
```

`npm run shots -- --mockups` also screenshots the mockups for side-by-side comparison. It uses
your installed Google Chrome, or run `npx playwright install chromium` once.

## Where the content lives

Everything personal is in `src/content/`, so you can update the site without touching components.
Text in brackets, like `[Year]`, is a placeholder waiting for the real thing.

- `src/content/site.json`: name, links (GitHub, LinkedIn, email, résumé), cover notes, the profile
  narrative and specifications, "Currently on site" (update its `date` when you change it), the
  material schedule, inspections and the revision log shown on the cover.
  A link with `"href": null` renders as plain text until you fill it in.
- `src/content/floors/`: one file per level of the A-201 building section.
- `src/content/quests/`: one file per room on the A-301 floor plan.
- `src/content/album/field/` and `src/content/album/archive/`: one file per photo frame.

### Add a photo

1. Put the image in `src/content/album/field/` (photos you took) or `src/content/album/archive/`
   (photos of you). JPG, PNG or WebP; convert HEIC first. **Never** put album photos in `public/`:
   files there are served untouched, metadata and all.
2. Add a matching `.md` file next to it (or fill in the existing placeholder):

   ```yaml
   ---
   collection: field          # or archive
   frame: 7                   # number within its collection
   image: ./07.jpg
   alt: Fallingwater from the stream, late afternoon
   title: Mill Run, PA        # caption: "07 — Mill Run, PA · 2026"
   year: "2026"
   camera: Fujifilm X100V · 23mm · f/8 1/250   # field only
   # shotBy: A friend's name                    # archive only
   keyPlan: { x: 300, y: 246, bearing: -30 }    # position on the 600×540 key plan
   ---
   ```

   `keyPlan` is set by hand and is deliberately approximate. `bearing` is the camera direction in
   degrees, clockwise from east (−90 is north, 90 is south).
3. Commit and push. The site rebuilds and deploys.

The build re-encodes every photo with sharp into AVIF and WebP at several widths, which strips EXIF
(including GPS). `scripts/check-exif.mjs` runs after every build and fails it if any image in
`dist/` or `public/` still has GPS data.

### Add a quest (a room on A-301)

Add `src/content/quests/307-something.md`:

```yaml
---
room: 307
name: CLIMBING
status: active            # active | dormant | complete
started: "2025"
# ended: "2026"           # complete quests only
summary: One line on what it is.
log:
  - { date: "2026.03", entry: First outdoor lead. }
nextObjective: Something to work toward
# link: { label: "SEE A-401 ALBUM →", href: /album }
plan: { desktop: "1 / 1 / 3 / 4", phone: "1 / 1 / 3 / 3" }
---
```

`plan` is a CSS `grid-area` (row-start / column-start / row-end / column-end) on the 6-column ×
4-row desktop plan and the 2-column × 6-row phone plan. Rooms must not overlap each other or the
entry (desktop rows 4, columns 4–6; phone row 6). The stats strip counts statuses automatically, and
`/side-quests#room-307` links straight to the room.

### Add a floor (a level on A-201)

Add a file to `src/content/floors/` and renumber `order` (0 is the roof, top to bottom):

```yaml
---
order: 1
kind: current             # roof | current | coop | foundation
level: LEVEL 05
elevation: "+2027"        # shown as "EL. +2027" and in the dimension column
tag: CURRENT LEVEL
title: SENIOR ENGINEER
meta: "Geico · 2027 – present"
summary: One line on the work, at the level you can share publicly.
cantilever: true          # slab extends past its column, like Levels 04 and 02
---
```

When you move up a level, change the old floor's `kind` from `current` to `coop` (or another kind)
so only one floor says YOU ARE HERE. Delete a co-op file to remove that floor.

## Deploy

Pushing to `master` runs `.github/workflows/deploy.yml`, which builds the site and publishes `dist/`
to GitHub Pages (Settings → Pages → Source: GitHub Actions). Pushes to `source` and pull requests run
the same build as a check without deploying. Day to day: work on `source`, then merge into `master`
to publish. Only `master` may deploy to the `github-pages` environment.

### Custom domain

The site is served at `andrewkigara.com` (set under Settings → Pages → Custom domain; with an Actions
deploy no `CNAME` file is needed). `andrewkigara.github.io` and `www.andrewkigara.com` redirect to it.
DNS is on Cloudflare, with every record set to **DNS only** (grey cloud) so GitHub can issue the HTTPS
certificate and Cloudflare doesn't inject scripts the CSP would block:

| Type | Name | Content |
| --- | --- | --- |
| A | `@` | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153` |
| CNAME | `www` | `andrewkigara.github.io` |
| TXT | `_github-pages-challenge-andrewkigara` | GitHub's domain-verification code |

Keep the TXT record: it proves the domain is yours, so nobody else can point a GitHub Pages site at it.

## Security and privacy

- No third-party scripts, trackers or font requests.
- GitHub Pages cannot set response headers, so the Content-Security-Policy is a `<meta>` tag added
  after the build by `integrations/meta-csp.mjs`. It hashes every inline script and style on each
  page (including the no-flash color-mode script) and fails the build if markup uses inline
  `style=""` attributes, which the policy would block.
- `/.well-known/security.txt` is generated at build time with an expiry one year out.
  Set your email in `site.json` (`links.email.href`) to replace the `[address]` placeholder.
- HTTPS is enforced by GitHub Pages. Real response headers (HSTS, `nosniff`, `Permissions-Policy`)
  would need Cloudflare's proxy in front, with SSL set to Full (strict) and Response Header Transform
  Rules; it is off for now.
