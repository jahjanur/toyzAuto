# TOYZ autoart — website & admin panel

High-end, black-and-racing-red Next.js platform for [toyzautoart.com](https://toyzautoart.com): public showroom site plus a password-protected admin panel at `/admin` to manage everything without touching code.

**Design:** wide uppercase Archivo display type, Geist body, racing red (`#e3121f`) accents on black. Scroll-driven sections built to feel premium on phones: intro curtain (first visit per session), single-video hero that shrinks into a framed card, real marque emblems and partner logos rail, word-by-word statement reveal with count-up stats, pinned horizontal car collection, wheels video that expands to full screen, stacking service cards, sticky Inquire bar on vehicle pages, floating Filters button on the inventory.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Server Actions, Turbopack) + React 19 |
| Styling | Tailwind CSS v4 with a custom dark/gold design system (`src/app/globals.css`) |
| Motion | `motion` (Framer Motion) scroll-linked animations + Lenis smooth scroll |
| Database | SQLite via better-sqlite3 + Drizzle ORM (file: `data/toyz.db`, auto-migrated on boot) |
| Images | sharp (uploads auto-converted to optimized WebP + blur placeholders), `next/image` |
| Auth | Signed httpOnly cookie (jose JWT) + bcrypt passwords, enforced by `src/proxy.ts` and server actions |

## Local development

```bash
cd web
pnpm install            # Node 20+ (better-sqlite3 builds natively; allowed in pnpm-workspace.yaml)
cp .env.example .env.local   # then edit AUTH_SECRET / ADMIN_EMAIL / ADMIN_PASSWORD
pnpm db:seed            # creates data/toyz.db, imports the 17 vehicles + services, creates the admin user
pnpm dev                # http://localhost:3000  — admin at /admin
```

