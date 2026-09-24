# kine-serenite.ca overhaul: Nuxt 4, Node 24, Nuxt UI

- Date: 2026-09-23
- Status: approved
- Reference: `kine-serenite` repo, branch `new-version-may-2026`, commit `9236071`
  (the commit deployed to `gh-pages` on 2026-09-16, which is what kine-serenite.ca serves today)

## 1. Goal

Rebuild kine-serenite.ca in this repository on a current stack (Node 24, Nuxt 4, Nuxt UI,
Tailwind CSS 4) with every page kept as-is: same routes, same content, a near pixel-perfect
render, and no SEO regression. Deployment stays static on GitHub Pages, now built and
published by GitHub Actions on every push to `main`.

The old repository is a read-only reference: this work changes nothing in it. Its dev server
(`nvm use 16 && npm run dev`) is the visual reference, and its `gh-pages` branch is the SEO
baseline.

### Success criteria

1. All 9 routes exist at the same URLs, with trailing slashes, and render the same content.
2. Visual verification passes on both tools (section 7.2): at most 0.5% differing pixels per
   screenshot, page height within ±2px, every remaining diff explained.
3. Every SEO tag in today's deployed HTML is present with the same value, except the
   approved deltas listed in section 6.2.
4. Lighthouse SEO and accessibility scores on every route are equal to or higher than
   today's; CLS is no worse.
5. No runtime requests to Google Fonts or jsDelivr; no console errors or hydration warnings.
6. A push to `main` deploys only after lint, typecheck, generate and tests pass.
7. kine-serenite.ca is served by the new repository with HTTPS enforced.

### Non-goals

- Content or copy changes, except the SEO deltas in section 6.2.
- Redesign. Where Vuetify and Nuxt UI disagree, the old render wins.
- Image optimisation (`@nuxt/image`) and recompression. Image files ship unchanged, byte for byte.
- Moving pages to Nuxt Content. The markup is too custom for Markdown to pay off.
- The `www.kine-serenite.ca` record (a CNAME to Squarespace today). Left untouched.
- Archiving or changing the old repository's code.

## 2. Decisions

| Topic | Decision |
|---|---|
| GitHub repository | New repo `damienbeaufils/kine-serenite-2026`; the custom domain moves to it at cutover |
| Deploy branch | `main` |
| UI approach | Nuxt UI primitives themed to Vuetify's metrics (approach A); no Nuxt UI page-level layout components |
| SEO additions | Generated sitemap and robots, LocalBusiness JSON-LD, complete social meta and image alt text |
| Fonts | Self-hosted through `@nuxt/fonts` (bundled with Nuxt UI); unused Parisienne and Roboto dropped |
| Images | Unchanged files, served as real `<img>` elements |
| Thai massage page | Kept hidden: reachable at its URL, excluded from the sitemap, homepage tile stays unclickable |
| JSON-LD address | Full street address of the Clermont practice, mirroring the visible page |
| robots.txt | `Disallow: /_nuxt/` dropped so crawlers can fetch CSS and JS |
| Page titles | The double space after the first `|` is collapsed to one |
| Colour mode | Light only |
| Package manager | pnpm (version from `packageManager`) |
| Node pinning | `.nvmrc` containing `24`, read by CI through `node-version-file` |
| TypeScript | 6.0.3, the latest version typescript-eslint supports (see 3.1) |
| Commit style | Gitmoji, as in the old repo; one atomic commit per plan task, directly on `main` |

## 3. Architecture and toolchain

### 3.1 Toolchain

- Node 24 (`.nvmrc`), pnpm 12.5.1 (`packageManager`).
- Latest versions at the time of writing: `nuxt` 4.5.2, `@nuxt/ui` 4.11.2, `tailwindcss`
  4.3.3, `@nuxt/eslint` 1.17.0, `eslint` 10.11.0, `eslint-plugin-better-tailwindcss` 4.7.0,
  `vue-tsc` 3.3.11, `@nuxtjs/sitemap` 8.5.1, `@nuxtjs/robots` 6.2.3, `nuxt-schema-org` 6.3.2,
  `@iconify-json/mdi` 1.2.3, `vitest` 5.0.1. The plan re-checks with `npm view` before
  installing and takes whatever is latest then.
