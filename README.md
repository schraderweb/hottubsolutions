# Hot Tub Solutions — Website

Official website for Hot Tub Solutions. A static site built from reusable pieces and deployed on Vercel.

---

## The One Rule You Must Remember

> **Everything you edit lives in `public/`.**
>
> The files at the project root (`index.html`, `css/`, `js/`, `images/`) are **generated** — the build **overwrites them every time**. Never edit files at the root directly, or your changes will be wiped on the next build.

How the build works:

```
 public/src/*.html   (page sections)
 public/css/         (styles)        ─┐
 public/js/          (scripts)        │──▶  Build  ──▶  index.html + css/ + js/ + images/  ──▶  Live site
 public/images/**    (everything      │
                     visual)        ─┘
```

---

## Folder Map

```
◄── EDIT HERE ──────────────────────────────────────────────►

 public/                  THE place to make changes
 ├── src/                 Page sections (the text/content of the site)
 │   ├── _hero.html         Top banner section
 │   ├── _services.html     Services + the "New Tubs" / "Used Tubs" images
 │   ├── _inventory.html    Tubs for sale with photos
 │   ├── _reviews.html      Customer reviews
 │   ├── _about.html        About / story
 │   ├── _footer.html       Footer + contact info
 │   └── (full list below)
 ├── images/               ALL website images live here
 │   ├── inventory/          Tub photos on the inventory page
 │   ├── services/           Service section images
 │   ├── logos/              Brand / partner logos
 │   └── ...                 Hero, about, banners, etc.
 ├── css/                  Styles (colors, layout, fonts)
 ├── js/                   Site behaviour scripts
 └── build.js              The build script — assembles the site


◄── DO NOT TOUCH ────────────────────────────────────────────►

 index.html               Generated page (build output)
 images/  css/  js/       Generated copies (build output)

 api/                     Form submission endpoint (Vercel serverless)
 server.js                Local dev server
 vercel.json              Deploy settings
 package.json             Project commands
 .env                     Local secrets (API keys) — never share, never commit
```

### Full list of sections in `public/src/`

| File | What it contains |
| --- | --- |
| `_head.html` | Meta tags, page title, fonts |
| `_nav.html` | Top navigation bar |
| `_hero.html` | Main banner section |
| `_about.html` | About section |
| `_services.html` | Services + the "New Tubs" / "Used Tubs" images |
| `_reviews.html` | Customer reviews |
| `_inventory.html` | Tubs for sale with photos |
| `_badges.html` | Trust badges |
| `_serving.html` | Areas served |
| `_map.html` | Embedded map |
| `_brands.html` | Partner brands |
| `_accordion.html` | Accordion / FAQ block |
| `_footer.html` | Footer + contact/links |
| `_scripts.html` | Script includes (analytics, etc.) |

---

## How to Update Images (most common task)

**👉 Upload your new image into `public/images/`, using the exact same file name as the one you are replacing.**

1. Find the right folder inside `public/images/` — service images go in `public/images/services/`, tub photos in `public/images/inventory/`, etc.
2. Replace the existing file with your new one, **keeping the same file name** (e.g. replace `new-tubs.webp` with the new `new-tubs.webp`).
   - Same name = the site keeps working exactly as before, just with your new picture. No code changes needed.
   - Adding a brand-new image? Keep the name simple: lowercase, no spaces (`new-tubs.webp`, not `New Tubs!.png`).
3. Rebuild and deploy (next section).

> **Supported formats:** `.webp` (best), `.png`, `.jpg`. Keep images reasonably sized (a few hundred kB) so the site stays fast.

---

## How to Edit Text / Prices / Phone Numbers

1. Open the matching section file in `public/src/` (see the table above).
2. Change the text, save the file.
3. Rebuild and deploy.

Example — to change the tagline in the banner, edit the `<h1>` inside `public/src/_hero.html`.

---

## Run Locally (Developer)

Requirements: [Node.js](https://nodejs.org) (LTS) installed.

```bash
# 1. Install dependencies (first time only)
npm install

# 2. Start the dev environment
npm start
```

Then open **http://localhost:3000**. The page auto-reloads whenever you edit HTML/CSS/JS in `public/`.

| Command | What it does |
| --- | --- |
| `npm install` | Installs dependencies (run once after cloning) |
| `npm start` / `npm run dev` | Build + dev server + live reload on port 3000 |
| `npm run build` | Builds `public/` into the root output |
| `npm run server` | Just the API/server on port 3001 (no auto-reload) |
| `npm run vercel-build` | Production build (what Vercel runs) |

---

## Deploy (Publish the Site)

The site is hosted on **Vercel**, connected to the GitHub repository.

1. Edit files in `public/`.
2. `npm run build` so the generated root files are up to date.
3. Commit and push to `main`.
4. Vercel detects the push, builds, and publishes automatically.

```
 Edit public/  →  npm run build  →  Commit + push to main  →  Vercel deploys  →  Live site
```

---

## Environment Variables (`.env`)

Sensitive settings live in a local `.env` file (never committed to git). Ask the previous developer for the values.

| Variable | Purpose |
| --- | --- |
| `GOOGLE_MAPS_API_KEY` | Loads the map embedded on the site |
| `RESEND_API_KEY` | Sends contact-form emails |
| `FROM_EMAIL` | Sender address for form emails |
| `TO_EMAILS` | Where enquiry emails are delivered (comma-separated) |

On Vercel, set these in **Project → Settings → Environment Variables** instead of the local `.env`.

---

## Contact Form

The enquiry form submits to a serverless endpoint (`api/send-enquiry.js`), which sends the enquiry email via [Resend](https://resend.com). Configure `RESEND_API_KEY`, `FROM_EMAIL`, and `TO_EMAILS` as described above.