Default admin credentials come from `.env.local` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`). Change the password from **Admin → Account & users** after first login.

### Useful scripts

| Script | What it does |
| --- | --- |
| `pnpm db:seed` | Seed vehicles/brands/services (skips if vehicles already exist) and ensure the admin user |
| `pnpm db:seed -- --force` | Wipe vehicles/brands/services and re-import from `src/data/vehicles.json` |
| `pnpm db:services` | Apply the five service descriptions and covers from `src/data/services.json`, preserving existing visibility, ordering and all other records |
| `pnpm import:images` | Re-download the original photos from toyzautoart.com into `public/vehicles` as WebP |
| `pnpm db:generate` | Generate a new SQL migration after editing `src/db/schema.ts` (migrations auto-apply on boot) |
| `pnpm db:studio` | Open Drizzle Studio to inspect the database |
| `pnpm build && pnpm start` | Production build and server |

## Project layout

```
web/
├─ src/app/(site)/        public pages: /, /inventory, /inventory/[slug], /services, /services/[slug],
│                         /wheels, /about, /contact, /sell, /privacy
├─ src/app/admin/         /admin/login + (panel): dashboard, vehicles, inquiries, services, brands,
│                         testimonials, settings, account
├─ src/app/api/upload/    authenticated multipart upload → data/uploads (served by /uploads/[...path])
├─ src/components/site/   hero, nav, footer, vehicle card, gallery/lightbox, filters, forms, sections
├─ src/components/admin/  admin shell, vehicle form, photo manager (drag & drop), settings form
├─ src/db/                Drizzle schema, SQLite client (auto-migrate), seed script
├─ src/lib/               settings model, queries, server actions, auth, uploads
├─ drizzle/               SQL migrations
├─ public/media/          hero (Bugatti) and feature (wheels) videos, 1080p + 720p, with posters
├─ public/brand/          logo, marques/*.svg (car brand emblems), partners/*.png (BRABUS, HRE, Vossen, Novitec, TECHART, Urban)
├─ public/vehicles/       imported vehicle photos (WebP, max 1920px)
└─ data/                  SQLite database + uploads (git-ignored; back this folder up)
```

## What the admin can change

- **Vehicles**: add/edit/duplicate/delete, status (available, reserved, sold, coming soon, hidden) and featured flag (both save instantly from the list), price or "price on request", full specs, summary/description (simple text formatting), highlights, video, photo upload with drag-to-reorder and cover selection. Photo changes apply when you press "Save changes"; a reminder shows until you do.
- **Inquiries**: every form submission (vehicle, contact, test drive, sell/trade, service, wheels) with status workflow and the related vehicle.
- **Deleting**: every delete (vehicles, services, brands, testimonials, inquiries, users) asks for confirmation first and shows a spinner while it runs. Delete buttons are plain buttons (`ConfirmButton` in `src/components/admin/ui.tsx`), never a `<form>`, because a form placed inside another form is dropped by the browser and the click would save instead of delete.
- **Services, Brands, Testimonials**: full CRUD.
- **Site settings**: hero headline/subheadline/buttons, hero video, homepage statement sentence, feature video section (title, text, video), announcement bar, phone/WhatsApp/emails/address/map, opening hours, social links, stats, about text, partners, SEO text, footer blurb, currency.
- **Account & users**: change password; the owner can add/remove team members.

All changes are live immediately (pages re-render on demand).

## Deploying

The app needs a Node.js runtime with a writable disk for `data/` (SQLite + uploads).

### Hostinger (Node.js web app on Business/Cloud plans)
Hostinger builds Next.js in "standalone" mode and **replaces the app folder on every deploy**, so the database and uploads must live outside it (in your home folder).

1. hPanel → Websites → Add website → **Node.js web app** → Import Git repository → connect GitHub → `jahjanur/toyzAuto`, branch `main`.
2. Build settings (auto-detected): framework **Next.js**, root directory `/`, Node **22**, package manager **pnpm** (from `pnpm-lock.yaml`), build script `build`, output directory `.next`. Node 22 matters: Hostinger's servers are too old for the prebuilt better-sqlite3 module (it needs glibc 2.29), so the app uses Node's built-in `node:sqlite` there instead (see below).
3. Environment variables (set them before the first deploy; `NEXT_PUBLIC_*` is read at build time):
   - `AUTH_SECRET`: at least 32 random characters (`openssl rand -hex 32`). The admin refuses to sign anyone in without it.
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD`: used only to create the first owner when the database is empty.
   - `NEXT_PUBLIC_SITE_URL=https://toyzautoart.com`
   - `DATABASE_PATH=/home/<username>/toyz-data/toyz.db` and `UPLOADS_DIR=/home/<username>/toyz-data/uploads` (your username looks like `u123456789`).
4. Data: in File Manager, upload a `toyz-data` folder (database + uploads) to `/home/<username>/`. Without it the site starts empty, creates the tables and the owner account from `ADMIN_EMAIL` / `ADMIN_PASSWORD`, and you add content in the admin.
5. Deploy, then check **Runtime logs**. Every later push to `main` redeploys automatically.
6. Check persistence once: change something in the admin, press Redeploy, and confirm the change is still there. If it is lost, the plan cannot keep files outside the app folder; use a VPS (below).
7. Point the domain at the app and enable SSL. If the domain already hosts another website in hPanel (e.g. the old WordPress site), back it up first; testing on a subdomain first is safer.

Pinned versions (do not upgrade without checking the host): Hostinger's servers run glibc 2.28. Next.js **16.2.x** is the newest line whose compiler (`@next/swc-linux-x64-gnu`) runs there; 16.3.0 and later need glibc 2.30 and the build fails. `sharp` is pinned to the 0.34 line Next 16.2 uses (one copy, needs glibc 2.26). Root params need `experimental.rootParams` on 16.2. To check a new version: `npm pack @next/swc-linux-x64-gnu@<version>` and look for the highest `GLIBC_2.x` string in the `.node` file; it must be 2.28 or lower.

Database driver: `src/db/sqlite.ts` opens the database with `better-sqlite3` when it is installed and loads (local Node 20), otherwise with Node's built-in `node:sqlite` (Node 22.13+, no native build). `better-sqlite3` is an optional dependency, so a failed native build does not stop the install. The runtime log shows which one is used, e.g. `[db] SQLite (node:sqlite) at /home/.../toyz.db`. Force one with `SQLITE_DRIVER=node` or `SQLITE_DRIVER=better-sqlite3`.

What makes the standalone build work: `outputFileTracingIncludes` ships the `drizzle/` migrations (applied at startup), runtime paths are marked `turbopackIgnore` so the build does not bundle `data/`, English URLs are mapped onto `[locale]=en` by `rewrites()` in `next.config.ts` (a rewrite in the proxy loops on standalone servers), and `pnpm-workspace.yaml` approves the native builds (`better-sqlite3`, `sharp`).

### Any VPS (PM2)
```bash
pnpm install --prod=false && pnpm build
AUTH_SECRET=... ADMIN_EMAIL=... ADMIN_PASSWORD=... pnpm db:seed:prod
pm2 start "pnpm start" --name toyz -- -p 3000
```
Put nginx (or Caddy) in front with HTTPS and `client_max_body_size 200m` so large photo/video uploads work.

### Vercel / serverless
Possible, but SQLite + local uploads do not persist on serverless hosts. You would swap the Drizzle driver for Turso/Postgres and uploads for Vercel Blob or S3. The code is isolated in `src/db/index.ts` and `src/lib/uploads.ts` to make that swap small.

## Languages (English / French)

The public site is fully bilingual.

- **Addresses**: English at the root (`/inventory`), French under `/fr` (`/fr/inventory`). `/en/...` redirects to the root.
- **First visit**: browsers set to French are sent to `/fr`. The EN/FR switch in the header saves the visitor's choice in a cookie, after which it is always respected.
- **Interface text**: `src/i18n/dictionaries/en.ts` and `fr.ts` (same structure). Add a string to both.
- **Content**: cars and services have French fields (`summary_fr`, `description_fr`, `highlights_fr`, `title_fr`, `excerpt_fr`, `body_fr`), edited in the admin under "French content". Homepage, about, SEO and footer texts have a "French texts" section in Admin → Site settings. Any empty French field shows the English text instead.
- **Inquiries** record the language the visitor used ("language: Français"), so the team can reply in that language.
- The admin panel itself stays in English.

How it works: `src/proxy.ts` picks the language and rewrites English URLs onto the `src/app/[locale]` route. Server code reads the language with `getI18n()` (`src/i18n/server.ts`), client components with `useI18n()` (`src/i18n/client.tsx`). Always import links from `@/components/i18n/link` on the public site so they keep the current language.

## Engine sounds

- **Brand hover only**: hovering a marque on the homepage brand grid or in the menu's "Shop by marque" plays a short engine clip. On phones, tapping a marque plays it while the next page opens. Cars themselves (inventory cards, car pages) have no sound.
- **Sound toggle** in the header mutes or unmutes everything; the choice is remembered. Browsers only allow sound after the visitor's first click or tap, so a "Tap to hear the engines" chip sits beside the brand grid.
- **Which clip plays**: the brand's upload in Admin → Brands, otherwise the built-in clip for that marque. Mapping lives in `src/lib/sounds.ts`; playback in `src/components/sound/`.
- **Built-in clips** (`public/sounds/hover`) are CC0 recordings from Freesound, trimmed and loudness-matched. They are the same make or engine type, not the exact cars in stock. Sources are listed in `public/sounds/CREDITS.txt`. Recording the real cars and uploading them per brand in the admin is recommended.

## Layout safety (no text outside its box)

Big display titles shrink automatically when a word is too wide for its box (`useFitWords` / `FitText` in `src/components/ui/fit.tsx`), so long model or service names, in either language, never spill out. `scripts/check-overflow.mjs` loads every public page in English and French at several widths and reports any text sticking out of a box or the screen:

```bash
node -e 'const D=require("better-sqlite3");console.log(JSON.stringify(new D("data/toyz.db").prepare("select slug from vehicles where status != ?").all("hidden").map(r=>r.slug)))' > /tmp/slugs.json
WIDTHS=320,390,768,1280,1885 node scripts/check-overflow.mjs /tmp/slugs.json   # needs the site running on :3312 and Playwright
```

Elements that slide off-screen on purpose (the homepage car rail) carry `data-overflow-ok`.

## Credits

The site credits Zulbera (logo in `public/brand/zulbera.svg`, components in `src/components/brand/zulbera.tsx`) in these places:

- **Loader**: a "Crafted by Zulbera" signature fades in at the bottom of the intro, with the emblem making a half turn.
- **Footer**: a signature card (`ZulberaBand`) with a red gradient hairline, the large logo, the services as small tags, a "Visit zulbera.com" button and a faint emblem watermark. On hover it glows, a light sweep passes over it, the emblem spins and the button turns red.
- **Desktop navigation**: a strip at the bottom of the Inventory and Services dropdowns.
- **Phone menu**, **admin login** and **admin sidebar**: the "crafted by / powered by" credit (`ZulberaCredit`, sizes `sm`, `md`, `lg`): label, thin divider, logo and an arrow that turns red on hover.
- **Behind the scenes**: page metadata (`author`, `creator`, `generator`), `/humans.txt` and a console signature.

The logo uses the site's red for the emblem and white for the wordmark. Links go to zulbera.com with UTM tags (`utm_source=toyzautoart`) so the visits show up in Zulbera's analytics. Labels are translated (English "Website crafted by", French "Site conçu par").

## Video look

The hero and wheels videos have a cinematic grade baked in: muted greens and blues, rich reds, deeper blacks with detail kept, gentle highlight roll-off, a soft vignette and light sharpening. Both source clips also had burned-in bars at the bottom, which are cropped off. On top, the site adds a moving film-grain and vignette layer (the `.cinema` class in `globals.css`). To grade a new clip the same way:

```bash
scripts/grade-video.sh path/to/clip.mp4 hero-newclip 2
```

Then upload or point the hero or feature video in Admin → Site settings to `/media/hero-newclip-1080.mp4` (and the `-720.mp4` and `-poster.jpg` files). Videos uploaded straight through the admin are not graded, but they still get the film-grain layer.

## Brand assets

The TOYZ autoart logo comes from `ToyzAutoArt.svg`. Its Illustrator viewBox did not contain the artwork, so the paths live in `src/components/brand/logo-paths.ts` with a measured viewBox, split into car, TOYZ and autoart groups. `LogoSvg` renders it in the nav, footer and admin. `LogoDraw` is the outline that draws itself in the footer. The first-visit loader in `src/components/site/intro.tsx` uses the same paths: the outlines draw in, a red edge fills the mark, a counter runs, and the curtain lifts (CSS in `globals.css`, under "Intro / preloader"). A clean standalone copy is at `public/brand/toyz-autoart.svg`.

Car emblems in `public/brand/marques` are the manufacturers' marks (vector data from Simple Icons; the Mercedes star is drawn as a plain geometric mark). Partner logos in `public/brand/partners` come from the previous toyzautoart.com homepage and were converted to white by `scripts/partner-logos.mjs`. All marks belong to their owners and are shown to identify the brands TOYZ autoart sells and installs. To add a marque emblem, drop a white single-colour SVG named after the brand slug (e.g. `mclaren.svg`) into `public/brand/marques` and add the slug to the `MARQUES` set in `src/components/site/brand-showcase.tsx`.

## Backups
Back up the `data/` folder (database and uploaded media) regularly. Vehicle photos imported from the old site live in `public/vehicles` and are part of the repository.