- TypeScript exception: `typescript@7.0.2` is the native port: its package has no
  `lib/typescript.js`, so no JavaScript compiler API. typescript-eslint (used by
  `@nuxt/eslint`) declares `typescript: ">=4.8.4 <6.1.0"`, and `vue-tsc` loads the same API.
  TypeScript is pinned to `6.0.3` (`package.json` uses `~6.0.3`, so only 6.0.x patch releases
  apply), a Renovate rule keeps it below 6.1, and the README says why. The toolchain task
  confirms the breakage with TS 7 before pinning.

### 3.2 Modules

- `@nuxt/ui` with `ui.colorMode: false`. It brings `@nuxt/fonts` (self-hosted Lora and Sofia)
  and `@nuxt/icon` (MDI icons from the local `@iconify-json/mdi` collection).
- `@nuxtjs/sitemap`, `@nuxtjs/robots` and `nuxt-schema-org`, sharing one `site` config:
  `url: 'https://kine-serenite.ca'`, `name` = site title, `defaultLocale: 'fr'`,
  `trailingSlash: true`.
- `@nuxt/eslint` (already in the scaffold).
- Not used: the `@nuxtjs/seo` bundle (its og-image renderer and link checker were not asked
  for), `@nuxt/image`, `@nuxt/content`.
- Removed from the scaffold: `@iconify-json/simple-icons`, `TemplateMenu.vue`, `AppLogo.vue`,
  the template `index.vue` content, and the template's MIT `LICENSE` ("Copyright (c) 2025
  Nuxt UI Templates"). The old repo had no licence. `@iconify-json/lucide` stays because
  Nuxt UI's default component icons use it.

### 3.3 Structure

```
app/
  app.vue                 UApp › NuxtLayout › NuxtPage; site-wide head
  app.config.ts           Nuxt UI theme overrides (button, card, dropdownMenu)
  error.vue               French 404 page, inside the default layout
  layouts/default.vue     AppHeader › centred content column › AppFooter
  assets/css/main.css     Tailwind + Nuxt UI imports, @theme tokens, Vuetify base layer and type scale
  components/
    AppHeader.vue
    AppFooter.vue
    InfoCard.vue          grey card with floating teal header (5 uses in the rates section)
    ServicePage.vue       teal-title card shell shared by the 7 soins pages, the policies page and the 404
    home/
      HomeIntroduction.vue
      HomeRates.vue
      RatesTable.vue      Vuetify simple-table look, used twice in the rates section
      HomeAbout.vue
      HomeServices.vue
      ServiceTile.vue     homepage service tile with hover elevation; optional link
  composables/
    usePageSeo.ts         title, description, canonical and per-page og:* from one call
  utils/image-alt.ts      alt text per image file
  pages/
    index.vue
    politiques-annulation-confidentialite.vue
    soins/*.vue           7 pages, same file names as the old repo
shared/utils/
  site.ts                 site URL, title, description, hero alt, page title helper
  routes.ts               the 9 routes, read by nuxt.config.ts and the tests
public/                   every tracked file of the old static/ except README.md, plus sw.js (6.3)
test/
  fixtures/               seo-baseline.json, static-files.json
  helpers/                output loader, baseline loader
  *.test.ts               run against .output/public
docs/superpowers/         this spec and the implementation plan
.github/workflows/ci.yml
.nvmrc
```

Components are registered with `pathPrefix: false` (`nuxt.config.ts` `components`), so the
files under `components/home/` keep their own names (`<RatesTable>`, `<ServiceTile>`, and so on).

The header and footer live in the default layout rather than in `app.vue`, so `error.vue` renders
inside the same shell through `<NuxtLayout>`.

### 3.4 Prerendering

`nuxt generate` only prerenders pages reachable by links from `/`. The anti-stress and Thai
pages are linked from nowhere, so a crawl-only build would drop them without any error.
`nuxt.config.ts` lists all 9 routes in `nitro.prerender.routes` (from `shared/utils/routes.ts`),
and a test asserts that each produces `index.html`.

### 3.5 Routes

| Route | In sitemap (priority) | Linked from |
|---|---|---|
| `/` | yes (1.00) | header |
| `/soins/massage-de-repit/` | yes (0.80) | homepage tile, rates section link |
| `/soins/orthotherapie-kinesitherapie-soin-therapeutique/` | yes (0.80) | homepage tile |
| `/soins/drainage-lymphatique/` | yes (0.80) | homepage tile |
| `/soins/massage-femme-enceinte/` | yes (0.80) | homepage tile |
| `/soins/massage-deep-tissue/` | yes (0.80) | homepage tile |
| `/soins/massage-anti-stress/` | yes (0.80) | nowhere |
| `/soins/massage-thailandais-sur-table/` | no | nowhere (tile unlinked) |
| `/politiques-annulation-confidentialite/` | yes (0.70) | header |

## 4. Visual fidelity layer

The new site reproduces what Vuetify 2 renders; it borrows none of Vuetify's API or class
names. Fidelity lives in three layers (tokens, base, component theme), so a mismatch gets
fixed once, in the layer that owns it, instead of being patched page by page.

### 4.1 Tokens (`@theme` in `main.css`)

- Colours: `kine-green #45818E`, `kine-yellow #FADA93`, `kine-grey #999999`,
  `kine-light-grey #EEEEEE`, Vuetify red `#F44336`, Vuetify link blue `#1976D2`, body text
  `rgba(0,0,0,.87)`, service-page body text `#000000` (Vuetify `black--text`). Nuxt UI's `primary` gets a palette whose 500 shade is `#45818E`.
- Breakpoints: `sm 600px`, `md 960px`, `lg 1264px`, `xl 1904px` (Vuetify 2), replacing
  Tailwind's defaults so every responsive switch happens at the same width as today.
- Container: full width with 12px padding below `md`; max-width 900px at `md`, 1185px at
  `lg`, 1785px at `xl`. 12-column grid with 12px gutters; the page column is `xl:8/12`,
  centred.
- Shadows: Material elevation 2 (cards), 8 (menu) and 12 (tile hover), copied from Vuetify.
- Fonts: `--font-sans` is Lora (400, 500, 600, 700, roman and italic); Sofia 400 for the
  cursive banner.

### 4.2 Vuetify base layer (`@layer base`)

Tailwind's preflight removes heading sizes, list bullets and paragraph margins; Vuetify's
reset keeps or sets them differently. The base layer restores Vuetify 2's element defaults:

- `html { overflow-y: scroll }`, antialiased font smoothing, body Lora 16px/24px.
- `p` margin-bottom 16px; `ul, ol` padding-left 24px with markers; browser-default sizes and
  weights for `h1` to `h3`; in-content links `#1976D2`.
- Vuetify's type scale as utilities: `text-h4` (2.125rem/2.5rem, 400, 0.0073529412em),
  `text-h5` (1.5rem/2rem, 400), `text-h6` (1.25rem/2rem, 500, 0.0125em), `text-subtitle-1`
  (1rem/1.75rem, 400, 0.009375em), with `sm:` variants for the `text-sm-h4` pattern.
- Card metrics: title 1.25rem/2rem, 500, 0.0125em, padding 16px, `word-break: normal`; text
  and subtitle 1rem (the old `variables.scss` override) with 1.375rem line height and 16px
  padding; Vuetify's sibling-spacing rules (for example title followed by text removes the
  text's top padding).

### 4.3 Component mapping

| Vuetify | New |
|---|---|
| `v-app` / `v-main` / `v-container` / `v-row` / `v-col` | Flex column app shell; Tailwind grid with the 4.1 breakpoints and gutters |
| `v-app-bar flat` 100px, logo `max-height=120 contain` with `margin-left: -3em` | `AppHeader`: flex row reproducing the measured boxes, `grow` (Vuetify's `.v-toolbar { flex: 1 1 auto }`) and `contain-layout` (Vuetify's `.v-toolbar { contain: layout }`, keeps a 320px page from scrolling sideways) |
| Nav `v-btn text` on teal (white, uppercase, 14px/500, 1.25px tracking, 36px high, 4px radius) | `UButton`, themed globally; exact-route active state as a white 18% overlay |
| `v-menu` + `v-list` below 1264px | `UDropdownMenu`, themed: 48px items, elevation 8, teal uppercase labels |
| `v-card` + `__title` / `__text` / `__subtitle`, `flat` | `UCard` themed with no ring, no dividers, 4px radius, elevation 2, a flat variant; inner blocks use the 4.2 card metrics |
| `v-simple-table` | Plain `<table>`: 48px rows, 12px uppercase 700 headers with 0.05em tracking, 14px cells, 1px `rgba(0,0,0,.12)` dividers, transparent background |
| `v-img` (background-image div, lazy, fade-in) | `<img>` with `loading="lazy"`, `decoding="async"`, intrinsic `width`/`height`, CSS `aspect-ratio`, `object-fit` cover or contain |
| Hero: two `v-img` toggled at 600px | `<picture>` with a `min-width: 600px` source, `max-height: 600px`, contain; eager with `fetchpriority="high"` |
| `v-hover` elevation 0 to 12 | CSS `hover:` shadow with Vuetify's 280ms `cubic-bezier(.4,0,.2,1)` transition |
| `v-footer app` | `sticky bottom-0` at the end of a `min-h-screen` flex column, `#EEEEEE`; overlays the content while scrolling and ends below it, at any wrapped footer height |
| `v-icon mdi-*` (CDN icon font) | `UIcon`: `i-mdi-menu`, `i-mdi-facebook`, `i-mdi-email`, `i-mdi-phone` |
| `$vuetify.breakpoint.xsOnly` in About | CSS only: `max-w-[200px] max-h-[200px] sm:max-w-none sm:max-h-none` |
| `hidden-md-and-down`, `d-lg-flex`, `d-sm-none`, … | Tailwind responsive utilities on the 4.1 breakpoints |

Using `<img>` also puts every image and its alt text in the prerendered HTML. Today's
`v-img` renders background-image divs that crawlers index poorly.

The footer year is rendered at build time and updated in `onMounted`, so it always shows the
current year without a hydration mismatch.

### 4.4 Baseline measurements (old site, 1440×900)

Captured with agent-browser on 2026-09-23. The implementation re-captures full dumps per
component; these anchor the tokens.

| Element | Measured |
|---|---|
| Body | Lora 16px/24px, `rgba(0,0,0,.87)` |
| App bar | 100px high, white, no shadow |
| Nav button | teal bg, white, 14px/21px 500, 1.25px tracking, uppercase, 36px high, 16px side padding, 4px radius, 20px right margin |
| Container | 1185px wide, 12px padding |
| Grey card | `#EEEEEE`, 4px radius, elevation 2, 40px top margin |
| Floating card header | teal, 20px/32px 700, 0.25px tracking, 8px 16px padding, 60px side margin, `top: -1.5rem` |
| Yellow banner | `#FADA93`, teal 16px/22px 700, 12px 16px padding |
| Rates `th` / `td` | 12px/18px 700 uppercase 0.6px tracking / 14px/21px, both 48px high, 16px side padding, teal |
| About title bar | teal, 16px padding, 72px high, `h2` 34px/40px 400 white |
| Services cursive banner | Sofia 24px/32px 700, teal on yellow, 16px padding |
| Service tile `h3` | 18.72px/22px 700 teal, 8px top margin |
| Service page `h2` | 24px/22px 700, 20px bottom margin |
| Footer | fixed, 40px, `#EEEEEE`, 6px 16px padding |
| Content links | `#1976D2` |
| `html` | `overflow-y: scroll`; antialiased |

## 5. Page composition

- `app.vue`: `UApp` wrapping `<NuxtLayout>` and `<NuxtPage />`. Holds site-wide head tags (6.1).
- `layouts/default.vue`: `AppHeader`, a `<main>` with the centred content column, `AppFooter`.
- `index.vue`: `HomeIntroduction` (mb 20px), `HomeRates` (mb 40px), `HomeAbout` (mb 40px),
  `HomeServices`, in that order.
- `HomeRates`: two `InfoCard`s (care types, rates with two tables and travel fees, insurance
  note, RMPQ badge), then the three schedule cards in a two-column grid with the third
  centred.
- `HomeServices`: six `ServiceTile`s in a 3-column grid from 600px. Five link to their
  pages; the Thai tile has no link but lifts on hover like the others, as it does today.
- `ServicePage`: teal title bar with the page `h1` (`text-h5 sm:text-h4`, 700, centred,
  20px top margin) and a 20px-padded body slot whose text is `#000000`. Each soins page and the policies page keep
  their current markup inside it.
- Content text, including typographic apostrophes, non-breaking spaces and emoji, is copied
  verbatim from the reference branch.

## 6. SEO layer

### 6.1 Kept exactly

Taken from the deployed `gh-pages` HTML:

- `<html lang="fr">`, `charset utf-8`, `viewport width=device-width,initial-scale=1`,
  `theme-color #ffffff`.
- Per-page `<title>` (subject to 6.2.6), `description` and `canonical` with trailing slash.
- Icons: `favicon.ico` (`icon` and `shortcut icon`), `apple-touch-icon` 180×180,
  `favicon-32x32.png`, `favicon-16x16.png`, `manifest` → `/site.webmanifest`,
  `mask-icon` → `/safari-pinned-tab.svg` with `color="#4d8591"`.
- Tags previously added by `@nuxtjs/pwa`: `mobile-web-app-capable=yes`,
  `apple-mobile-web-app-title` = site title, `og:type=website`, `og:site_name` = site title.
- Heading structure, including the homepage's single `h1` "Détail des techniques".
- `public/site.webmanifest` and `public/CNAME`, unchanged byte for byte.
- URL shape: Nuxt writes `route/index.html`, so GitHub Pages serves `/soins/x/` and
  301-redirects `/soins/x` to it, as today.

Site title: `Virginie Dang | Masso-kinésithérapeute & Orthothérapeute | Clermont, Charlevoix`.
Site description: `Massage thaïlandais sur table, Massage des tissus profonds (Deep Tissue),
Orthothérapie, Kinésithérapie, Massage pour femme enceinte, Massage anti-stress, Drainage
lymphatique, Soin thérapeutique`.

### 6.2 Approved deltas

1. Social meta: Per-page `og:title` and `og:description` equal to the page's title and
   description (today every subpage repeats the homepage values). New on every page:
   `og:url` (canonical), `og:locale=fr_CA`, `og:image`
   `https://kine-serenite.ca/img/virginie_dang_massage_2026.png` with `og:image:width=1531`,
   `og:image:height=532`, `og:image:type=image/png` and `og:image:alt` (the hero alt text),
   and `twitter:card=summary_large_image`. Pages call `usePageSeo({ title, description, path })`.
2. Alt text: Descriptive French alt text on every service photo (all `alt=""` today).
   Wording is drafted in the implementation plan after looking at each image.
3. Sitemap: Generated by `@nuxtjs/sitemap` at `/sitemap.xml`: the 8 URLs and priorities
   of 3.5, `changefreq=monthly`, no `lastmod`, no XSL stylesheet. The Thai page is excluded.
4. robots.txt: Generated by `@nuxtjs/robots`: all crawlers allowed (no
   `Disallow: /_nuxt/`), same `Sitemap: https://kine-serenite.ca/sitemap.xml` line. Any
   robots meta tag the module adds must say `index, follow` on indexable pages.
5. JSON-LD through `nuxt-schema-org`: `WebSite` and `WebPage` on every page, plus one
   identity node, declared with `defineLocalBusiness`, `type: 'LocalBusiness'` and
   `'@type': 'HealthAndBeautyBusiness'`, so the node resolves as
   `["Organization","LocalBusiness","HealthAndBeautyBusiness"]`:
   - `name: Kiné-Sérénité`, `url`, `logo`
     (`/img/virginie_dang_massotherapeute_logo_2026.png`), `image` (hero). nuxt-schema-org
     always moves `logo` onto its own `#organization` node for a non-plain-Organization
     identity; the logo stays in the graph there.
   - `founder`: Person "Virginie Dang"
   - `telephone: +1-418-790-1294`, `email: virginiedang.massotherapeute@gmail.com`
   - `address`: 2 rue Beauregard, Clermont, QC, G4A 0A2, CA
   - `openingHoursSpecification`: Tuesday, 09:00 to 17:30, resolved as an
     `OpeningHoursSpecification`
   - `areaServed`: the travel-fee towns (Clermont, Sainte-Agnès, Pointe-au-Pic,
     Cap-à-l'Aigle, Saint-Fidèle, Saint-Hilarion, Notre-Dame-des-Monts, Saint-Aimé-des-Lacs,
     Baie-Saint-Paul, Saint-Siméon, Les Éboulements, Saint-Irénée)
   - `sameAs`: the Facebook page, the GoRendezvous page and the RMPQ member listing

   The clinic days at Physiothérapie France Roy stay on the page only: a second address on
   the same business would mislead, and the clinic is not her business. Prices are left out
   because they change often and would drift from the page.
6. Titles: `"<Page> |  Virginie Dang | …"` becomes `"<Page> | Virginie Dang | …"`.

### 6.3 Migration safety

- Service worker kill switch: The old site registers a Workbox worker at `/sw.js`
  (cache id `kine-serenite-prod`, `CacheFirst` on `/_nuxt/`, `NetworkFirst` on pages).
  `public/sw.js` becomes a worker that, on install, calls `skipWaiting()`; on activate,
  deletes every Cache Storage entry, unregisters itself and navigates open clients to their
  current URL. Browsers re-fetch `/sw.js` on navigation, so returning visitors drop the old
  worker on their next visit. New pages register no worker. The file stays indefinitely.
- 404: GitHub Pages serves the generated `404.html` with HTTP 404 for unknown paths. It
  renders `error.vue` inside the site header and footer: "Page introuvable", a link back to
  Accueil, and `robots: noindex`. Today GitHub's generic 404 page is shown.
  Nuxt prerenders `/404.html` as an empty SPA shell (no server render), and it has no option
  to change that. A Nitro `prerender:generate` hook in `nuxt.config.ts` skips that shell and
  writes the server-rendered error page of an internal unknown route to `404.html` instead,
  so the 404 content is in the static HTML. The internal route is `/erreur-404/`;
  @nuxtjs/robots skips `/__*` paths, which is one reason for the name. The hook also skips
  the route's own `index.html` and `_payload.json`, so it leaves no file of its own and no
  sitemap entry, and it strips the `_payload.json` preload link and the `data-src` attribute
  from the written HTML, so the page uses its inline payload and fires no request.
  Nuxt renders error pages through its internal `/__nuxt_error` endpoint, which
  @nuxtjs/robots always skips, so `error.vue` sets `robots: noindex` itself through
  `useHead` rather than through `useRobotsRule`. It also clears `payload.path` during the
  server render, so a visitor's address bar keeps the URL they typed instead of
  `/erreur-404/`. The body sentence shows only on a 404, not on other errors.

## 7. Testing and verification

### 7.1 Automated tests (vitest, CI)

Run after `nuxt generate`, against `.output/public`:

- SEO baseline: `test/fixtures/seo-baseline.json` holds, per route, the title,
  description, canonical and `h1` extracted from the deployed `gh-pages` HTML (commit
  `9236071`). Tests assert the new output matches, with only the 6.2.6 whitespace delta.
  The extraction script is run once from a scratch directory and not committed, so the repo
  does not depend on the sibling checkout.
- New tags: Per-page `og:title`, `og:description`, `og:url`; `og:image` and its
  dimensions; `og:locale`; `twitter:card`; JSON-LD present with the identity fields of 6.2.5;
  `lang="fr"`; icon and manifest links; `noindex` on `404.html`.
- Output integrity: `index.html` for each of the 9 routes; `404.html`, the `sw.js` kill
  switch and `CNAME` present; every tracked file of the old `static/` (except `README.md`)
  present.
- Sitemap and robots: Exactly the 8 expected `<loc>` values with trailing slashes and the
  `https://kine-serenite.ca` origin; robots content as in 6.2.4.
- Links and images: Every internal `href` resolves to a generated file, page links end
  in `/`; every `<img>` has a non-empty `alt` and a `src` that exists in the output.
- Each test is written before the code it covers and must fail first; the test and the code
  land in the same commit.

### 7.2 Visual verification (in-session)

- Reference: old dev server on `:3000`. Candidate: the new site's `generate` output on
  `:3001`, served like GitHub Pages (directory index, 301 to trailing slash, `404.html`
  fallback). The production artifact is tested, not dev mode.
- Matrix: 9 routes × 5 viewports (390×844, 768×1024, 1024×768, 1440×900, 1920×1080) = 45
  full-page comparisons. Interactive states: hamburger open at 390 and 1024, service tile
  hover, nav button hover and active state, footer mid-scroll.
- Capture protocol: wait for `document.fonts.ready`; scroll through the page to trigger lazy
  images, then back to the top; disable transitions and animations; same Chrome build for
  both sides.
- Pass 1, agent-browser: full-page `agent-browser screenshot --full` of both sites per
  cell, diffed by a scratch pixelmatch script (the same one pass 2 uses, so both passes apply
  the same threshold), plus a geometry and computed-style dump of every element with its own
  text and every image, compared at ±1px.
- Pass 2, Chrome DevTools MCP: The same matrix run independently: `resize_page`,
  `navigate_page`, `evaluate_script`, full-page `take_screenshot`, pixel diff by a scratch
  script. Plus `lighthouse_audit` on every route for both sites, `list_console_messages`
  (no errors, no hydration warnings) and `list_network_requests` (no Google Fonts or
  jsDelivr requests). `resize_page` reaches only 1024 and 1440 in the MCP's headful Chrome;
  768 and 1920 use `emulate` at DPR 2; 390 uses `emulate` at DPR 1 because of Chrome's
  16384px capture limit. The rightmost 15 CSS px (the classic scrollbar) are not compared
  in pass 2; pass 1 covers them.
- Pass threshold: At most 0.5% differing pixels per screenshot at colour threshold 0.1,
  page height within ±2px, and every remaining diff region inspected and attributed to
  antialiasing or sub-pixel rounding. A structural diff is fixed at the token, base or theme
  layer, and then the whole matrix is re-run. A cell whose differing pixels all fall inside
  `<img>` boxes is accepted as a resampling difference instead, because Chromium resamples
  the 1920px sources differently for `<img>` than for the old CSS `background-image`; it
  passes only with 0 differing pixels outside those boxes, and the masked counts are
  recorded. Known cells: `/soins/massage-thailandais-sur-table/` at 390×844 and 1024×768,
  and the `menu-1024` state, whose only other pixels are known antialiasing clusters.
- Screenshots, diff images and reports stay in a verification workspace outside both
  repositories, not in the session scratchpad.

## 8. Build and deployment

### 8.1 Build

`package.json` scripts: `dev`, `generate` (output `.output/public`), `preview` (serves
`.output/public` like GitHub Pages), `lint`, `typecheck`, `test`. There is no server build
and no environment variable.

### 8.2 CI (`.github/workflows/ci.yml`, replacing the scaffold's)

- Triggers: every push and pull request. Top-level `permissions: contents: read`.
- Job `check`: checkout; `pnpm/action-setup` (reads `packageManager`); `actions/setup-node`
  with `node-version-file: .nvmrc` and `cache: pnpm`; `pnpm install --frozen-lockfile`;
  lint; typecheck; generate; test; on `main` only, `actions/upload-pages-artifact` with
  `.output/public`.
- Job `deploy`: runs only for pushes to `main`, `needs: check`, `permissions: pages: write,
  id-token: write`, environment `github-pages` with the page URL, `actions/deploy-pages`,
  `concurrency: { group: pages, cancel-in-progress: false }`.
- Actions pinned to their latest major tags; Renovate keeps them current.

### 8.3 Repository and cutover

Each step reaches outside the machine and gets an explicit go-ahead before it runs, or is
done by the owner.

Current state (2026-09-23): the old repo is public, Pages uses the legacy `gh-pages` source
with `cname: kine-serenite.ca`, HTTPS enforced, certificate for `kine-serenite.ca` only,
expiring 2026-11-18. The domain is **not** verified on the account. Apex A records point to
185.199.108.153 to 185.199.111.153; no AAAA records.

1. Verify the domain on the GitHub account (owner, at the Squarespace DNS): TXT record
   `_github-pages-challenge-damienbeaufils.kine-serenite.ca`. During cutover the domain
   belongs to no repo; an unverified domain with A records pointing at GitHub can be claimed
   by another account in that window. This step is strongly recommended.
2. Create `damienbeaufils/kine-serenite-2026` (public, so Pages stays free), push `main`,
   set the Pages source to GitHub Actions. The first deploy runs.
3. Pre-cutover check: The `github.io` URL serves the site under `/kine-serenite-2026/`,
   which breaks absolute `/img` and `/_nuxt` paths, so it is not a valid test. Instead,
   download the CI artifact, serve it locally, re-run the tests and a visual spot check.
4. Cutover, at a quiet hour: turn off GitHub Pages on the old repo, which releases the
   domain (the only change to the old repo, and a setting rather than code). Removing the
   custom domain from a branch-based Pages site instead would make GitHub commit a `CNAME`
   change to the old `gh-pages` branch. Then add the domain to the new repo, wait for the
   certificate (minutes, up to about an hour) and enforce HTTPS. DNS is unchanged.
5. Live checks: Every route returns 200; `/soins/x` 301-redirects to `/soins/x/`;
   canonicals, sitemap, robots and JSON-LD are live; the kill-switch `sw.js` is served;
   HTTPS is enforced; an unknown URL returns the French 404.
6. Rollback: The old `gh-pages` branch is untouched; removing the domain from the new repo
   and turning the old repo's Pages back on with its domain takes minutes.

## 9. Risks

| Risk | Mitigation |
|---|---|
| Tailwind preflight differs from Vuetify's reset | Vuetify base layer (4.2), computed-style diffs in 7.2 |
| Nuxt UI component DOM differs from Vuetify's (extra wrappers, portalled menu) | Global theme plus per-use `ui` props; geometry dump catches drift |
| Unlinked routes silently not prerendered | Explicit `nitro.prerender.routes`, integrity test |
| Returning visitors keep the old service worker | Kill-switch `sw.js` at the same URL |
| TypeScript 7 breaks lint and typecheck | Pin 6.0.3 with a Renovate rule |
| Build-time footer year causes a hydration mismatch | Build year in HTML, current year set in `onMounted` |
| Domain claimed by another account during cutover | Verify the domain first (8.3.1) |
| Certificate provisioning delay after the domain move | Quiet-hour cutover, rollback in minutes |
| pnpm build-script allowlist blocks a needed postinstall | Toolchain task runs install, generate and preview to confirm |

## 10. Commit sequence (outline)

This spec is the repository's first commit. The implementation plan details each task that
follows: one commit per task, each leaving lint, typecheck, generate and tests green.

1. Scaffold as created (baseline)
2. Toolchain: `.nvmrc`, latest dependencies, TypeScript pin, Renovate rule, test harness
3. Template cleanup (demo components, template licence, simple-icons) and static assets
4. Theme tokens, breakpoints, Vuetify base layer, self-hosted fonts, local icons
5. Site head, `usePageSeo`, route list and SEO baseline tests
6. `ServicePage` with the card theme, and the policies page
7. App shell: layout, header, footer, button and menu theme
8. One commit per soins page
9. Homepage sections, one commit each (services last, with the link checks)
10. Sitemap and robots
11. French 404
12. JSON-LD
13. Social meta and alt text
14. Service worker kill switch
15. CI and deploy workflow
16. One commit per verification fix
17. README

Each page exists before the first commit that links to it, because `nuxt generate` crawls
links and fails on a missing page. A comment-hygiene pass runs before any push.
