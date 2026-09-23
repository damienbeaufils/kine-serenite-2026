# kine-serenite.ca Nuxt 4 Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild kine-serenite.ca in `kine-serenite-2026` on Node 24, Nuxt 4 and Nuxt UI, with the same 9 pages, a near pixel-perfect render, no SEO regression, and static deployment to GitHub Pages from GitHub Actions.

**Architecture:** A statically generated Nuxt 4 site. Nuxt UI primitives (`UApp`, `UButton`, `UDropdownMenu`, `UCard`, `UIcon`) are themed in `app.config.ts` to Vuetify 2's metrics. `main.css` holds Tailwind tokens (Vuetify breakpoints, colours, elevations), a Vuetify base layer, Vuetify-like component classes (`v-container`, `v-row`, `v-col`, `card-*`) and a Vuetify type scale. Every page is prerendered from an explicit route list. Vitest tests run against the generated `.output/public`, and screenshots of the old and new sites are compared pixel by pixel.

**Tech Stack:** Node 24, pnpm 12, Nuxt 4.5, Nuxt UI 4.11 (with `@nuxt/fonts`, `@nuxt/icon`), Tailwind CSS 4.3, `@nuxtjs/sitemap`, `@nuxtjs/robots`, `nuxt-schema-org`, Vitest, cheerio, serve, agent-browser, Chrome DevTools MCP, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-09-23-nuxt4-overhaul-design.md` (read it before starting any task).

## Global Constraints

- Node: `.nvmrc` contains `24`; CI reads it through `node-version-file: .nvmrc`.
- Package manager: pnpm, version from `packageManager` (`pnpm@12.5.1`); CI installs with `pnpm install --frozen-lockfile`.
- Dependencies: latest versions at install time, except `typescript` pinned to `6.0.3` (typescript-eslint requires `typescript >=4.8.4 <6.1.0`; `typescript@7.0.2` has no `lib/typescript.js`). A Renovate rule keeps it below 6.1.
- The old repository `/Users/damienbeaufils/IdeaProjects/ks/kine-serenite` is read-only: read it with `git show`, `git ls-files` or `git archive`, and only run its dev server. Never edit, checkout, commit or install there.
- Reference commit for content: `9236071` (branch `new-version-may-2026`). SEO baseline: `gh-pages` commit `2e2be810fa314bc8bec5cd141aaa697b8a32d390`.
- Content text, typographic apostrophes (`’`), `&nbsp;` entities, dashes and emoji are copied verbatim from the reference commit. When a code block in this plan and the old file disagree, the old file wins.
- URLs end with `/` everywhere (routes, canonicals, internal links, sitemap). Site URL: `https://kine-serenite.ca`.
- Breakpoints: `sm 600px`, `md 960px`, `lg 1264px`, `xl 1904px`. Container max-width 900px at `md`, 1185px at `lg`, 1785px at `xl`.
- Colours: `#45818E` teal, `#FADA93` yellow, `#999999` grey, `#EEEEEE` light grey, `#F44336` red, `#1976D2` link blue, body text `rgba(0,0,0,.87)`, service-page body text `#000000`.
- Light mode only (`ui.colorMode: false`).
- Where Vuetify and Nuxt UI disagree, the old render wins.
- Visual pass threshold: at most 0.5% differing pixels per screenshot at colour threshold 0.1, page height within ±2px, every remaining diff region explained (antialiasing or sub-pixel rounding only).
- Commits: one per task, directly on `main`, gitmoji subject, files added by explicit path (never `git add -A` or `git add .`). Before committing, run the message through the `humanizer` skill in embedded mode (user rule). Every commit leaves `pnpm lint && pnpm typecheck && pnpm generate && pnpm test` green.
- Nothing is pushed before Task 28. Every step that reaches GitHub (repo creation, push, Pages settings, domain) needs the owner's explicit go-ahead at that moment.

## Review Focus

1. A returning visitor still controlled by the old Workbox service worker must get the new site on their next visit, with old caches gone. Test: Task 23, Step 5 (browser check).
2. Glyphs outside Google's `latin` subset (the `ĉ` in "Relaĉhe" on the anti-stress page) must render in Lora, not a fallback font. Test: Task 4 (`covers latin-ext glyphs such as ĉ with Lora`), plus the anti-stress cells of the Task 25 matrix.
3. Old URLs without a trailing slash (`/soins/massage-de-repit`) must 301 to the slashed URL, and the header's `/#techniques` and `/#a-propos` links must land on the right section when clicked from a service page. Test: Task 18, Steps 7 and 8.
4. Icons must render on GitHub Pages, where Nuxt Icon's server endpoint does not exist. Test: Task 7 (`does not depend on a remote icon API`) and Task 7, Step 9 (network check).
5. Viewport edges: the header must switch from hamburger to buttons at exactly 1264px, and a 320px-wide phone must render like the old site. Test: Task 25, Step 3 (1263, 1264 and 320 cells).

---

## Conventions for every task

- Every shell needs Node set up (shell state does not persist between commands):
  - new repo: `cd /Users/damienbeaufils/IdeaProjects/ks/kine-serenite-2026 && source ~/.nvm/nvm.sh && nvm use 24 >/dev/null`
  - old repo: `cd /Users/damienbeaufils/IdeaProjects/ks/kine-serenite && source ~/.nvm/nvm.sh && nvm use 16 >/dev/null`
- Old site: must answer on `http://localhost:3000`. Check with `curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/`. If it does not print `200`, start it in the background: `cd /Users/damienbeaufils/IdeaProjects/ks/kine-serenite && source ~/.nvm/nvm.sh && nvm use 16 && npm run dev`.
- New site: `pnpm generate && pnpm preview` serves `.output/public` on `http://localhost:3001` (GitHub Pages behaviour: directory index, 301 to trailing slash, `404.html` fallback). Stop any previous preview first (`lsof -ti tcp:3001 | xargs kill 2>/dev/null`). `pnpm dev` also uses port 3001; never run both.
- Verification workspace (outside both repos, never committed): `/Users/damienbeaufils/IdeaProjects/ks/.verify-2026`, created in Task 0. Referred to as `$V` below: `V=/Users/damienbeaufils/IdeaProjects/ks/.verify-2026`.
- Code blocks show file contents. After writing Vue/TS files, run `pnpm lint --fix` to apply the repository's formatting (attribute wrapping, quotes), then `pnpm lint` must pass with no errors.
- The full check before every commit: `pnpm lint && pnpm typecheck && pnpm generate && pnpm test`.

## File map (end state)

```
.github/workflows/ci.yml          CI checks + Pages deploy (Task 24)
.nvmrc                            24 (Task 2)
serve.json                        GitHub Pages-like preview config (Task 2)
vitest.config.ts                  Vitest config (Task 2)
nuxt.config.ts                    modules, head, prerender, fonts, icons, SEO modules
eslint.config.mjs                 scaffold config + component-class detection (Task 4)
renovate.json                     nuxt preset + TypeScript pin (Task 2)
README.md                         project README (Task 27)
shared/utils/site.ts              SITE_URL, SITE_TITLE, SITE_DESCRIPTION, HERO_ALT, pageTitle()
shared/utils/routes.ts            PRERENDER_ROUTES (single source for prerender + tests)
app/app.vue                       UApp + NuxtLayout + site-wide head
app/app.config.ts                 Nuxt UI colours and component theme
app/error.vue                     French 404 (Task 20)
app/layouts/default.vue           header, centred content column, footer (Task 7)
app/assets/css/main.css           tokens, base layer, component classes, type scale (Task 4)
app/composables/usePageSeo.ts     per-page title, description, canonical, og:*
app/utils/image-alt.ts            IMAGE_ALT map (Task 22)
app/components/AppHeader.vue      logo, nav buttons, hamburger menu (Task 7)
app/components/AppFooter.vue      fixed footer (Task 7)
app/components/ServicePage.vue    teal-title card shell (Task 6)
app/components/InfoCard.vue       grey card with floating teal header (Task 16)
app/components/home/HomeIntroduction.vue  (Task 15)
app/components/home/HomeRates.vue         (Task 16)
app/components/home/RatesTable.vue        (Task 16)
app/components/home/HomeAbout.vue         (Task 17)
app/components/home/HomeServices.vue      (Task 18)
app/components/home/ServiceTile.vue       (Task 18)
app/pages/index.vue
app/pages/politiques-annulation-confidentialite.vue
app/pages/soins/{drainage-lymphatique,massage-anti-stress,massage-de-repit,massage-deep-tissue,massage-femme-enceinte,massage-thailandais-sur-table,orthotherapie-kinesitherapie-soin-therapeutique}.vue
public/                           old static/ files (tracked, minus README.md), sw.js kill switch
test/global-setup.ts              fails fast when .output/public is missing
test/helpers/output.ts            output paths, cheerio loader, text normaliser
test/fixtures/seo-baseline.json   per-route title/description/canonical/h1/text from the live site
test/fixtures/static-files.json   old static file list with sha256
test/output.test.ts  test/assets.test.ts  test/head.test.ts  test/content.test.ts
test/shell.test.ts   test/links.test.ts   test/sitemap.test.ts  test/schema.test.ts  test/images.test.ts
```

The spec places the header and footer in `app.vue`. This plan puts them in `app/layouts/default.vue` so `error.vue` can reuse the same shell through `<NuxtLayout>`; `app.vue` keeps the site-wide head.

Task order avoids dangling internal links: `nuxt generate` crawls links, so a page must exist before anything links to it. The policies page comes before the header, service pages before the homepage sections that link to them.

---

### Task 0: Verification workspace (outside the repo, no commit)

**Files (all under `/Users/damienbeaufils/IdeaProjects/ks/.verify-2026/`):**
- Create: `package.json`, `extract-baseline.mjs`, `settle.js`, `shot.sh`, `pixeldiff.mjs`, `compare.sh`, `probe.js`, `probe.sh`, `compare-probes.mjs`, `matrix.sh`

**Interfaces:**
- Produces: `fixtures/seo-baseline.json` and `fixtures/static-files.json` (copied into the repo by Tasks 3 and 5); `compare.sh <route> <width> <height> [WxH+X+Y]` printing one JSON line with `ratio` (percent), `heightDelta` and `pass`; `probe.sh <route> <width> <height>` printing style/geometry differences; `matrix.sh [extra cells…]`.

- [ ] **Step 1: Create the workspace and its dependencies**

```bash
mkdir -p /Users/damienbeaufils/IdeaProjects/ks/.verify-2026/out /Users/damienbeaufils/IdeaProjects/ks/.verify-2026/fixtures
cd /Users/damienbeaufils/IdeaProjects/ks/.verify-2026
cat > package.json <<'EOF'
{
  "name": "kine-verify",
  "private": true,
  "type": "module"
}
EOF
source ~/.nvm/nvm.sh && nvm use 24 >/dev/null && npm install cheerio@latest pixelmatch@latest pngjs@latest
```

- [ ] **Step 2: Write `extract-baseline.mjs`**

```js
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import * as cheerio from 'cheerio'

const OLD = '/Users/damienbeaufils/IdeaProjects/ks/kine-serenite'
const GH_PAGES = '2e2be810fa314bc8bec5cd141aaa697b8a32d390'
const SOURCE = '9236071'
const ROUTES = [
  '/',
  '/politiques-annulation-confidentialite/',
  '/soins/drainage-lymphatique/',
  '/soins/massage-anti-stress/',
  '/soins/massage-de-repit/',
  '/soins/massage-deep-tissue/',
  '/soins/massage-femme-enceinte/',
  '/soins/massage-thailandais-sur-table/',
  '/soins/orthotherapie-kinesitherapie-soin-therapeutique/'
]
const NOT_COPIED_AS_IS = new Set(['README.md', 'robots.txt', 'sitemap.xml'])

const git = (args, encoding = 'utf8') => execFileSync('git', ['-C', OLD, ...args], { encoding, maxBuffer: 64 * 1024 * 1024 })
const normalize = text => text.replace(/[ \t\n\r\f]+/g, ' ').trim()

const pages = {}
for (const route of ROUTES) {
  const file = route === '/' ? 'index.html' : `${route.slice(1)}index.html`
  const $ = cheerio.load(git(['show', `${GH_PAGES}:${file}`]))
  pages[route] = {
    title: $('title').text(),
    description: $('meta[name="description"]').attr('content'),
    canonical: $('link[rel="canonical"]').attr('href'),
    h1: $('h1').map((_, el) => normalize($(el).text())).get(),
    text: normalize($('.v-main').text())
  }
}

const staticFiles = {}
for (const path of git(['ls-files', 'static']).split('\n').filter(Boolean)) {
  const relative = path.replace(/^static\//, '')
  if (NOT_COPIED_AS_IS.has(relative)) continue
  staticFiles[relative] = createHash('sha256').update(git(['show', `${SOURCE}:${path}`], 'buffer')).digest('hex')
}

writeFileSync('fixtures/seo-baseline.json', `${JSON.stringify({ source: `kine-serenite gh-pages ${GH_PAGES} (built from ${SOURCE})`, pages }, null, 2)}\n`)
writeFileSync('fixtures/static-files.json', `${JSON.stringify(staticFiles, null, 2)}\n`)
console.log(`${Object.keys(pages).length} pages, ${Object.keys(staticFiles).length} static files`)
```

- [ ] **Step 3: Run it and inspect the output**

Run: `cd $V && node extract-baseline.mjs && head -c 1500 fixtures/seo-baseline.json`
Expected: `9 pages, 33 static files` (the old repo tracks 36 files under `static/`; `README.md`, `robots.txt` and `sitemap.xml` are left out). The home entry has `"h1": ["Détail des techniques"]`, a canonical of `https://kine-serenite.ca/`, and a `text` starting with `Les types de soin offerts`.

- [ ] **Step 4: Write `settle.js` (run in the page before any capture)**

```js
(async () => {
  const style = document.createElement('style')
  style.textContent = '*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important}'
  document.head.appendChild(style)
  for (let y = 0; y < document.documentElement.scrollHeight; y += 300) {
    window.scrollTo(0, y)
    await new Promise(resolve => setTimeout(resolve, 80))
  }
  window.scrollTo(0, 0)
  await document.fonts.ready
  await Promise.all([...document.images].map(img => img.complete ? null : new Promise(resolve => { img.onload = img.onerror = resolve })))
  await new Promise(resolve => setTimeout(resolve, 800))
  return true
})()
```

- [ ] **Step 5: Write `shot.sh`**

```bash
#!/usr/bin/env bash
# usage: shot.sh <session> <url> <width> <height> <out.png>
set -euo pipefail
cd "$(dirname "$0")"
SESSION=$1 URL=$2 W=$3 H=$4 OUT=$5
ab() { agent-browser --session "$SESSION" "$@"; }
ab set viewport "$W" "$H" >/dev/null
ab open "$URL" >/dev/null
ab wait --load load >/dev/null
ab eval --stdin < settle.js >/dev/null
ab screenshot --full "$OUT" >/dev/null
echo "$OUT"
```

- [ ] **Step 6: Write `pixeldiff.mjs`**

```js
import { readFileSync, writeFileSync } from 'node:fs'
import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'

const [fileA, fileB, fileDiff] = process.argv.slice(2)
const a = PNG.sync.read(readFileSync(fileA))
const b = PNG.sync.read(readFileSync(fileB))
const width = Math.max(a.width, b.width)
const height = Math.max(a.height, b.height)
const pad = (img) => {
  if (img.width === width && img.height === height) return img
  const padded = new PNG({ width, height })
  padded.data.fill(255)
  PNG.bitblt(img, padded, 0, 0, img.width, img.height, 0, 0)
  return padded
}
const diff = new PNG({ width, height })
const diffPixels = pixelmatch(pad(a).data, pad(b).data, diff.data, width, height, { threshold: 0.1 })
writeFileSync(fileDiff, PNG.sync.write(diff))
const ratio = diffPixels / (width * height)
const heightDelta = b.height - a.height
console.log(JSON.stringify({ old: fileA, new: fileB, diff: fileDiff, width, heightOld: a.height, heightNew: b.height, heightDelta, diffPixels, ratio: Number((ratio * 100).toFixed(3)), pass: ratio <= 0.005 && Math.abs(heightDelta) <= 2 }))
```

- [ ] **Step 7: Write `compare.sh`**

```bash
#!/usr/bin/env bash
# usage: compare.sh <route> <width> <height> [WxH+X+Y crop]
set -euo pipefail
cd "$(dirname "$0")"
ROUTE=$1 W=$2 H=$3 CROP=${4:-}
NAME=$(printf '%s' "$ROUTE" | tr '/' '_' | sed 's/^_//; s/_$//')
NAME=${NAME:-home}
OUT=out/${NAME}-${W}x${H}
mkdir -p "$OUT"
./shot.sh verify-old "http://localhost:3000${ROUTE}" "$W" "$H" "$OUT/old.png" >/dev/null
./shot.sh verify-new "http://localhost:3001${ROUTE}" "$W" "$H" "$OUT/new.png" >/dev/null
if [ -n "$CROP" ]; then
  magick "$OUT/old.png" -crop "$CROP" +repage "$OUT/old-crop.png"
  magick "$OUT/new.png" -crop "$CROP" +repage "$OUT/new-crop.png"
  node pixeldiff.mjs "$OUT/old-crop.png" "$OUT/new-crop.png" "$OUT/diff-crop.png"
else
  node pixeldiff.mjs "$OUT/old.png" "$OUT/new.png" "$OUT/diff.png"
fi
```

- [ ] **Step 8: Write `probe.js` (style and geometry of every element with its own text, and of every image)**

```js
(() => {
  const normalize = text => text.replace(/\s+/g, ' ').trim()
  const out = {}
  const seen = {}
  const add = (key, el) => {
    const rect = el.getBoundingClientRect()
    if (rect.width === 0 && rect.height === 0) return
    seen[key] = (seen[key] || 0) + 1
    const style = getComputedStyle(el)
    out[`${key}#${seen[key]}`] = {
      x: Math.round(rect.left + scrollX), y: Math.round(rect.top + scrollY), w: Math.round(rect.width), h: Math.round(rect.height),
      font: style.fontFamily.split(',')[0].replace(/["']/g, '').trim(), size: style.fontSize, weight: style.fontWeight, style: style.fontStyle,
      lh: style.lineHeight, ls: style.letterSpacing, color: style.color, tt: style.textTransform, deco: style.textDecorationLine
    }
  }
  for (const el of document.querySelectorAll('body *')) {
    if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName) || el.closest('svg')) continue
    const own = normalize([...el.childNodes].filter(node => node.nodeType === 3).map(node => node.textContent).join(' '))
    if (own) add(`text:${own.slice(0, 60)}`, el)
    if (el.tagName === 'IMG') add(`img:${el.currentSrc.split('/').pop()}`, el)
    const background = getComputedStyle(el).backgroundImage
    if (background.startsWith('url(')) add(`img:${background.slice(4, -1).replace(/["']/g, '').split('/').pop()}`, el)
  }
  return out
})()
```

- [ ] **Step 9: Write `compare-probes.mjs` and `probe.sh`**

```js
import { readFileSync } from 'node:fs'

const [a, b] = process.argv.slice(2).map(file => JSON.parse(readFileSync(file, 'utf8')))
const rows = []
for (const key of Object.keys(a)) {
  if (!(key in b)) {
    rows.push([key, 'missing in new'])
    continue
  }
  const differences = []
  for (const prop of ['x', 'y', 'w', 'h']) {
    if (Math.abs(a[key][prop] - b[key][prop]) > 1) differences.push(`${prop} ${a[key][prop]}→${b[key][prop]}`)
  }
  for (const prop of ['font', 'size', 'weight', 'style', 'lh', 'ls', 'color', 'tt', 'deco']) {
    if (a[key][prop] !== b[key][prop]) differences.push(`${prop} ${a[key][prop]}→${b[key][prop]}`)
  }
  if (differences.length) rows.push([key, differences.join(', ')])
}
for (const key of Object.keys(b)) {
  if (!(key in a)) rows.push([key, 'extra in new'])
}
const top = key => a[key]?.y ?? b[key]?.y ?? 0
rows.sort((r1, r2) => top(r1[0]) - top(r2[0]))
console.log(rows.length ? rows.map(row => row.join(' | ')).join('\n') : 'no differences')
```

```bash
#!/usr/bin/env bash
# usage: probe.sh <route> <width> <height>
set -euo pipefail
cd "$(dirname "$0")"
ROUTE=$1 W=$2 H=$3
NAME=$(printf '%s' "$ROUTE" | tr '/' '_' | sed 's/^_//; s/_$//')
NAME=${NAME:-home}
OUT=out/${NAME}-${W}x${H}
mkdir -p "$OUT"
for SIDE in old new; do
  PORT=3000; [ "$SIDE" = new ] && PORT=3001
  agent-browser --session "verify-$SIDE" set viewport "$W" "$H" >/dev/null
  agent-browser --session "verify-$SIDE" open "http://localhost:${PORT}${ROUTE}" >/dev/null
  agent-browser --session "verify-$SIDE" wait --load load >/dev/null
  agent-browser --session "verify-$SIDE" eval --stdin < settle.js >/dev/null
  agent-browser --session "verify-$SIDE" eval --stdin < probe.js > "$OUT/probe-$SIDE.json"
done
node compare-probes.mjs "$OUT/probe-old.json" "$OUT/probe-new.json"
```

- [ ] **Step 10: Write `matrix.sh`**

```bash
#!/usr/bin/env bash
# usage: matrix.sh [extra "route WxH" cells...]
set -euo pipefail
cd "$(dirname "$0")"
ROUTES=(/ /politiques-annulation-confidentialite/ /soins/drainage-lymphatique/ /soins/massage-anti-stress/ /soins/massage-de-repit/ /soins/massage-deep-tissue/ /soins/massage-femme-enceinte/ /soins/massage-thailandais-sur-table/ /soins/orthotherapie-kinesitherapie-soin-therapeutique/)
VIEWPORTS=(390x844 768x1024 1024x768 1440x900 1920x1080)
CELLS=()
for ROUTE in "${ROUTES[@]}"; do for VP in "${VIEWPORTS[@]}"; do CELLS+=("$ROUTE $VP"); done; done
CELLS+=("$@")
: > out/matrix.jsonl
for CELL in "${CELLS[@]}"; do
  ROUTE=${CELL% *} VP=${CELL#* }
  ./compare.sh "$ROUTE" "${VP%x*}" "${VP#*x}" | tee -a out/matrix.jsonl
done
node -e "const l=require('fs').readFileSync('out/matrix.jsonl','utf8').trim().split('\n').map(JSON.parse);const f=l.filter(x=>!x.pass);console.log(l.length+' cells, '+f.length+' failing');for(const x of f)console.log('FAIL',x.new,x.ratio+'%','Δh='+x.heightDelta)"
```

- [ ] **Step 11: Make scripts executable and smoke-test against the old site only**

Run: `cd $V && chmod +x *.sh && ./shot.sh verify-old http://localhost:3000/ 1440 900 out/smoke.png && sips -g pixelHeight out/smoke.png`
Expected: a PNG around 4660px tall, with service tile photos visible (open it to check the lazy images loaded).

No commit: this directory is outside the repository.

---

### Task 1: Commit the scaffold as created

**Files:**
- Commit (unchanged): `.editorconfig`, `.github/workflows/ci.yml`, `.gitignore`, `LICENSE`, `README.md`, `app/`, `eslint.config.mjs`, `nuxt.config.ts`, `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `public/favicon.ico`, `renovate.json`, `tsconfig.json`

**Interfaces:**
- Produces: a baseline commit that later diffs are read against.

- [ ] **Step 1: Confirm the untracked files are the untouched scaffold**

Run: `git status --short`
Expected: exactly the 14 untracked entries listed above (`docs/` is already committed).

- [ ] **Step 2: Install and run the scaffold's own checks**

Run: `pnpm install --frozen-lockfile && pnpm lint && pnpm typecheck`
Expected: both commands exit 0.

- [ ] **Step 3: Commit**

```bash
git add .editorconfig .github/workflows/ci.yml .gitignore LICENSE README.md app eslint.config.mjs nuxt.config.ts package.json pnpm-lock.yaml pnpm-workspace.yaml public/favicon.ico renovate.json tsconfig.json
git commit -m "🎉 scaffold from the Nuxt UI starter template"
```

---

### Task 2: Toolchain, scripts and test harness

**Files:**
- Create: `.nvmrc`, `serve.json`, `vitest.config.ts`, `test/global-setup.ts`, `test/helpers/output.ts`, `test/output.test.ts`
- Modify: `package.json`, `pnpm-lock.yaml`, `renovate.json`, `pnpm-workspace.yaml` (only if pnpm reports new ignored build scripts)

**Interfaces:**
- Produces: scripts `dev`, `generate`, `preview`, `lint`, `typecheck`, `test`; `test/helpers/output.ts` exporting `OUTPUT_DIR: string`, `outputPath(relative: string): string`, `routeFile(route: string): string`, `loadRoute(route: string): CheerioAPI`, `readOutput(relative: string): string`, `allOutputFiles(): string[]`, `normalize(text: string): string`. `OUTPUT_DIR` honours the `SITE_OUTPUT_DIR` environment variable (used by Task 29).

- [ ] **Step 1: Pin Node**

```bash
printf '24\n' > .nvmrc
```

- [ ] **Step 2: Upgrade every dependency to its latest version**

Run:
```bash
pnpm add nuxt@latest @nuxt/ui@latest tailwindcss@latest @iconify-json/lucide@latest @iconify-json/mdi@latest
pnpm add -D @nuxt/eslint@latest eslint@latest eslint-plugin-better-tailwindcss@latest vue-tsc@latest vitest@latest cheerio@latest serve@latest typescript@latest
```
If pnpm prints "Ignored build scripts: <pkg>" for a package not already under `allowBuilds` in `pnpm-workspace.yaml`, add `<pkg>: false` there (same as the scaffold's entries) and re-run `pnpm install`.

- [ ] **Step 3: Confirm TypeScript 7 breaks the toolchain, then pin 6.0.3**

Run: `pnpm typecheck; echo "typecheck exit $?"; pnpm lint; echo "lint exit $?"`
Expected with `typescript@7.x`: at least one of them fails (vue-tsc or typescript-eslint cannot load `typescript/lib/typescript.js`), and pnpm warned that `@typescript-eslint/*` peers require `typescript <6.1.0`. Write down the exact error line for the README (Task 27).

Then run: `pnpm add -D typescript@6.0.3 && pnpm typecheck && pnpm lint`
Expected: both exit 0.

If TypeScript 7 does not break anything, keep `typescript@latest`, skip the Renovate rule in Step 5, and tell the reviewer.

- [ ] **Step 4: Replace the `scripts` block and add `engines` in `package.json`**

```json
  "scripts": {
    "dev": "nuxt dev --port 3001",
    "generate": "nuxt generate",
    "preview": "serve .output/public --listen 3001 --config ../../serve.json",
    "postinstall": "nuxt prepare",
    "lint": "eslint .",
    "typecheck": "nuxt typecheck",
    "test": "vitest run"
  },
  "engines": {
    "node": ">=24"
  },
```

The `--config` path is resolved relative to the served directory, hence `../../serve.json`.

- [ ] **Step 5: Write `renovate.json`**

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["github>nuxt/renovate-config-nuxt"],
  "packageRules": [
    {
      "description": "typescript-eslint supports typescript <6.1.0, and TypeScript 7 ships no JavaScript compiler API for vue-tsc",
      "matchPackageNames": ["typescript"],
      "allowedVersions": "<6.1.0"
    }
  ]
}
```

- [ ] **Step 6: Write `serve.json`**

```json
{
  "trailingSlash": true,
  "directoryListing": false
}
```

- [ ] **Step 7: Write `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'node',
    globalSetup: ['test/global-setup.ts']
  }
})
```

- [ ] **Step 8: Write `test/helpers/output.ts`**

```ts
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import * as cheerio from 'cheerio'

export const OUTPUT_DIR = process.env.SITE_OUTPUT_DIR ?? join(import.meta.dirname, '..', '..', '.output', 'public')

export function outputPath(relative: string): string {
  return join(OUTPUT_DIR, relative)
}

export function routeFile(route: string): string {
  return route === '/' ? 'index.html' : `${route.slice(1)}index.html`
}

export function readOutput(relative: string): string {
  return readFileSync(outputPath(relative), 'utf8')
}

export function loadRoute(route: string): cheerio.CheerioAPI {
  return cheerio.load(readOutput(routeFile(route)))
}

export function allOutputFiles(dir: string = OUTPUT_DIR): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
    entry.isDirectory() ? allOutputFiles(join(dir, entry.name)) : [join(dir, entry.name)]
  )
}

// Collapses ASCII whitespace only, so a no-break space never compares equal to a plain space.
export function normalize(text: string): string {
  return text.replace(/[ \t\n\r\f]+/g, ' ').trim()
}
```

- [ ] **Step 9: Write `test/global-setup.ts`**

```ts
import { existsSync } from 'node:fs'
import { OUTPUT_DIR } from './helpers/output'

export default function setup(): void {
  if (!existsSync(OUTPUT_DIR)) {
    throw new Error(`${OUTPUT_DIR} is missing: run "pnpm generate" before "pnpm test".`)
  }
}
```

- [ ] **Step 10: Write the failing smoke test `test/output.test.ts`**

```ts
import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { outputPath } from './helpers/output'

describe('generated site', () => {
  it('writes the home page', () => {
    expect(existsSync(outputPath('index.html'))).toBe(true)
  })
})
```

- [ ] **Step 11: Run the tests without a build**

Run: `rm -rf .output && pnpm test`
Expected: FAIL with `.output/public is missing: run "pnpm generate" before "pnpm test".`

- [ ] **Step 12: Generate, test and preview**

Run: `pnpm generate && pnpm test`
Expected: PASS (1 test).
Run: `pnpm preview` in the background, then `curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3001/`
Expected: `200`. Stop the preview.

- [ ] **Step 13: Full check and commit**

Run: `pnpm lint --fix && pnpm lint && pnpm typecheck && pnpm generate && pnpm test`

```bash
git add .nvmrc serve.json vitest.config.ts test/global-setup.ts test/helpers/output.ts test/output.test.ts package.json pnpm-lock.yaml renovate.json pnpm-workspace.yaml
git commit -m "⬆️ move to Node 24 and the latest dependencies, add the test harness"
```

---

### Task 3: Replace the template with the site skeleton and copy the static assets

**Files:**
- Delete: `app/components/AppLogo.vue`, `app/components/TemplateMenu.vue`, `LICENSE`
- Modify: `app/app.vue`, `app/pages/index.vue`, `package.json`, `pnpm-lock.yaml`, `test/output.test.ts`
- Create: `public/*` (from the old `static/`), `test/fixtures/static-files.json`

**Interfaces:**
- Consumes: `$V/fixtures/static-files.json` (Task 0), `outputPath` (Task 2).
- Produces: `public/` identical to the old `static/` (minus `README.md`); an empty home page that later tasks fill.

- [ ] **Step 1: Copy the fixture and write the failing static-files test**

Run: `mkdir -p test/fixtures && cp $V/fixtures/static-files.json test/fixtures/static-files.json`

Append to `test/output.test.ts`:

```ts
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

const staticFiles: Record<string, string> = JSON.parse(readFileSync(new URL('./fixtures/static-files.json', import.meta.url), 'utf8'))

describe('static files from the old site', () => {
  it.each(Object.entries(staticFiles))('%s is deployed byte for byte', (file, sha256) => {
    expect(createHash('sha256').update(readFileSync(outputPath(file))).digest('hex')).toBe(sha256)
  })
})
```

Merge the imports at the top of the file: `import { existsSync, readFileSync } from 'node:fs'` and `import { createHash } from 'node:crypto'`.

- [ ] **Step 2: Run it**

Run: `pnpm generate && pnpm test`
Expected: FAIL: most files are missing (ENOENT, e.g. `img/rmpq.jpg`) and `favicon.ico` has the scaffold's hash.

- [ ] **Step 3: Remove the template content**

```bash
git rm -q app/components/AppLogo.vue app/components/TemplateMenu.vue LICENSE
pnpm remove @iconify-json/simple-icons
```

`app/app.vue`:

```vue
<template>
  <UApp>
    <NuxtPage />
  </UApp>
</template>
```

`app/pages/index.vue` (filled from Task 15 on):

```vue
<template>
  <div />
</template>
```

- [ ] **Step 4: Copy the old `static/` into `public/`**

```bash
git -C /Users/damienbeaufils/IdeaProjects/ks/kine-serenite archive --format=tar 9236071 static | tar -x --strip-components=1 -C public
rm public/README.md
```

`robots.txt` and `sitemap.xml` are copied too; Task 19 replaces them with generated versions.

- [ ] **Step 5: Run the tests**

Run: `pnpm generate && pnpm test`
Expected: PASS (34 tests).

- [ ] **Step 6: Full check and commit**

Run: `pnpm lint --fix && pnpm lint && pnpm typecheck && pnpm generate && pnpm test`

```bash
git add app/app.vue app/pages/index.vue package.json pnpm-lock.yaml public test/output.test.ts test/fixtures/static-files.json
git commit -m "🔥 drop the template demo and bring over the site's static files"
```

(`git rm` already staged the deletions.)

---

### Task 4: Design tokens, Vuetify base layer, self-hosted fonts and local icons

**Files:**
- Modify: `app/assets/css/main.css`, `app/app.config.ts`, `nuxt.config.ts`, `eslint.config.mjs`
- Create: `test/assets.test.ts`

**Interfaces:**
- Produces (used by every later template):
  - colours `kine-green`, `kine-yellow`, `kine-grey`, `kine-light-grey`, `vuetify-red`, `vuetify-link`; palette `brand-50…950` (Nuxt UI `primary`)
  - shadows `shadow-elevation-2`, `shadow-elevation-8`, `shadow-elevation-12`; easing `ease-vuetify`
  - fonts `font-sans` (Lora), `font-cursive` (Sofia)
  - component classes (in `@layer components`, overridable by any utility): `v-container`, `v-row`, `v-col`, `card-title`, `card-subtitle`, `card-text`, `card-actions`
  - utilities (usable with `sm:` etc.): `col-3`, `col-4`, `col-6`, `col-8`, `col-9`, `col-12`, `text-h4`, `text-h5`, `text-h6`, `text-subtitle-1`
  - rule: type-scale utilities never set `font-weight`; templates always add `font-normal`, `font-medium` or `font-bold` explicitly next to them.

- [ ] **Step 1: Write the failing test `test/assets.test.ts`**

```ts
import { readFileSync } from 'node:fs'
import { relative } from 'node:path'
import { describe, expect, it } from 'vitest'
import { allOutputFiles, OUTPUT_DIR } from './helpers/output'

const files = allOutputFiles()
const textOf = (extensions: string[]) => files
  .filter(file => extensions.some(extension => file.endsWith(extension)))
  .map(file => readFileSync(file, 'utf8'))
  .join('\n')

const fontFaces = (css: string) => [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)].map(match => match[1]!)

function coversCodePoint(unicodeRange: string, codePoint: number): boolean {
  return unicodeRange.split(',').some((part) => {
    const [start, end] = part.trim().replace(/^U\+/i, '').split('-').map(hex => Number.parseInt(hex, 16))
    return codePoint >= start! && codePoint <= (end ?? start!)
  })
}

describe('fonts', () => {
  const css = textOf(['.css', '.html'])

  it('self-hosts Lora and Sofia', () => {
    const faces = fontFaces(css)
    expect(faces.some(face => /font-family:\s*["']?Lora["']?\s*;/.test(face))).toBe(true)
    expect(faces.some(face => /font-family:\s*["']?Sofia["']?\s*;/.test(face))).toBe(true)
    expect(files.some(file => relative(OUTPUT_DIR, file).startsWith('_fonts/') && file.endsWith('.woff2'))).toBe(true)
  })

  it('covers latin-ext glyphs such as ĉ with Lora', () => {
    const lora = fontFaces(css).filter(face => /font-family:\s*["']?Lora["']?\s*;/.test(face) && /font-style:\s*normal/.test(face))
    expect(lora.some((face) => {
      const range = /unicode-range:\s*([^;]+)/.exec(face)
      return range ? coversCodePoint(range[1]!, 0x109) : false
    })).toBe(true)
  })
})

describe('third-party assets', () => {
  it('loads nothing from Google Fonts or jsDelivr', () => {
    expect(textOf(['.html', '.css', '.js'])).not.toMatch(/fonts\.googleapis\.com|fonts\.gstatic\.com|cdn\.jsdelivr\.net/)
  })
})
```

- [ ] **Step 2: Run it**

Run: `pnpm generate && pnpm test test/assets.test.ts`
Expected: FAIL on `self-hosts Lora and Sofia` and `covers latin-ext glyphs` (the scaffold uses Public Sans).

- [ ] **Step 3: Write `app/assets/css/main.css`**

```css
@import "tailwindcss";
@import "@nuxt/ui";

@theme static {
  --breakpoint-sm: 600px;
  --breakpoint-md: 960px;
  --breakpoint-lg: 1264px;
  --breakpoint-xl: 1904px;
  --breakpoint-2xl: initial;

  --font-sans: "Lora", serif;
  --font-cursive: "Sofia", cursive;

  --color-kine-green: #45818e;
  --color-kine-yellow: #fada93;
  --color-kine-grey: #999999;
  --color-kine-light-grey: #eeeeee;
  --color-vuetify-red: #f44336;
  --color-vuetify-link: #1976d2;

  /* Nuxt UI primary: the 500 shade is what `color="primary"` renders in light mode. */
  --color-brand-50: #f6f9f9;
  --color-brand-100: #ecf2f4;
  --color-brand-200: #d0e0e3;
  --color-brand-300: #b5cdd2;
  --color-brand-400: #7da7b0;
  --color-brand-500: #45818e;
  --color-brand-600: #3b6e79;
  --color-brand-700: #305a63;
  --color-brand-800: #26474e;
  --color-brand-900: #1c3439;
  --color-brand-950: #112024;

  --shadow-elevation-2: 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
  --shadow-elevation-8: 0 5px 5px -3px rgba(0, 0, 0, 0.2), 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12);
  --shadow-elevation-12: 0 7px 8px -4px rgba(0, 0, 0, 0.2), 0 12px 17px 2px rgba(0, 0, 0, 0.14), 0 5px 22px 4px rgba(0, 0, 0, 0.12);

  --ease-vuetify: cubic-bezier(0.4, 0, 0.2, 1);
}

@layer base {
  :root {
    --ui-bg: #ffffff;
    --ui-text: rgba(0, 0, 0, 0.87);
  }

  html {
    overflow-y: scroll;
    font-size: 16px;
  }

  body {
    font-family: var(--font-sans);
    line-height: 1.5;
    color: rgba(0, 0, 0, 0.87);
    background: #ffffff;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Tailwind's preflight flattens headings and lists; Vuetify 2 keeps browser sizes with zero margins. */
  h1 { font-size: 2em; font-weight: 700; }
  h2 { font-size: 1.5em; font-weight: 700; }
  h3 { font-size: 1.17em; font-weight: 700; }
  p { margin-bottom: 16px; }
  ul, ol { padding-left: 24px; }
  ul { list-style: disc; }
  ol { list-style: decimal; }
  ul ul { list-style: circle; }
  a { color: var(--color-vuetify-link); text-decoration: underline; }
}

/* Vuetify's spacing helpers are !important; keeping these classes below the utilities layer gives `mt-1`, `py-2`, `p-5` the same precedence over them. */
@layer components {
  .v-container {
    width: 100%;
    padding: 12px;
    margin-inline: auto;
  }

  @media (width >= 960px) {
    .v-container { max-width: 900px; }
  }

  @media (width >= 1264px) {
    .v-container { max-width: 1185px; }
  }

  @media (width >= 1904px) {
    .v-container { max-width: 1785px; }
  }

  .v-row {
    display: flex;
    flex-wrap: wrap;
    flex: 1 1 auto;
    margin: -12px;
  }

  .v-col {
    width: 100%;
    padding: 12px;
  }

  .card-title {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    padding: 16px;
    font-size: 1.25rem;
    font-weight: 500;
    letter-spacing: 0.0125em;
    line-height: 2rem;
    word-break: normal;
  }

  .card-subtitle,
  .card-text {
    padding: 16px;
    font-size: 1rem;
    line-height: 1.375rem;
    letter-spacing: 0.0071428571em;
  }

  .card-text { width: 100%; }

  .card-actions {
    display: flex;
    align-items: center;
    padding: 8px;
  }

  .card-title + .card-subtitle,
  .card-title + .card-text,
  .card-subtitle + .card-text { padding-top: 0; }

  .card-title + .card-subtitle { margin-top: -16px; }
}

@utility col-3 { flex: 0 0 25%; max-width: 25%; }
@utility col-4 { flex: 0 0 33.3333333333%; max-width: 33.3333333333%; }
@utility col-6 { flex: 0 0 50%; max-width: 50%; }
@utility col-8 { flex: 0 0 66.6666666667%; max-width: 66.6666666667%; }
@utility col-9 { flex: 0 0 75%; max-width: 75%; }
@utility col-12 { flex: 0 0 100%; max-width: 100%; }

/* Vuetify's type scale is !important, so it beats the card metrics it is combined with. */
@utility text-h4 { font-size: 2.125rem !important; line-height: 2.5rem !important; letter-spacing: 0.0073529412em !important; }
@utility text-h5 { font-size: 1.5rem !important; line-height: 2rem !important; letter-spacing: normal !important; }
@utility text-h6 { font-size: 1.25rem !important; line-height: 2rem !important; letter-spacing: 0.0125em !important; }
@utility text-subtitle-1 { font-size: 1rem !important; line-height: 1.75rem !important; letter-spacing: 0.009375em !important; }
```

- [ ] **Step 4: Write `app/app.config.ts`**

```ts
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'brand',
      neutral: 'neutral'
    }
  }
})
```

- [ ] **Step 5: Update `nuxt.config.ts`**

```ts
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  ui: {
    colorMode: false
  },

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2026-06-30',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  fonts: {
    defaults: {
      subsets: ['latin', 'latin-ext']
    },
    families: [
      { name: 'Lora', provider: 'google', weights: [400, 500, 600, 700], styles: ['normal', 'italic'] },
      { name: 'Sofia', provider: 'google', weights: [400], styles: ['normal'] }
    ]
  },

  icon: {
    provider: 'none',
    clientBundle: {
      scan: true
    }
  }
})
```

- [ ] **Step 6: Let the Tailwind lint rule recognise the component classes**

In `eslint.config.mjs`, add a rules object to the `withNuxt(...)` call, after the settings object:

```js
  {
    rules: {
      'better-tailwindcss/no-unknown-classes': ['error', { detectComponentClasses: true }]
    }
  }
```

The option is set on this rule only, so `no-conflicting-classes` keeps treating `card-text p-5` as the intended override rather than a conflict.

- [ ] **Step 7: Run the tests**

Run: `pnpm generate && pnpm test`
Expected: PASS. If `covers latin-ext glyphs` still fails, open the generated CSS (`grep -o '@font-face{[^}]*Lora[^}]*}' .output/public/_nuxt/*.css .output/public/index.html | head`) and adjust the `fonts` config until a Lora face declares the latin-ext `unicode-range`.

- [ ] **Step 8: Full check and commit**

Run: `pnpm lint --fix && pnpm lint && pnpm typecheck && pnpm generate && pnpm test`

```bash
git add app/assets/css/main.css app/app.config.ts nuxt.config.ts eslint.config.mjs test/assets.test.ts
git commit -m "🎨 add Vuetify-matched tokens, base styles, self-hosted fonts and local icons"
```

---

### Task 5: Site head, page SEO composable and prerender route list

**Files:**
- Create: `shared/utils/site.ts`, `shared/utils/routes.ts`, `app/composables/usePageSeo.ts`, `test/fixtures/seo-baseline.json`, `test/helpers/baseline.ts`, `test/head.test.ts`
- Modify: `nuxt.config.ts`, `app/app.vue`, `app/pages/index.vue`

**Interfaces:**
- Consumes: `$V/fixtures/seo-baseline.json` (Task 0), `loadRoute`, `normalize` (Task 2).
- Produces:
  - `shared/utils/site.ts`: `SITE_URL: string`, `SITE_TITLE: string`, `SITE_DESCRIPTION: string`, `pageTitle(name: string): string` (auto-imported in app code)
  - `shared/utils/routes.ts`: `PRERENDER_ROUTES: string[]`; each page task appends its route
  - `usePageSeo({ title, description, path }: { title: string, description: string, path: string }): void`
  - `test/helpers/baseline.ts`: `baseline: { source: string, pages: Record<string, BaselinePage> }` with `BaselinePage { title, description, canonical, h1: string[], text }`

- [ ] **Step 1: Copy the baseline fixture, write its loader and the failing test `test/head.test.ts`**

Run: `cp $V/fixtures/seo-baseline.json test/fixtures/seo-baseline.json`

`test/helpers/baseline.ts`:

```ts
import { readFileSync } from 'node:fs'

export interface BaselinePage {
  title: string
  description: string
  canonical: string
  h1: string[]
  text: string
}

export const baseline: { source: string, pages: Record<string, BaselinePage> } = JSON.parse(
  readFileSync(new URL('../fixtures/seo-baseline.json', import.meta.url), 'utf8')
)
```

`test/head.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { PRERENDER_ROUTES } from '../shared/utils/routes'
import { SITE_DESCRIPTION, SITE_TITLE } from '../shared/utils/site'
import { baseline } from './helpers/baseline'
import { loadRoute, normalize } from './helpers/output'

describe('site-wide head', () => {
  const $ = loadRoute('/')
  const content = (selector: string) => $(selector).attr('content')

  it('keeps charset, viewport and theme colour', () => {
    expect($('meta[charset]').attr('charset')?.toLowerCase()).toBe('utf-8')
    expect(content('meta[name="viewport"]')?.replace(/\s/g, '')).toBe('width=device-width,initial-scale=1')
    expect(content('meta[name="theme-color"]')).toBe('#ffffff')
  })

  it('keeps the icon and manifest links', () => {
    const links = $('link').map((_, el) => `${$(el).attr('rel')} ${$(el).attr('href')}`).get()
    expect(links).toEqual(expect.arrayContaining([
      'icon /favicon.ico',
      'apple-touch-icon /apple-touch-icon.png',
      'icon /favicon-32x32.png',
      'icon /favicon-16x16.png',
      'manifest /site.webmanifest',
      'mask-icon /safari-pinned-tab.svg',
      'shortcut icon /favicon.ico'
    ]))
    expect($('link[rel="mask-icon"]').attr('color')).toBe('#4d8591')
    expect($('link[rel="apple-touch-icon"]').attr('sizes')).toBe('180x180')
  })

  it('keeps the web-app and Open Graph site tags', () => {
    expect(content('meta[name="mobile-web-app-capable"]')).toBe('yes')
    expect(content('meta[name="apple-mobile-web-app-title"]')).toBe(SITE_TITLE)
    expect(content('meta[property="og:type"]')).toBe('website')
    expect(content('meta[property="og:site_name"]')).toBe(SITE_TITLE)
  })
})

describe.each(PRERENDER_ROUTES)('%s head', (route) => {
  const $ = loadRoute(route)
  const expected = baseline.pages[route]!

  it('declares French', () => {
    expect($('html').attr('lang')).toBe('fr')
  })

  it('keeps the title, with the double space collapsed', () => {
    expect($('title')).toHaveLength(1)
    expect($('title').text()).toBe(normalize(expected.title))
  })

  it('keeps the description', () => {
    expect($('meta[name="description"]')).toHaveLength(1)
    expect($('meta[name="description"]').attr('content')).toBe(expected.description)
  })

  it('keeps the canonical URL', () => {
    expect($('link[rel="canonical"]')).toHaveLength(1)
    expect($('link[rel="canonical"]').attr('href')).toBe(expected.canonical)
  })

  it('keeps the site-wide Open Graph title and description', () => {
    expect($('meta[property="og:title"]').attr('content')).toBe(SITE_TITLE)
    expect($('meta[property="og:description"]').attr('content')).toBe(SITE_DESCRIPTION)
  })
})
```

- [ ] **Step 2: Run it**

Run: `pnpm test test/head.test.ts`
Expected: FAIL on import (`shared/utils/routes` does not exist yet).

- [ ] **Step 3: Write `shared/utils/site.ts` and `shared/utils/routes.ts`**

```ts
export const SITE_URL = 'https://kine-serenite.ca'

export const SITE_TITLE = 'Virginie Dang | Masso-kinésithérapeute & Orthothérapeute | Clermont, Charlevoix'

export const SITE_DESCRIPTION = 'Massage thaïlandais sur table, Massage des tissus profonds (Deep Tissue), Orthothérapie, Kinésithérapie, Massage pour femme enceinte, Massage anti-stress, Drainage lymphatique, Soin thérapeutique'

export function pageTitle(name: string): string {
  return `${name} | Virginie Dang | Masso-kinésithérapeute & Orthothérapeute`
}
```

```ts
// Also drives the tests: every listed route must match its entry in test/fixtures/seo-baseline.json.
export const PRERENDER_ROUTES: string[] = [
  '/'
]
```

- [ ] **Step 4: Write `app/composables/usePageSeo.ts`**

```ts
interface PageSeoInput {
  title: string
  description: string
  path: string
}

export function usePageSeo({ title, description, path }: PageSeoInput): void {
  useSeoMeta({ title, description })
  useHead({ link: [{ rel: 'canonical', href: `${SITE_URL}${path}` }] })
}
```

- [ ] **Step 5: Site-wide head in `app/app.vue`**

```vue
<script setup lang="ts">
useHead({
  meta: [
    { name: 'mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-title', content: SITE_TITLE }
  ]
})

useSeoMeta({
  ogType: 'website',
  ogSiteName: SITE_TITLE,
  ogTitle: SITE_TITLE,
  ogDescription: SITE_DESCRIPTION
})
</script>

<template>
  <UApp>
    <NuxtPage />
  </UApp>
</template>
```

- [ ] **Step 6: Home page SEO in `app/pages/index.vue`**

```vue
<script setup lang="ts">
usePageSeo({ title: SITE_TITLE, description: SITE_DESCRIPTION, path: '/' })
</script>

<template>
  <div />
</template>
```

- [ ] **Step 7: Head defaults, prerender routes and link trailing slashes in `nuxt.config.ts`**

Add at the top of the file: `import { PRERENDER_ROUTES } from './shared/utils/routes'`

Replace the `routeRules` block with:

```ts
  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      meta: [
        { name: 'theme-color', content: '#ffffff' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
        { rel: 'mask-icon', href: '/safari-pinned-tab.svg', color: '#4d8591' },
        { rel: 'shortcut icon', href: '/favicon.ico' }
      ]
    }
  },

  experimental: {
    defaults: {
      nuxtLink: {
        trailingSlash: 'append'
      }
    }
  },

  nitro: {
    prerender: {
      routes: PRERENDER_ROUTES
    }
  },
```

- [ ] **Step 8: Run the tests**

Run: `pnpm generate && pnpm test`
Expected: PASS.

- [ ] **Step 9: Full check and commit**

Run: `pnpm lint --fix && pnpm lint && pnpm typecheck && pnpm generate && pnpm test`

```bash
git add shared/utils/site.ts shared/utils/routes.ts app/composables/usePageSeo.ts app/app.vue app/pages/index.vue nuxt.config.ts test/head.test.ts test/helpers/baseline.ts test/fixtures/seo-baseline.json
git commit -m "🔍 carry over the site head and per-page SEO tags"
```

---

### Task 6: `ServicePage` shell and the policies page

**Files:**
- Create: `app/components/ServicePage.vue`, `app/pages/politiques-annulation-confidentialite.vue`, `test/content.test.ts`
- Modify: `app/app.config.ts` (card theme), `shared/utils/routes.ts`

**Interfaces:**
- Consumes: `usePageSeo`, `pageTitle` (Task 5), component classes (Task 4).
- Produces: `<ServicePage title="…">` with a default slot rendered inside `<div class="v-row justify-center">`; pages pass `v-col` children. Card theme: `UCard` renders as a Vuetify raised card (4px radius, elevation 2, white, no ring, no padding, no overflow clipping); flat cards add `class="shadow-none!"`.

- [ ] **Step 1: Write the failing content-parity test `test/content.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { PRERENDER_ROUTES } from '../shared/utils/routes'
import { baseline } from './helpers/baseline'
import { loadRoute, normalize } from './helpers/output'

// The home page is assembled over Tasks 15 to 18; Task 18 removes this exclusion.
const CONTENT_ROUTES = PRERENDER_ROUTES.filter(route => route !== '/')

describe.each(CONTENT_ROUTES)('%s content', (route) => {
  const $ = loadRoute(route)
  const expected = baseline.pages[route]!

  it('keeps the h1 headings', () => {
    expect($('h1').map((_, el) => normalize($(el).text())).get()).toEqual(expected.h1)
  })

  it('keeps the text of the main area', () => {
    expect(normalize($('main').length ? $('main').text() : $('#__nuxt').text())).toBe(expected.text)
  })
})
```

Until the layout exists (Task 7) there is no `<main>`, hence the fallback to Nuxt's root element (`#__nuxt`, which excludes the payload scripts); Task 7 removes the fallback.

- [ ] **Step 2: Add the route and run**

In `shared/utils/routes.ts` add `'/politiques-annulation-confidentialite/',` after `'/'`.

Run: `pnpm generate`
Expected: FAIL (prerender error: 404 on `/politiques-annulation-confidentialite/`).

- [ ] **Step 3: Card theme in `app/app.config.ts`**

```ts
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'brand',
      neutral: 'neutral'
    },
    card: {
      slots: {
        root: 'relative overflow-visible rounded-[4px] bg-white shadow-elevation-2',
        body: 'p-0 sm:p-0'
      },
      variants: {
        variant: {
          outline: {
            root: 'ring-0 divide-y-0'
          }
        }
      }
    }
  }
})
```

`overflow-visible` matters twice: the floating card headers in the rates section stick out above the card, and an overflow-clipping root would stop the title's `mt-5` from collapsing through the card as it does in Vuetify.

- [ ] **Step 4: Write `app/components/ServicePage.vue`**

```vue
<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <UCard>
    <div class="card-title mt-5 justify-center rounded-t-[4px] bg-kine-green text-center text-white">
      <h1 class="text-h5 font-bold sm:text-h4">
        {{ title }}
      </h1>
    </div>
    <div class="card-text p-5 text-black">
      <div class="v-row justify-center">
        <slot />
      </div>
    </div>
  </UCard>
</template>
```

- [ ] **Step 5: Write `app/pages/politiques-annulation-confidentialite.vue`**

Source: `git -C /Users/damienbeaufils/IdeaProjects/ks/kine-serenite show 9236071:pages/politiques-annulation-confidentialite.vue`

```vue
<script setup lang="ts">
usePageSeo({
  title: pageTitle('Politiques d’annulation et de confidentialité'),
  description: "Description détaillée des politiques d'annulation et de confidentialité.",
  path: '/politiques-annulation-confidentialite/'
})
</script>

<template>
  <ServicePage title="Politiques d’annulation et de confidentialité">
    <div class="v-col col-12">
      <h2 class="mb-5 text-kine-green">
        Politique d’annulation
      </h2>
      <ol>
        <li>
          Il est possible d'annuler le rendez-vous plus de 24 heures avant
          sans frais. Vous pouvez m'appeler ou me texter, il me fera plaisir
          de vous proposer une autre plage horaire.
        </li>
        <li>
          Passé à
          <b>moins de 24h du rendez-vous, des frais de 50% du prix vous
            seront demandés avant de pouvoir prendre un autre rendez-vous</b>.
        </li>
        <li>
          Il est également impossible de modifier la durée d'un traitement à
          moins de 24h à l'avance. Dans le cas où vous devez quitter avant
          la fin, le soin devra être payé dans sa totalité malgré tout.
        </li>
        <li>
          <b>En cas d’absence sans avertissement, le montant total du soin
            sera dû avant de pouvoir reprendre un rendez-vous.</b>
        </li>
      </ol>
    </div>

    <div class="v-col col-12">
      <h2 class="mb-5 text-kine-green">
        Politique de confidentialité
      </h2>
      <ol>
        <li>
          <b>Responsable de la protection des renseignements personnels :</b>
          Virginie Dang, propriétaire de Kiné-Sérénité (NEQ : 2277374767),
          entreprise enregistrée au registre des entreprises du Québec.
        </li>
        <li>
          <b>Contact de la personne responsable de la protection des
            renseignements personnels :</b>
          <a href="mailto:virginiedang.massotherapeute@gmail.com">virginiedang.massotherapeute@gmail.com</a>
        </li>
        <li>
          <b>Éléments des renseignements personnels collectés :</b> nom,
          prénom, téléphone, adresse courriel, date de naissance,
          occupation, raison de la consultation, conditions de santé à
          savoir (opérations chirurgicales; blessures, fractures ou autres
          dans les 6 derniers mois; conditions pour lesquelles de la
          médication est prise; allergies; problèmes circulatoires,
          digestifs, articulaires, de peau, respiratoires; grossesse;
          douleurs; tensions).
        </li>
        <li>
          <b>Utilisation prévue des renseignements personnels :</b> les
          informations telles que le nom, le prénom, le téléphone et
          l'adresse courriel sont nécessaires pour faciliter la prise de
          rendez-vous et toute communication associée. Les autres
          renseignements sont essentiels pour personnaliser le massage en
          fonction de votre état de santé et de vos besoins.
        </li>
        <li>
          <b>Stockage des données :</b> les questionnaires santé sont pris
          en note dans Google Drive dans mon compte professionnel
          virginiedang.massotherapeute@gmail.com. Une
          double-authentification est requise pour pouvoir y accéder.
        </li>
        <li>
          <b>Accès aux données :</b> je suis la seule à connaître le mot de
          passe qui verrouille l'écran de mon ordinateur ou de ma tablette,
          et je le verrouille immédiatement dès que je m'en éloigne. Lorsque
          je quitte mon navigateur internet, la session de mon compte Google
          professionnel se déconnecte automatiquement. Pour pouvoir accéder
          de nouveau aux fichiers, une nouvelle connexion avec
          double-authentification est requise.
        </li>
        <li>
          <b>Aucun partage des données :</b> aucune de vos informations ne
          sera partagée à une tierce partie pour des statistiques, des
          publicités, des listes d'envoi publicitaire ou des références.
        </li>
        <li>
          <b>Droits des personnes concernées :</b> vous avez le droit de
          demander accès à vos renseignements personnels, ainsi que de
          demander leur rectification le cas échéant. La personne de contact
          est la personne nommée au point 2.
        </li>
        <li>
          <b>Délai de conservation des renseignements personnels :</b> les
          renseignements personnels sont conservés jusqu’à 7 ans après le
          dernier massage. Ensuite, ils seront supprimés définitivement du
          nuage informatique.
        </li>
      </ol>
    </div>
  </ServicePage>
</template>

<style scoped>
li {
  margin-bottom: 0.5rem;
}

li li {
  margin-top: 0.25rem;
}

ul + p {
  margin-top: 1rem;
}
</style>
```

- [ ] **Step 6: Run the tests**

Run: `pnpm generate && pnpm test`
Expected: PASS. If the text test fails, the error shows both strings: find the first difference (usually a space missing or added around a `<b>` or `<a>`) and match the old file's whitespace. Visual checks for this page happen in Task 7, once the header and footer exist.

- [ ] **Step 7: Full check and commit**

Run: `pnpm lint --fix && pnpm lint && pnpm typecheck && pnpm generate && pnpm test`

```bash
git add app/app.config.ts app/components/ServicePage.vue app/pages/politiques-annulation-confidentialite.vue shared/utils/routes.ts test/content.test.ts
git commit -m "✨ add the service page shell and the cancellation and privacy page"
```

---

### Task 7: App shell (layout, header with hamburger menu, fixed footer)

**Files:**
- Create: `app/layouts/default.vue`, `app/components/AppHeader.vue`, `app/components/AppFooter.vue`, `test/shell.test.ts`
- Modify: `app/app.vue`, `app/app.config.ts` (button and dropdown theme), `nuxt.config.ts` (`runtimeConfig`), `test/content.test.ts` (drop the `body` fallback)

**Interfaces:**
- Consumes: `ServicePage` and the policies page (Task 6), tokens (Task 4).
- Produces: default layout (`AppHeader`, `<main>` › `v-container` › `v-row` › `v-col col-12 xl:col-8` › slot, `AppFooter`); `UButton` theme: `color="primary" variant="solid"` = Vuetify teal nav button, `variant="ghost"` = Vuetify text button, `active` = 18% overlay; `runtimeConfig.public.buildYear: number`.

Old-site measurements to match (1440×900 unless noted):
- header 100px, content padding 4px 16px; logo box 308×120 at (−32, −10), image drawn with `contain`
- nav buttons at y 32, 36px tall, 20px apart, right edge at 1424; Accueil active (overlay 0.18) on `/`, Politiques active on its page, hash links never active
- hamburger (below 1264px): 48×48 at y 26, 12px negative right margin, icon 24px `rgba(0,0,0,.54)`
- menu at 390px: box (90, 26, 288, 208), 4px radius, elevation 8, list padding 8px 0, items 48px tall with 16px side padding, inner buttons 36px tall, teal, 14px, `line-height: normal`
- footer fixed, `#EEEEEE`, padding 6px 16px, 40px tall (92px at 1024px, where the copyright wraps to a second row); buttons 36px tall, min-width 64px, padding 0, 20px side margins from 600px; icons 24px teal; small labels 11.2px uppercase with 1.25px tracking; GoRendezvous logo 100×30 cover; copyright `rgba(0,0,0,.26)`, hidden below 600px

- [ ] **Step 1: Write the failing test `test/shell.test.ts`**

```ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { allOutputFiles, loadRoute, normalize } from './helpers/output'

describe('site shell', () => {
  const $ = loadRoute('/politiques-annulation-confidentialite/')

  it('links the logo to the home page', () => {
    expect($('header a').first().attr('href')).toBe('/')
  })

  it('links the header buttons with trailing slashes and anchors', () => {
    expect($('header nav a').map((_, el) => $(el).attr('href')).get()).toEqual([
      '/',
      '/#techniques',
      '/#a-propos',
      '/politiques-annulation-confidentialite/'
    ])
  })

  it('renders a labelled hamburger button', () => {
    expect($('header button[aria-label="Menu"]')).toHaveLength(1)
  })

  it('renders the footer contact links', () => {
    expect($('footer a').map((_, el) => $(el).attr('href')).get()).toEqual([
      'https://www.facebook.com/virginiedang.massotherapeute',
      'https://www.gorendezvous.com/virginiedang',
      'mailto:virginiedang.massotherapeute@gmail.com',
      'tel:4187901294'
    ])
  })

  it('prints the build year in the copyright', () => {
    expect(normalize($('footer').text())).toContain(`© 2021-${new Date().getFullYear()} - Virginie Dang`)
  })

  it('does not depend on a remote icon API', () => {
    const html = allOutputFiles().filter(file => file.endsWith('.html')).map(file => readFileSync(file, 'utf8')).join('\n')
    expect(html).not.toMatch(/api\.iconify\.design|\/api\/_nuxt_icon/)
  })
})
```

- [ ] **Step 2: Run it**

Run: `pnpm test test/shell.test.ts`
Expected: FAIL (no header or footer).

- [ ] **Step 3: Button and dropdown theme in `app/app.config.ts`**

Add next to `card`:

```ts
    button: {
      slots: {
        base: [
          'relative inline-flex shrink-0 items-center justify-center rounded-[4px] font-medium tracking-[0.0892857143em] whitespace-nowrap uppercase no-underline select-none outline-none',
          'before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-current before:opacity-0 before:transition-opacity before:duration-200 before:ease-[cubic-bezier(0.4,0,0.6,1)]',
          'hover:before:opacity-[0.08] focus:before:opacity-[0.24]',
          'disabled:pointer-events-none disabled:opacity-100 aria-disabled:pointer-events-none aria-disabled:opacity-100'
        ]
      },
      variants: {
        size: {
          md: {
            base: 'h-9 min-w-16 gap-0 px-4 py-0 text-sm leading-normal'
          }
        },
        active: {
          true: {
            base: 'before:opacity-[0.18] hover:before:opacity-[0.18]'
          }
        }
      },
      compoundVariants: [
        { color: 'primary', variant: 'solid', class: 'bg-kine-green text-white hover:bg-kine-green active:bg-kine-green' },
        { color: 'primary', variant: 'ghost', class: 'bg-transparent text-kine-green hover:bg-transparent active:bg-transparent' },
        { color: 'neutral', variant: 'ghost', class: 'bg-transparent text-[rgba(0,0,0,0.87)] hover:bg-transparent active:bg-transparent disabled:text-[rgba(0,0,0,0.26)] aria-disabled:text-[rgba(0,0,0,0.26)]' }
      ]
    },
    dropdownMenu: {
      slots: {
        content: 'max-w-[80vw] min-w-0 overflow-y-auto rounded-[4px] bg-white py-2 shadow-elevation-8! ring-0',
        group: 'p-0',
        item: 'min-h-12 items-center px-4 py-0 before:hidden'
      }
    },
```

The `!` on the menu shadow keeps it deterministic even if tailwind-merge does not recognise `shadow-elevation-8` as replacing Nuxt UI's default `shadow-lg`.

- [ ] **Step 4: Build year in `nuxt.config.ts`**

```ts
  runtimeConfig: {
    public: {
      buildYear: new Date().getFullYear()
    }
  },
```

- [ ] **Step 5: Write `app/components/AppHeader.vue`**

```vue
<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

interface NavLink {
  label: string
  to: string
  menuLines: string[]
}

const links: NavLink[] = [
  { label: 'Accueil', to: '/', menuLines: ['Accueil'] },
  { label: 'Détail des techniques', to: '/#techniques', menuLines: ['Détail des techniques'] },
  { label: 'À propos', to: '/#a-propos', menuLines: ['À propos'] },
  {
    label: 'Politiques d’annulation et de confidentialité',
    to: '/politiques-annulation-confidentialite/',
    menuLines: ['Politiques d’annulation', 'et de confidentialité']
  }
]

const route = useRoute()
const withoutTrailingSlash = (path: string) => path.replace(/\/+$/, '') || '/'

// Exact match, like Vuetify's nav buttons; anchor links are never active.
function isActive(to: unknown): boolean {
  return typeof to === 'string' && !to.includes('#') && withoutTrailingSlash(route.path) === withoutTrailingSlash(to)
}

function linkFor(to: unknown): NavLink {
  return links.find(link => link.to === to) ?? links[0]!
}

const menuItems: DropdownMenuItem[] = links.map(link => ({ label: link.label, to: link.to }))
</script>

<template>
  <header class="relative z-0 bg-white">
    <div class="flex h-[100px] items-center px-4 py-1">
      <NuxtLink to="/" class="-ml-12 shrink-0">
        <img
          src="/img/virginie_dang_massotherapeute_logo_2026.png"
          alt=""
          width="308"
          height="176"
          class="block h-[120px] w-[308px] max-w-none object-contain"
        >
      </NuxtLink>

      <div class="grow" />

      <nav class="hidden lg:flex">
        <UButton
          v-for="(link, index) in links"
          :key="link.to"
          :to="link.to"
          :active="isActive(link.to)"
          :class="index < links.length - 1 ? 'mr-5' : ''"
        >
          {{ link.label }}
        </UButton>
      </nav>

      <UDropdownMenu
        :items="menuItems"
        :modal="false"
        :content="{ side: 'bottom', align: 'end', sideOffset: -48, collisionPadding: 12 }"
      >
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-mdi-menu"
          aria-label="Menu"
          class="-mr-3 size-12 min-w-0 justify-center rounded-full p-0 text-[rgba(0,0,0,0.54)] lg:hidden"
          :ui="{ leadingIcon: 'size-6' }"
        />

        <template #item="{ item }">
          <span
            class="relative inline-flex h-9 items-center rounded-[4px] px-4 text-sm font-medium tracking-[0.0892857143em] text-kine-green uppercase before:absolute before:inset-0 before:rounded-[inherit] before:bg-current before:opacity-0 group-data-highlighted:before:opacity-[0.08]"
            :class="isActive(item.to) ? 'before:opacity-[0.18]' : ''"
          >
            <span class="leading-[normal]">
              <template v-for="(line, index) in linkFor(item.to).menuLines" :key="line">
                <br v-if="index > 0">{{ line }}
              </template>
            </span>
          </span>
        </template>
      </UDropdownMenu>
    </div>
  </header>
</template>
```

- [ ] **Step 6: Write `app/components/AppFooter.vue`**

```vue
<script setup lang="ts">
const { public: { buildYear } } = useRuntimeConfig()

// Prerendered with the build year; updated after hydration so the HTML and the first client render match.
const year = ref(buildYear)
onMounted(() => {
  year.value = new Date().getFullYear()
})
</script>

<template>
  <footer class="fixed inset-x-0 bottom-0 z-[3] flex flex-wrap items-center bg-kine-light-grey px-4 py-1.5">
    <div class="v-row justify-center">
      <UButton
        variant="ghost"
        to="https://www.facebook.com/virginiedang.massotherapeute"
        target="_blank"
        aria-label="Facebook"
        class="my-2 p-0 sm:mx-5"
      >
        <UIcon name="i-mdi-facebook" class="size-6" />
      </UButton>
      <UButton
        color="neutral"
        variant="ghost"
        to="https://www.gorendezvous.com/virginiedang"
        target="_blank"
        class="my-2 p-0 sm:mx-5"
      >
        <img
          src="/img/LogoFull_GOrendezvous.png"
          alt="Prendre un rendez-vous"
          width="500"
          height="153"
          class="block h-[30px] w-[100px] object-cover"
        >
      </UButton>
      <UButton
        variant="ghost"
        to="mailto:virginiedang.massotherapeute@gmail.com"
        class="my-2 p-0 sm:mx-5"
      >
        <UIcon name="i-mdi-email" class="size-6" />
        <small class="hidden sm:flex">&nbsp;virginiedang.massotherapeute@gmail.com</small>
      </UButton>
      <UButton
        variant="ghost"
        to="tel:4187901294"
        class="my-2 p-0 sm:mx-5"
      >
        <UIcon name="i-mdi-phone" class="size-6" />
        <small class="hidden sm:flex">&nbsp;418-790-1294</small>
      </UButton>
      <UButton
        color="neutral"
        variant="ghost"
        disabled
        class="my-2 hidden p-0 sm:mx-5 sm:flex"
      >
        <small>&copy; 2021-{{ year }} - Virginie Dang</small>
      </UButton>
    </div>
  </footer>
</template>
```

- [ ] **Step 7: Write `app/layouts/default.vue` and use it from `app/app.vue`**

```vue
<template>
  <div class="flex min-h-screen flex-col">
    <AppHeader />
    <main class="flex-[1_0_auto] pb-10">
      <div class="v-container">
        <div class="v-row justify-center">
          <div class="v-col col-12 xl:col-8">
            <slot />
          </div>
        </div>
      </div>
    </main>
    <AppFooter />
  </div>
</template>
```

In `app/app.vue`, replace the template with:

```vue
<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
```

In `test/content.test.ts`, replace `normalize($('main').length ? $('main').text() : $('#__nuxt').text())` with `normalize($('main').text())`.

- [ ] **Step 8: Run the tests**

Run: `pnpm lint --fix && pnpm generate && pnpm test`
Expected: PASS.

- [ ] **Step 9: Browser checks: icons, hamburger menu, footer year**

Start `pnpm preview` in the background, then:

```bash
export AGENT_BROWSER_SESSION=task7
agent-browser set viewport 390 844 && agent-browser open http://localhost:3001/politiques-annulation-confidentialite/ && agent-browser wait --load load
agent-browser network requests | grep -E '_nuxt_icon|iconify' ; echo "icon requests above (expected none)"
agent-browser click 'header button[aria-label="Menu"]' && agent-browser wait 500
agent-browser eval "JSON.stringify([...document.querySelectorAll('[role=menu]')].map(m => { const r = m.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] }))"
agent-browser snapshot -i -u
```
Expected: no icon requests; menu box `[[90,26,288,208]]` (±2px); four menu items linking to `/`, `/#techniques`, `/#a-propos`, `/politiques-annulation-confidentialite/`, the last one on two lines. If the box is off, adjust `sideOffset` or `collisionPadding` in `AppHeader.vue`.

Footer year across a New Year: stop the preview, then

```bash
NUXT_PUBLIC_BUILD_YEAR=2025 pnpm generate && pnpm preview &
agent-browser set viewport 1440 900 && agent-browser open http://localhost:3001/politiques-annulation-confidentialite/ && agent-browser wait --load load && agent-browser wait 1000
agent-browser eval "document.querySelector('footer').innerText"
agent-browser console | grep -i hydrat ; echo "hydration messages above (expected none)"
```
Expected: the footer text contains `2021-2026` (the current year, not 2025) and no hydration message. Stop the preview and run `pnpm generate` again without the variable.

- [ ] **Step 10: Visual comparison**

With `pnpm preview` running and the old site on :3000:

```bash
cd $V
./compare.sh /politiques-annulation-confidentialite/ 390 844
./compare.sh /politiques-annulation-confidentialite/ 1024 768
./compare.sh /politiques-annulation-confidentialite/ 1440 900
./compare.sh / 1440 900 1440x100+0+0
./compare.sh / 390 844 390x100+0+0
```
Expected: every line prints `"pass":true`. For a failing cell, open `out/<page>/diff.png`, then run `./probe.sh <route> <w> <h>` to list the first element whose position or style differs, and fix it in the token/base/theme layer (Task 4 and Step 3 of this task) before touching templates. Repeat until all pass.

- [ ] **Step 11: Full check and commit**

Run: `pnpm lint --fix && pnpm lint && pnpm typecheck && pnpm generate && pnpm test`

```bash
git add app/layouts/default.vue app/components/AppHeader.vue app/components/AppFooter.vue app/app.vue app/app.config.ts nuxt.config.ts test/shell.test.ts test/content.test.ts
git commit -m "✨ add the header, hamburger menu and fixed footer"
```

Include `app/assets/css/main.css` in `git add` if Step 10 changed it.

---

### Tasks 8 to 14: service pages

Each service page task follows the same steps; the page code differs. Page source for each: `git -C /Users/damienbeaufils/IdeaProjects/ks/kine-serenite show 9236071:pages/soins/<name>.vue`.

Images are real `<img>` elements. Every service photo in this section uses:
`loading="lazy" decoding="async" class="block aspect-[3/2] w-full object-cover"` with its intrinsic `width`/`height`, except `ventouses.jpg` (`aspect-[4/3]`). `alt=""` for now, as today; Task 22 adds descriptive alt text.

Intrinsic sizes: `drainage_lymphatique.jpg` 800×531, `kinesitherapie_therapeutique.jpg` 800×565, `massage_anti-stress.jpg` 800×533, `massage_de_repit.jpg` 800×537, `massage_femme_enceinte.jpg` 800×510, `massage_tissus_profonds.jpg` 800×533, `ventouses.jpg` 800×600, `massage_thailandais_1171/1191/1198/1215/1233.jpg` 1920×1280.

Common steps (the per-task sections list only what differs):

1. Add the route to `shared/utils/routes.ts`.
2. Run `pnpm generate`. Expected: FAIL with a prerender 404 on the new route.
3. Write the page file.
4. Run `pnpm lint --fix && pnpm generate && pnpm test`. Expected: PASS (the head and content tests pick the route up from `PRERENDER_ROUTES`). On a text mismatch, find the first differing character and match the old whitespace around inline tags.
5. With `pnpm preview` running: `cd $V && ./compare.sh <route> 390 844 && ./compare.sh <route> 1440 900`. Expected: both `"pass":true`; otherwise fix with `./probe.sh` as in Task 7, Step 10.
6. Full check, then commit the page and `shared/utils/routes.ts`.

### Task 8: Drainage lymphatique page

**Files:** Create `app/pages/soins/drainage-lymphatique.vue`; Modify `shared/utils/routes.ts` (add `'/soins/drainage-lymphatique/',`).

**Interfaces:** Consumes `ServicePage`, `usePageSeo`, `pageTitle`.

- [ ] **Step 1: Add the route; Step 2: `pnpm generate` fails with a 404 on the route**
- [ ] **Step 3: Write the page**

```vue
<script setup lang="ts">
usePageSeo({
  title: pageTitle('Drainage lymphatique'),
  description: 'Qu’est ce que le drainage lymphatique ? Pour qui ? Les bienfaits. Prise de rendez-vous pour un drainage lymphatique.',
  path: '/soins/drainage-lymphatique/'
})
</script>

<template>
  <ServicePage title="Drainage lymphatique (méthode Dr. Leduc)">
    <div class="v-col col-12">
      <h2 class="mb-5 text-kine-green">
        Qu’est ce que le drainage lymphatique ?
      </h2>
      <p>
        C’est une technique de massage <b>très douce</b> et <b>lente</b> qui
        stimule la circulation de la lymphe et aide à détoxiquer l’organisme
        tout en activant le système immunitaire.
      </p>
      <p>
        Par des gestes et <b>mouvements délicats</b>, le réseau de groupe
        ganglionnaire est stimulé et par la suite, la lymphe est chassée
        vers le trajet du flux lymphatique.
      </p>
      <p>
        Le thérapeute découvre la zone à traiter et exécute une série de
        mouvements lents et doux, <b>semblables à l'effet d'une vague</b>,
        qui créent un <b>effet de pompage</b>. Le but est de drainer les
        liquides excédentaires présents dans les tissus et d'améliorer la
        circulation.
      </p>
      <p>
        <b>Plusieurs séances peuvent être nécessaires avant d'obtenir des
          résultats apparents.</b>
      </p>
      <p>
        Il existe certaines contre-indications au drainage lymphatique.
        <b>Les contre-indications au drainage lymphatique sont les mêmes que
          pour la plupart des techniques</b>
        : fièvre, infection, plaies ou problèmes cutanés et antécédents de
        troubles cardiaques.
      </p>
      <p>
        Des précautions sont à prendre en considération dans le cas d’une
        personne atteinte d’un cancer, d’asthme, d’insuffisance rénale,
        d’hyperthyroïdie, d’hypotension artérielle, de phlébites, de grosses
        varices douloureuses, de chirurgie abdominale ou d’inflammation en
        phase aiguë.
      </p>
      <p><b>Si vous avez un doute, parlez-en à votre médecin !</b></p>
    </div>

    <div class="v-col col-12 sm:col-8">
      <img
        src="/img/services/drainage_lymphatique.jpg"
        alt=""
        width="800"
        height="531"
        loading="lazy"
        decoding="async"
        class="block aspect-[3/2] w-full object-cover"
      >
    </div>

    <div class="v-col col-12">
      <h3 class="mb-5 text-kine-green">
        Pour qui ?
      </h3>
      <ul>
        <li>
          <b>Femme enceinte, femme qui allaite ;</b>
          <ul>
            <li>Jambe lourde, oedème,</li>
            <li>Engorgement des seins .</li>
          </ul>
        </li>
        <li>Personne âgée, <b>personne insomniaque</b> ;</li>
        <li>
          Personne
          <b>devant subir une chirurgie ou ayant subi une chirurgie</b> ;
          <ul>
            <li>
              Augmentation des anticorps pour contrer les risques
              d’infection,
            </li>
            <li>Amélioration de la cicatrisation de la peau.</li>
          </ul>
        </li>
        <li>Les personnes souffrant d’<b>allergies</b> ;</li>
        <li>
          Personne souvent sujette à la <b>toux</b>, la <b>grippe</b> ;
        </li>
        <li>Personne en <b>cure d’amaigrissement</b> ;</li>
        <li>
          Personne ayant un/des <b>oedème(s)</b>, des
          <b>sensations de jambes lourdes</b> ;
        </li>
        <li>Personne souffrant de <b>fibromyalgie</b>, etc.</li>
      </ul>
    </div>

    <div class="v-col col-12">
      <h3 class="mb-5 text-kine-green">
        Les bienfaits
      </h3>
      <ul>
        <li>Réduit les oedèmes ;</li>
        <li>Favorise la circulation lymphatique ;</li>
        <li>
          <b>Améliore l’élimination des toxines</b> en drainant les déchets
          et le surplus de liquide ;
        </li>
        <li><b>Renforce le système immunitaire</b> ;</li>
        <li>Aide à <b>prévenir les allergies saisonnières</b> ;</li>
        <li>Aide à prévenir et/ou soulager les <b>jambes lourdes</b> ;</li>
        <li>
          <b>Pré et post-chirurgie</b> pour aider le corps à la
          cicatrisation en augmentant la production de nouvelles cellules ;
        </li>
        <li>
          <b>Très relaxant</b>, c’est un
          <b>soin qui procure une grande détente</b>.
        </li>
      </ul>
    </div>
  </ServicePage>
</template>

<style scoped>
li {
  margin-bottom: 0.5rem;
}

li li {
  margin-top: 0.25rem;
}

ul + p {
  margin-top: 1rem;
}
</style>
```

- [ ] **Step 4: Tests pass; Step 5: visual cells pass at 390 and 1440**
- [ ] **Step 6: Commit**

```bash
git add app/pages/soins/drainage-lymphatique.vue shared/utils/routes.ts
git commit -m "✨ add the lymphatic drainage page"
```

### Task 9: Massage anti-stress page

**Files:** Create `app/pages/soins/massage-anti-stress.vue`; Modify `shared/utils/routes.ts` (add `'/soins/massage-anti-stress/',`).

This page contains `Relaĉhe` (latin-ext glyph, Review Focus 2). In the visual step, also open `out/soins_massage-anti-stress-1440x900/new.png` and check that the word renders in Lora like its neighbours.

- [ ] **Step 1: Add the route; Step 2: `pnpm generate` fails with a 404 on the route**
- [ ] **Step 3: Write the page**

```vue
<script setup lang="ts">
usePageSeo({
  title: pageTitle('Massage anti-stress'),
  description: 'Qu’est-ce que le massage anti-stress ? Pour qui ? Les bienfaits et ce qu’il faut aussi savoir. Prise de rendez-vous pour un massage anti-stress.',
  path: '/soins/massage-anti-stress/'
})
</script>

<template>
  <ServicePage title="Massage anti-stress">
    <div class="v-col col-12">
      <h2 class="mb-5 text-kine-green">
        Qu’est-ce que le massage anti-stress ?
      </h2>

      <p>
        C’est un massage <b>lent et à l’écoute de vos tissus</b>. Les
        manoeuvres peuvent être plus profondes si votre corps me le permet
        mais tout en restant dans la <b>douceur</b>.
      </p>

      <p>
        La lenteur des manoeuvres vous permet de
        <b>reprendre «conscience» de votre propre corps et de vos propres
          besoins</b>.
      </p>

      <p>
        Des manoeuvres de
        <b>massage du ventre et de décongestion du diaphragme</b> sont
        incluses dans votre soin.
      </p>

      <p>
        Le massage du ventre permet d’amener une
        <b>plus grande détente</b> et la décongestion du diaphragme va
        donner de l’espace à celui-ci, et donc à votre respiration (<i>ce muscle assure à lui seul 60 à 75% du changement de volume
          pulmonaire lors de l'inspiration</i>).
      </p>

      <p>
        <b>Sachez que je m’adapte en fonction de vos besoins ! Ce soin est
          donc <u>personnalisable</u>.</b>
      </p>
    </div>

    <div class="v-col col-12 sm:col-8">
      <img
        src="/img/services/massage_anti-stress.jpg"
        alt=""
        width="800"
        height="533"
        loading="lazy"
        decoding="async"
        class="block aspect-[3/2] w-full object-cover"
      >
    </div>

    <div class="v-col col-12">
      <h3 class="mb-5 text-kine-green">
        Pour qui ?
      </h3>
      <p>
        Il s’adresse
        <b>aux personnes exposées à de vifs états émotionnels</b> provoqués
        par :
      </p>
      <ul>
        <li>La perte d’un être cher ;</li>
        <li>La perte d’un emploi ;</li>
        <li>Un feu, un accident, un traumatisme ;</li>
        <li>
          Pour les personnes touchées par le <b>cancer</b> (<i>avis écrit du médecin requis</i>) ;
        </li>
        <li>Pour les <b>personnes aidantes</b> ;</li>
        <li>
          Personnes souffrant d’<b>anxiété</b>, de <b>dépression</b> ;
        </li>
        <li>Et autre difficulté.</li>
      </ul>

      <p>
        Bref, pour toutes personnes dont les émotions prennent beaucoup
        «trop» de place et chamboule leur quotidien.
      </p>

      <p>
        En fait, c’est un soin
        <b>considéré dans la catégorie des massages réconfortants dans une
          approche psychocorporelle</b>.
      </p>
    </div>

    <div class="v-col col-12">
      <h3 class="mb-5 text-kine-green">
        Les bienfaits
      </h3>
      <ul>
        <li>Améliore l’état d’esprit par la détente ;</li>
        <li>
          Relaĉhe les tensions psychologiques et physiques causés par le
          stress ;
        </li>
        <li>Réduit la dépression ;</li>
        <li>
          Améliore le mouvement respiratoire par la décongestion du
          diaphragme ;
        </li>
        <li>Aide à contrer l’insomnie ;</li>
        <li>Améliore le facteur énergie ;</li>
        <li>
          Diminue les douleurs associées à la maladie ou à ses traitements.
        </li>
      </ul>
    </div>

    <div class="v-col col-12 mt-4">
      <h3 class="mb-5 text-kine-green">
        Ce qu’il faut aussi savoir
      </h3>
      <ul>
        <li>
          Ce soin est
          <b>complémentaire à une thérapie mentale, mais ne la remplace
            pas</b>
          ;
        </li>
        <li>
          Comme dans toute thérapie, ce n’est pas un soin miracle car il
          faut aussi que vous ayez la volonté de vous reconnecter.
          <b>Nous allons travailler en équipe, vous et moi pour atteindre
            cet objectif.</b>
          ;
        </li>
        <li>
          Comme c’est un travail d’équipe,
          <b>des conseils seront donnés à la fin du soin pour augmenter son
            efficacité</b>
          ;
        </li>
        <li>
          C’est un programme qui se fait
          <b>idéalement sur plusieurs séances : les effets seront encore
            plus grands et plus efficaces</b>
          ;
        </li>
        <li>
          Pour vulgariser le tout : c’est comme une voiture, pour mieux
          «fonctionner» il faut penser à s’entretenir et prendre soin de soi
          !
        </li>
        <li>
          <b>Je souhaite être cette personne qui vous accompagne vers votre
            mieux-être, avec bienveillance, sans jugement et respect de
            votre soi.</b>
        </li>
      </ul>
    </div>
  </ServicePage>
</template>

<style scoped>
li {
  margin-bottom: 0.5rem;
}

ul + p {
  margin-top: 1rem;
}
</style>
```

- [ ] **Step 4: Tests pass; Step 5: visual cells pass at 390 and 1440, and `Relaĉhe` renders in Lora**
- [ ] **Step 6: Commit**

```bash
git add app/pages/soins/massage-anti-stress.vue shared/utils/routes.ts
git commit -m "✨ add the anti-stress massage page"
```

### Task 10: Massage de répit page

**Files:** Create `app/pages/soins/massage-de-repit.vue`; Modify `shared/utils/routes.ts` (add `'/soins/massage-de-repit/',`).

- [ ] **Step 1: Add the route; Step 2: `pnpm generate` fails with a 404 on the route**
- [ ] **Step 3: Write the page**

```vue
<script setup lang="ts">
usePageSeo({
  title: pageTitle('Massage de répit'),
  description: 'Qu’est-ce que le massage de répit ? Pour qui ? Prise de rendez-vous pour un massage de répit (pour personnes en perte d’autonomie). Uniquement à domicile / en CHSLD / à l’hôpital.',
  path: '/soins/massage-de-repit/'
})
</script>

<template>
  <ServicePage title="Massage de répit (pour personnes en perte d’autonomie) - Uniquement à domicile / en CHSLD / à l’hôpital">
    <div class="v-col col-12">
      <h2 class="mb-5 text-kine-green">
        Qu’est ce que le massage de répit ?
      </h2>

      <p>
        Il est offert uniquement pour les personnes ne pouvant s’installer
        sur une table traditionnelle de massage et leurs proches aidants.
      </p>

      <p>
        L'objectif est plutôt d’offrir un massage confortable et sécuritaire
        <b>directement dans vos installations</b>, selon vos capacités et
        vos besoins (fauteuil inclinable, chaise, divan, etc.). Ils ne
        visent pas la performance ou le traitement musculaire intensif.
      </p>

      <p>
        J’apporte avec moi le matériel nécessaire pour créer un
        environnement apaisant et adapté : une chaise longue, un appui-tête
        portatif pouvant être installé sur n’importe quelle table, une
        enceinte pour une musique douce ainsi qu’un gel de massage neutre.
        <u>Je ne me déplace pas avec une table de massage traditionnelle.</u>
      </p>

      <p>
        Chaque soin est personnalisé afin de privilégier votre confort,
        votre bien-être et le respect de vos limites.
      </p>

      <p>Je m’adapte à vous pour :</p>
      <ul>
        <li>
          <b>l’installation</b> : dans votre fauteuil roulant, une chaise
          longue, le lazyboy, dans votre divan… De mon côté, j’apporte une
          chaise longue ainsi qu’un appui-tête portatif qui se dépose sur
          n’importe quelle table.
        </li>
        <li><b>la durée du massage</b> : 15-20, 30, 45 ou 60 minutes.</li>
        <li>
          <b>vos besoins</b> : juste la tête ; ou les mains, les pieds, la
          tête et un peu de dos …
        </li>
      </ul>
      <p>En gros : vous choisissez car c’est votre moment de réconfort.</p>
    </div>

    <div class="v-col col-12 order-2 sm:col-6 sm:order-0">
      <h3 class="mb-5 text-kine-green">
        Pour qui ?
      </h3>
      <p>Ce soin s’adresse notamment aux personnes vivant avec :</p>
      <ul>
        <li>le cancer ;</li>
        <li>la SLA ;</li>
        <li>le Parkinson ;</li>
        <li>l’Alzheimer ;</li>
        <li>d’autres maladies dégénératives.</li>
      </ul>
      <p>Ainsi qu’aux personnes :</p>
      <ul>
        <li>en fauteuil roulant ;</li>
        <li>tétraplégiques ;</li>
        <li>hospitalisées ;</li>
        <li>l’en CHSLD ;</li>
        <li>en fin de vie.</li>
      </ul>

      <p>Et je n’oublie pas les proches aidants.</p>
    </div>

    <div class="v-col col-12 order-1 mx-auto my-auto sm:col-6 sm:order-0">
      <img
        src="/img/services/massage_de_repit.jpg"
        alt=""
        width="800"
        height="537"
        loading="lazy"
        decoding="async"
        class="block aspect-[3/2] w-full object-cover"
      >
    </div>
  </ServicePage>
</template>

<style scoped>
li {
  margin-bottom: 0.5rem;
}

ul + p {
  margin-top: 1rem;
}
</style>
```

- [ ] **Step 4: Tests pass; Step 5: visual cells pass at 390 and 1440 (the image sits above "Pour qui ?" at 390 and beside it at 1440)**
- [ ] **Step 6: Commit**

```bash
git add app/pages/soins/massage-de-repit.vue shared/utils/routes.ts
git commit -m "✨ add the respite massage page"
```

### Task 11: Massage des tissus profonds page

**Files:** Create `app/pages/soins/massage-deep-tissue.vue`; Modify `shared/utils/routes.ts` (add `'/soins/massage-deep-tissue/',`).

- [ ] **Step 1: Add the route; Step 2: `pnpm generate` fails with a 404 on the route**
- [ ] **Step 3: Write the page**

```vue
<script setup lang="ts">
usePageSeo({
  title: pageTitle('Massage des tissus profonds (Deep Tissue)'),
  description: 'Qu’est-ce que le massage des tissus profonds (Deep Tissue) ? Pour qui ? Les bienfaits et ce qu’il faut aussi savoir. Prise de rendez-vous pour un massage des tissus profonds (Deep Tissue).',
  path: '/soins/massage-deep-tissue/'
})
</script>

<template>
  <ServicePage title="Massage des tissus profonds (Deep Tissue)">
    <div class="v-col col-12">
      <h2 class="mb-5 text-kine-green">
        Qu’est ce que le massage des tissus profonds ?
      </h2>

      <p>
        C’est une technique de massage que j’ai apprise enseignée par
        <a
          href="https://kineconcept.com/nos-enseignants/glen-morris/"
          target="_blank"
        >Glen Morris à l’institut de Kiné-Concept</a>.
      </p>

      <p>C’est un soin sans huile (ou très très peu d’huile).</p>

      <p>
        On pense souvent à tort que c’est un massage à l’huile mais avec
        plus de pression.. Quand on entend “Deep Tissue” ou “Tissus
        Profonds”, on vient forcément allier le mot “fort”.
      </p>

      <p>
        Ce sont plutôt des
        <b>manœuvres très lentes et d’une grande profondeur</b> sur les
        muscles et les tissus conjonctifs. Ce massage vient relâcher les
        tensions pour que les tissus (muscles, peau, tissu conjonctifs…)
        retrouvent leur élasticité.
      </p>

      <p>
        Avec cette technique, la façon de masser est repensée : on ne fait
        pas du rentre-dedans là où ça fait mal. On vient chercher et
        travailler la cause afin de réduire les symptômes. Donc ne soyez pas
        surpris si vous avez mal à l’épaule et qu’on se concentre sur votre
        cou ou sur vos pectoraux, tout est lié&nbsp;!
      </p>
    </div>

    <div class="v-col col-12 sm:col-8">
      <img
        src="/img/services/massage_tissus_profonds.jpg"
        alt=""
        width="800"
        height="533"
        loading="lazy"
        decoding="async"
        class="block aspect-[3/2] w-full object-cover"
      >
    </div>

    <div class="v-col col-12">
      <h3 class="mb-5 text-kine-green">
        Cette technique a révolutionné ma façon de masser.
      </h3>
      <p>
        Vous êtes-vous déjà dit que le massage que vous receviez était trop
        rapide et trop fort ? Que vous étiez crispé·e pendant le soin ? Que
        votre système nerveux craignait les mouvements par peur d’avoir mal
        ? Que vous aviez des bleus le lendemain tellement c’était
        <i>trop</i> intense ?
      </p>

      <p>
        Toute technique ne correspond pas forcément à tout le monde, tout.e
        thérapeute ne correspond pas à tout le monde non plus, et cela est
        bien correct !
      </p>

      <p>
        Le massage des tissus profonds a révolutionné ma façon de masser car
        c’est comme ça que je veux recevoir un soin : un massage
        <b>en profondeur et tout en douceur à la fois</b>.
      </p>

      <p>
        Il est possible que certains endroits soient sensibles
        <u><b>MAIS</b></u> le seuil de tolérance doit être respecté. Je ne
        veux pas que vous sautez sur la table de douleur. Ce n’est pas le
        but car cela peut provoquer l’effet inverse : une crispation des
        tissus musculaires car le système nerveux est trop tendu. Cela dit,
        cette technique peut fonctionner sur certaines personnes, et c’est
        bien correct aussi ! Chaque corps est différent.
      </p>
    </div>

    <div class="v-col col-12">
      <h3 class="mb-5 text-kine-green">
        Est-ce que ça fait mal ?
      </h3>

      <p>
        Normalement non ! <br>
        Ce soin ne veut pas dire : « peser fort pour peser fort » ou « on
        défonce tout pour arriver aux tissus profonds ! ». <br>C'est
        plutôt :
        <b>« On fait la connaissance de tout le monde et on leur dit bonjour
          avant d'arriver aux tissus profonds ! »</b>
      </p>

      <UCard class="callout">
        <div class="card-text rounded-[4px] bg-kine-yellow text-center text-subtitle-1 font-bold text-kine-green">
          <u>Le ressenti de ce soin :</u> on rentre petit à petit dans vos
          tissus, tout en <b>douceur et profondeur</b>. Je vais « peser »
          aussi profond que vos tissus me laisseront,
          <b>je vais respecter les limites de vos tissus</b>. Cela veut dire
          que lorsque j'arrive à une résistance, je m'arrête là pour la
          saluer afin qu'elle me laisse passer. 😉
        </div>
      </UCard>

      <p>
        <b>Évidemment, chaque personne a un seuil de tolérance différent et
          il est important de communiquer pendant le soin si la pression du
          soin est trop forte pour vous.
        </b>
      </p>
    </div>

    <div class="v-col col-12">
      <h3 class="mb-5 text-kine-green">
        Pour qui ?
      </h3>
      <p>
        Pour toutes les personnes ayant des inconforts, des tensions et des
        douleurs pouvant les limiter ou les gêner dans leurs activités
        quotidiennes.
      </p>

      <p>
        Je pourrai vous apporter mon aide que ce soit en cas de douleur
        aiguë, chronique ou même en préventif !
      </p>

      <p>
        Le but n’est de ne pas se rendre jusqu’à la douleur aiguë vous
        empêchant toutes activités quotidiennes pour venir consulter un
        thérapeute.
      </p>

      <p>
        <b>Vaut mieux donc prévenir la douleur !</b>
      </p>
    </div>

    <div class="v-col col-12">
      <h3 class="mb-5 text-kine-green">
        Les bienfaits
      </h3>
      <ul>
        <li>
          Apporte une <b>très grande détente</b> grâce à la lenteur des
          mouvements ;
        </li>
        <li><b>Favorise la mobilité articulaire</b> d’un segment ;</li>
        <li>Apporte une <b>meilleure souplesse à vos tissus</b> ;</li>
        <li><b>Diminue les douleurs articulaires et musculaires</b> ;</li>
        <li><b>Prévient les douleurs récidivantes</b> ;</li>
      </ul>
    </div>

    <div class="v-col col-12 mt-4">
      <h3 class="mb-5 text-kine-green">
        Ce qu’il faut aussi savoir
      </h3>
      <ul>
        <li>
          Ce n’est pas un soin indiqué pour les personnes enceintes ou les
          enfants et pour toutes les personnes ayant une contre-indication
          au massage : fièvre, phlébite, thrombose, infection active, plaie
          ouverte…
          <b>Et si vous avez un doute, veuillez consulter votre médecin !</b>
        </li>
        <li>
          <b>Si vous prenez une douche avant, vaut mieux éviter de vous
            crémer</b>
          car je ne pourrai pas glisser sur la peau facilement. Si jamais
          vous avez la peau très sèche, masser sans huile n’a jamais été un
          problème jusqu’à aujourd’hui, mais
          <b>je peux toujours ajouter un peu d’huile neutre si vous craignez
            le “sans-huile”</b>.
        </li>
        <li>
          <b>Enfin, si vous souhaitez essayer ce soin mais vous n’êtes pas
            certain·e</b>
          : il est possible de <b>personnaliser</b> votre soin en commençant
          par le dos (10-15 minutes) et vous me direz si vous souhaitez
          continuer en tissus profonds ou si on passe à un massage à l’huile
          sans aucun problème. <b>C’est avant tout, <u>VOTRE</u> soin.</b>
        </li>
      </ul>
    </div>

    <div class="v-col col-12 mt-4">
      <small>
        <i>Sources :</i>
        <ul>
          <li>
            <a
              href="https://kineconcept.com/formation/massage-des-tissus-profonds-deep-tissue/"
              target="_blank"
            >https://kineconcept.com/formation/massage-des-tissus-profonds-deep-tissue/
            </a>
          </li>
          <li>
            <a
              href="https://www.fqm.qc.ca/massotherapie/tissus-profonds/"
              target="_blank"
            >https://www.fqm.qc.ca/massotherapie/tissus-profonds/</a>
          </li>
          <li>
            <a
              href="https://www.youtube.com/watch?v=VNo4kzOYY-8"
              target="_blank"
            >https://www.youtube.com/watch?v=VNo4kzOYY-8</a>
          </li>
        </ul>
      </small>
    </div>
  </ServicePage>
</template>

<style scoped>
li {
  margin-bottom: 0.75rem;
}

small li {
  margin-bottom: 0;
}

ul + p {
  margin-top: 1rem;
}

.callout + p {
  margin-top: 1rem;
}
</style>
```

- [ ] **Step 4: Tests pass; Step 5: visual cells pass at 390 and 1440**
- [ ] **Step 6: Commit**

```bash
git add app/pages/soins/massage-deep-tissue.vue shared/utils/routes.ts
git commit -m "✨ add the deep tissue massage page"
```

### Task 12: Massage pour femme enceinte page

**Files:** Create `app/pages/soins/massage-femme-enceinte.vue`; Modify `shared/utils/routes.ts` (add `'/soins/massage-femme-enceinte/',`).

- [ ] **Step 1: Add the route; Step 2: `pnpm generate` fails with a 404 on the route**
- [ ] **Step 3: Write the page**

```vue
<script setup lang="ts">
usePageSeo({
  title: pageTitle('Massage pour femme enceinte'),
  description: 'Qu’est ce que le massage pour femmes enceintes ? Est-il possible de se faire masser durant le premier trimestre ? Les bienfaits. Prise de rendez-vous.',
  path: '/soins/massage-femme-enceinte/'
})
</script>

<template>
  <ServicePage title="Massage pour femme enceinte">
    <div class="v-col col-12">
      <h2 class="mb-5 text-kine-green">
        Qu’est ce que le massage pour femmes enceintes ?
      </h2>
      <p>
        C’est un massage adapté aux femmes enceintes avec une installation
        particulière pour le <b>confort de la future maman</b>, et c’est un
        point très important !
      </p>

      <p>
        Tant que la femme enceinte est confortable, elle peut se mettre sur
        le ventre. Autrement, il est possible de la masser en étant couchée
        sur le côté ou bien avec une installation spéciale femme enceinte.
      </p>

      <p>
        Aussi, si elle le souhaite, il est également
        <b>possible de masser le ventre, tout en douceur bien évidemment</b>.
      </p>

      <p>
        Que ce soit pour un
        <b>massage détente aidant à réduire le stress</b> de la future maman
        ou pour <b>un soin thérapeutique pour dénouer des tensions</b>, la
        femme enceinte peut bénéficier des soins en massothérapie !
      </p>

      <p>
        <b>Je prends en compte les besoins et les attentes de la future
          maman afin de lui concocter le soin dont elle a besoin.</b>
      </p>
      <p>
        C’est un soin <b>totalement personnalisable</b> : il est possible de
        combiner un massage du dos et un drainage lymphatique des jambes par
        exemple !
      </p>
    </div>

    <div class="v-col col-12 sm:col-8">
      <img
        src="/img/services/massage_femme_enceinte.jpg"
        alt=""
        width="800"
        height="510"
        loading="lazy"
        decoding="async"
        class="block aspect-[3/2] w-full object-cover"
      >
    </div>

    <div class="v-col col-12">
      <h3 class="mb-5 text-kine-green">
        Est-il possible de se faire masser durant le premier trimestre ?
      </h3>
      <p>Absolument !</p>

      <p>
        Par contre, il existe quelques contre-indications au massage selon
        l’état de santé de la femme enceinte : antécédent de fausse couche,
        grossesse à risque, diabète, hypertension, prééclampsie.
      </p>

      <p>
        <b>En cas de doute, l’avis du médecin est fortement conseillé !</b>
      </p>
    </div>

    <div class="v-col col-12">
      <h3 class="mb-5 text-kine-green">
        Les bienfaits
      </h3>
      <ul>
        <li>
          Aide à soulager les inconforts et douleurs que ce soit au niveau
          du dos, des épaules, des pieds ou ailleurs ;
        </li>
        <li>
          Favorise une meilleure circulation sanguine, ce qui aide aux
          échanges entre la mère et le bébé ;
        </li>
        <li>
          Favorise la circulation lymphatique et réduit les sensations de
          jambes lourdes par un drainage lymphatique ;
        </li>
        <li>Aide à avoir une respiration plus profonde ;</li>
        <li>Aide à soulager le stress ;</li>
        <li>Reprendre contact avec son propre corps.</li>
      </ul>
    </div>
  </ServicePage>
</template>

<style scoped>
li {
  margin-bottom: 0.5rem;
}

ul + p {
  margin-top: 1rem;
}
</style>
```

- [ ] **Step 4: Tests pass; Step 5: visual cells pass at 390 and 1440**
- [ ] **Step 6: Commit**

```bash
git add app/pages/soins/massage-femme-enceinte.vue shared/utils/routes.ts
git commit -m "✨ add the pregnancy massage page"
```

### Task 13: Massage thaïlandais sur table page

**Files:** Create `app/pages/soins/massage-thailandais-sur-table.vue`; Modify `shared/utils/routes.ts` (add `'/soins/massage-thailandais-sur-table/',`).

The old page's scoped `small li` and `.v-card + p` rules match nothing on this page; they are not ported.

- [ ] **Step 1: Add the route; Step 2: `pnpm generate` fails with a 404 on the route**
- [ ] **Step 3: Write the page**

```vue
<script setup lang="ts">
usePageSeo({
  title: pageTitle('Massage thaïlandais sur table'),
  description: 'Qu’est-ce que le massage thaïlandais sur table ? Pour qui ? Les bienfaits et ce qu’il faut aussi savoir. Prise de rendez-vous pour un massage thaïlandais sur table.',
  path: '/soins/massage-thailandais-sur-table/'
})
</script>

<template>
  <ServicePage title="Massage thaïlandais sur table">
    <div class="v-col col-12 sm:col-4">
      <img
        src="/img/services/massage_thailandais_1171.jpg"
        alt=""
        width="1920"
        height="1280"
        loading="lazy"
        decoding="async"
        class="block aspect-[3/2] w-full object-cover"
      >
    </div>
    <div class="v-col col-12 sm:col-4">
      <img
        src="/img/services/massage_thailandais_1215.jpg"
        alt=""
        width="1920"
        height="1280"
        loading="lazy"
        decoding="async"
        class="block aspect-[3/2] w-full object-cover"
      >
    </div>
    <div class="v-col col-12 sm:col-4">
      <img
        src="/img/services/massage_thailandais_1198.jpg"
        alt=""
        width="1920"
        height="1280"
        loading="lazy"
        decoding="async"
        class="block aspect-[3/2] w-full object-cover"
      >
    </div>

    <div class="v-col col-12">
      <h2 class="mb-5 text-kine-green">
        Qu’est ce que le massage thaïlandais sur table ?
      </h2>

      <p>
        Ce massage est normalement donné sur vêtements souples de type sport
        (legging, pantalon de sport, t-shirt sans motif).
      </p>
    </div>

    <div class="v-col col-12 sm:col-6">
      <img
        src="/img/services/massage_thailandais_1191.jpg"
        alt=""
        width="1920"
        height="1280"
        loading="lazy"
        decoding="async"
        class="block aspect-[3/2] w-full object-cover"
      >
    </div>
    <div class="v-col col-12 sm:col-6">
      <img
        src="/img/services/massage_thailandais_1233.jpg"
        alt=""
        width="1920"
        height="1280"
        loading="lazy"
        decoding="async"
        class="block aspect-[3/2] w-full object-cover"
      >
    </div>

    <div class="v-col col-12">
      <h3 class="mb-5 text-kine-green">
        Pour qui peut s’adresser ce soin ?
      </h3>
      <ul>
        <li>
          Pour les personnes qui préfèrent recevoir des soins habillés.
        </li>
      </ul>
    </div>
  </ServicePage>
</template>

<style scoped>
li {
  margin-bottom: 0.75rem;
}

ul + p {
  margin-top: 1rem;
}
</style>
```

- [ ] **Step 4: Tests pass; Step 5: visual cells pass at 390 and 1440**
- [ ] **Step 6: Commit**

```bash
git add app/pages/soins/massage-thailandais-sur-table.vue shared/utils/routes.ts
git commit -m "✨ add the table Thai massage page"
```

### Task 14: Orthothérapie page

**Files:** Create `app/pages/soins/orthotherapie-kinesitherapie-soin-therapeutique.vue`; Modify `shared/utils/routes.ts` (add `'/soins/orthotherapie-kinesitherapie-soin-therapeutique/',`).

- [ ] **Step 1: Add the route; Step 2: `pnpm generate` fails with a 404 on the route**
- [ ] **Step 3: Write the page**

```vue
<script setup lang="ts">
usePageSeo({
  title: pageTitle('Orthothérapie - Kinésithérapie / Soin thérapeutique'),
  description: 'Qu’est-ce que l’orthothérapie et la kinésithérapie ? Comment fonctionnent les ventouses ? Pour qui ? Les bienfaits et ce qu’il faut aussi savoir.',
  path: '/soins/orthotherapie-kinesitherapie-soin-therapeutique/'
})
</script>

<template>
  <ServicePage title="Orthothérapie - Kinésithérapie / Soin thérapeutique">
    <div class="v-col col-12">
      <h2 class="mb-5 text-kine-green">
        Qu’est-ce que l’orthothérapie ?
      </h2>
      <p>
        L’orthothérapie a pour objectif d’aider le système
        musculosquelettique à se rééquilibrer en intervenant essentiellement
        sur le système musculaire.
      </p>

      <p>
        L’orthothérapie est une thérapie manuelle qui combine la
        massothérapie à la kinésithérapie (la thérapie par le mouvement) et
        qui s’adresse aux personnes éprouvant
        <b>des douleurs musculaires et des raideurs articulaires,
          principalement attribuées à de mauvaises postures qui ont été
          intégrées depuis longtemps et à des mouvements brusques ou
          répétitifs</b>.
      </p>

      <p>
        L’orthothérapie est une spécialisation qui m’a permise de pousser
        davantage ma compréhension de l’anatomie et de la physiologie du
        corps humain et de <b>voir l’être humain dans son ensemble</b>.
      </p>

      <p>
        L’orthothérapie est indiquée pour : soulager les douleurs
        musculo-articulaires, les raideurs articulaires, diminuer les effets
        du stress et de l’anxiété sur le corps, apaiser les douleurs
        chroniques, calmer les spasmes musculaires.
      </p>
    </div>

    <div class="v-col col-12">
      <h2 class="mb-5 text-kine-green">
        Qu’est-ce que la kinésithérapie ?
      </h2>
      <p>
        La kinésithérapie est une technique visant à
        <b>soulager des problématiques par le mouvement</b>.
      </p>

      <p>
        C’est une technique de massothérapie avancée dont le but est de
        redonner un mouvement normal à la partie du corps souhaitée.
      </p>

      <p>
        Elle va viser la réduction de la douleur provenant des
        problématiques musculo-articulaires communes et mineures amenant des
        douleurs aiguës et ou chroniques sur une courte ou longue durée.
      </p>

      <p>
        Ce sont les muscles de mouvements, l’inflammation, la mobilité
        articulaire et la fibrose qui sont ciblés pendant les soins.
      </p>
    </div>

    <div class="v-col col-12">
      <UCard>
        <div class="card-text rounded-[4px] bg-kine-yellow text-center text-subtitle-1 font-bold text-kine-green">
          En conclusion, le soin thérapeutique comprendra toutes les
          techniques de massage que j'ai apprises afin d’aider votre système
          nerveux à se détendre puis d’appliquer les notions de
          kinésithérapie et d’orthothérapie pour vous aider à atteindre
          votre plein potentiel.
        </div>
      </UCard>
    </div>

    <div class="v-col col-12">
      <h3 class="my-5 text-kine-green">
        Comment se déroule le soin ?
      </h3>
      <p>
        Le soin débute toujours par des questions détaillées sur votre santé
        générale puis un examen visuel, palpatoire et des tests sur les
        mouvements de base d’une articulation.
      </p>

      <p>
        <b>Il est important pour nous de commencer par ces étapes afin de
          pouvoir comprendre la cause principale de vos douleurs car nous
          prenons en compte l’humain dans son ensemble.</b>
      </p>
    </div>

    <div class="v-col col-12 sm:col-8">
      <img
        src="/img/services/kinesitherapie_therapeutique.jpg"
        alt=""
        width="800"
        height="565"
        loading="lazy"
        decoding="async"
        class="block aspect-[3/2] w-full object-cover"
      >
    </div>

    <div class="v-col col-12">
      <p>
        Ensuite, le soin continuera par un massage en profondeur dans le but
        de favoriser la circulation sanguine et relâcher les tensions
        musculaires en calmant le système nerveux.
      </p>

      <p>
        Selon le segment douloureux et l’effet recherché par le
        kinésithérapeute, le massage va généralement s’accompagner de
        mobilisations musculo-articulaires. Ces mobilisations s’effectuent
        lentement, en suivant votre respiration, et toujours dans
        l’amplitude normale de l’articulation.
      </p>

      <p>
        À la fin de la séance, le kinésithérapeute vous communiquera des
        exercices et conseils qui auront pour but d’augmenter la rapidité de
        récupération et d’éviter une rechute.
      </p>

      <p>
        Ces exercices complètent l’efficacité du soin et, au besoin, vous
        prépare à votre prochaine rencontre.
      </p>

      <p>
        Il est donc important de tenir compte des conseils et exercices
        donnés par votre thérapeute car comme j’aime le dire souvent :
        <b>pour que cela fonctionne, les thérapeutes et les client.es
          doivent travailler en équipe !</b>
      </p>
    </div>

    <div class="v-col col-12">
      <h3 class="mb-5 text-kine-green">
        Mes outils
      </h3>
      <p>
        Je peux aussi être amenée à travailler avec des
        <b>ventouses en silicone pour croître l’efficacité de mes soins</b>.
      </p>
      <p>
        Je demande <b>toujours</b> votre consentement à l’utilisation de ces
        dernières avant de procéder !
      </p>
    </div>

    <div class="v-col col-12 sm:col-8">
      <img
        src="/img/services/ventouses.jpg"
        alt=""
        width="800"
        height="600"
        loading="lazy"
        decoding="async"
        class="block aspect-[4/3] w-full object-cover"
      >
    </div>

    <div class="v-col col-12">
      <h3 class="mb-5 text-kine-green">
        En quoi les ventouses seront-elles efficaces pour le soin ?
      </h3>
      <ul>
        <li><b>Activer la circulation sanguine et lymphatique</b> ;</li>
        <li>
          Aider à <b>briser la fibrose tissulaire</b> pour permettre aux
          tissus de «mieux glisser entre eux» et de «casser» le cercle
          vicieux de déchets qui s’accumulent et donc d’<b>améliorer la circulation des liquides dans la zone
            problématique</b>
          (<i>très indiquée pour les fibroses cervicales type bosse de bison
            et fibroses lombaires</i>) ;
        </li>
        <li><b>Réduire les tensions musculaires</b> récidivantes ;</li>
        <li>Aider à <b>libérer les fascias</b>.</li>
      </ul>

      <p>
        <u><b>À savoir :</b></u> des marques peuvent rester sur la peau,
        allant de quelques heures à quelques jours.
      </p>
    </div>

    <div class="v-col col-12 mt-4">
      <h3 class="mb-5 text-kine-green">
        Pour qui ?
      </h3>
      <p>
        Pour toutes les personnes ayant des inconforts, des tensions et des
        douleurs pouvant les limiter ou les gêner dans leurs activités
        quotidiennes.
      </p>

      <p>
        Je pourrai vous apporter mon aide que ce soit en cas de douleur
        aiguë, chronique ou même préventif !
      </p>

      <p>
        Le but n’est de ne pas se rendre jusqu’à la douleur aiguë vous
        empêchant toutes activités quotidiennes pour venir consulter un
        thérapeute.
      </p>

      <p><b>Mieux vaut donc prévenir la douleur !</b></p>
    </div>

    <div class="v-col col-12 mt-4">
      <h3 class="mb-5 text-kine-green">
        Les bienfaits
      </h3>
      <ul>
        <li>Favorise la mobilité articulaire d’un segment ;</li>
        <li>Diminue les douleurs articulaires et musculaires ;</li>
        <li>
          Assouplissement musculaire (d’un muscle ou d’un groupe de muscles)
          ;
        </li>
        <li>Prévient les douleurs récidivantes.</li>
      </ul>
    </div>
  </ServicePage>
</template>

<style scoped>
li {
  margin-bottom: 0.5rem;
}

ul + p {
  margin-top: 1rem;
}
</style>
```

- [ ] **Step 4: Tests pass; Step 5: visual cells pass at 390 and 1440**
- [ ] **Step 6: Commit**

```bash
git add app/pages/soins/orthotherapie-kinesitherapie-soin-therapeutique.vue shared/utils/routes.ts
git commit -m "✨ add the orthotherapy and kinesitherapy page"
```

---

### Task 15: Home introduction (hero banner)

**Files:**
- Create: `app/components/home/HomeIntroduction.vue`
- Modify: `app/pages/index.vue`, `shared/utils/site.ts` (add `HERO_ALT`), `test/content.test.ts`

**Interfaces:**
- Produces: `HERO_ALT: string` in `shared/utils/site.ts` (reused by Task 22 for `og:image:alt`).

The old `Introduction.vue` has a commented-out banner; it is not ported.

- [ ] **Step 1: Write the failing test**

Append to `test/content.test.ts`:

```ts
describe('home page sections', () => {
  const $ = loadRoute('/')

  it('shows the hero banner, with a narrow image below 600px', () => {
    const picture = $('main picture')
    expect(picture.find('source[media="(min-width: 600px)"]').attr('srcset')).toBe('/img/virginie_dang_massage_2026.png')
    expect(picture.find('img').attr('src')).toBe('/img/virginie_dang_massage_2026_mobile.png')
    expect(picture.find('img').attr('alt')).toMatch(/^Vous offrir un moment de répit/)
  })
})
```

- [ ] **Step 2: Run it**

Run: `pnpm test test/content.test.ts`
Expected: FAIL (no `picture`).

- [ ] **Step 3: Add `HERO_ALT` to `shared/utils/site.ts`**

```ts
export const HERO_ALT = 'Vous offrir un moment de répit où votre corps est accompagné dans le mouvement, afin de préserver votre autonomie avec douceur et bienveillance.'
```

- [ ] **Step 4: Write `app/components/home/HomeIntroduction.vue`**

```vue
<template>
  <div class="v-row justify-center">
    <div class="v-col col-12">
      <picture>
        <source
          media="(min-width: 600px)"
          srcset="/img/virginie_dang_massage_2026.png"
          width="1531"
          height="532"
        >
        <img
          src="/img/virginie_dang_massage_2026_mobile.png"
          :alt="HERO_ALT"
          width="921"
          height="459"
          fetchpriority="high"
          class="block h-auto max-h-[600px] w-full rounded-[4px] object-contain"
        >
      </picture>
    </div>
  </div>
</template>
```

- [ ] **Step 5: Use it in `app/pages/index.vue`**

```vue
<script setup lang="ts">
usePageSeo({ title: SITE_TITLE, description: SITE_DESCRIPTION, path: '/' })
</script>

<template>
  <div>
    <HomeIntroduction class="mb-5" />
  </div>
</template>
```

- [ ] **Step 6: Run the tests, then compare the hero region**

Run: `pnpm lint --fix && pnpm generate && pnpm test`
Expected: PASS.

With `pnpm preview` running:
```bash
cd $V
./compare.sh / 1440 900 1440x420+0+100
./compare.sh / 390 844 390x200+0+100
./compare.sh / 768 1024 768x300+0+100
```
Expected: all `"pass":true` (the rest of the page is compared from Task 18 on).

- [ ] **Step 7: Full check and commit**

Run: `pnpm lint --fix && pnpm lint && pnpm typecheck && pnpm generate && pnpm test`

```bash
git add app/components/home/HomeIntroduction.vue app/pages/index.vue shared/utils/site.ts test/content.test.ts
git commit -m "✨ add the home page hero banner"
```

---

### Task 16: Home rates section

**Files:**
- Create: `app/components/InfoCard.vue`, `app/components/home/RatesTable.vue`, `app/components/home/HomeRates.vue`
- Modify: `app/pages/index.vue`, `test/content.test.ts`

**Interfaces:**
- Produces: `<InfoCard title="…" title-class="…">` (default slot = card body blocks placed after the title; `#title` slot overrides the title content; margin classes go on `InfoCard` itself); `<RatesTable :rows="[{ duration, description, price }]" />`.

Source: `git -C /Users/damienbeaufils/IdeaProjects/ks/kine-serenite show 9236071:components/Rates.vue`. The old scoped styles map as follows: `a { color: unset; text-decoration: none }` becomes `text-inherit no-underline` on each link (`underline` where the old link had `text-decoration-underline`); `.card-header` becomes `relative -top-6` inside `InfoCard`; `.rates-table` styles move into `RatesTable`; `ul.contact li` becomes `[&>li]:mb-1 [&>li]:break-all` (the `mb-1` reproduces About's global `ul li { margin-bottom: 4px }`, which applied on the home page); `.no-bullets`, `address` and `.map` match nothing and are not ported.

- [ ] **Step 1: Write the failing test**

Add inside the `home page sections` describe block:

```ts
  it('lists the care types, both rate tables and the three schedules', () => {
    const text = normalize($('main').text())
    for (const expected of [
      'Les types de soin offerts',
      'Tarifs',
      '60 min', '90 $', '15-20 min', '40 $', '110 $',
      'Frais de déplacement en sus',
      'Lundi, mercredi, jeudi', 'Mardi', 'À domicile / en CHSLD / à l’hôpital -'
    ]) {
      expect(text).toContain(expected)
    }
    expect($('main table')).toHaveLength(2)
    expect($('main a[href="/soins/massage-de-repit/"]').first().text().trim()).toBe('Massage de répit')
  })
```

- [ ] **Step 2: Run it**

Run: `pnpm test test/content.test.ts`
Expected: FAIL.

- [ ] **Step 3: Write `app/components/InfoCard.vue`**

```vue
<script setup lang="ts">
defineProps<{
  title?: string
  titleClass?: string
}>()
</script>

<template>
  <UCard class="bg-kine-light-grey">
    <div
      class="card-title relative -top-6 mx-5 justify-center rounded-[4px] bg-kine-green py-2 font-bold text-white sm:mx-15"
      :class="titleClass"
    >
      <slot name="title">
        {{ title }}
      </slot>
    </div>
    <slot />
  </UCard>
</template>
```

- [ ] **Step 4: Write `app/components/home/RatesTable.vue`**

```vue
<script setup lang="ts">
defineProps<{
  rows: { duration: string, description: string, price: string }[]
}>()
</script>

<template>
  <div class="overflow-x-auto overflow-y-hidden">
    <table class="w-full border-separate border-spacing-0 bg-transparent leading-normal">
      <thead>
        <tr>
          <th class="h-12 border-b border-[rgba(0,0,0,0.12)] px-4 text-center text-[0.75rem] font-bold tracking-[0.05em] text-kine-green uppercase">
            Durée
          </th>
          <th class="h-12 border-b border-[rgba(0,0,0,0.12)] px-4 text-left text-[0.75rem] font-bold tracking-[0.05em] text-kine-green uppercase">
            Description
          </th>
          <th class="h-12 border-b border-[rgba(0,0,0,0.12)] px-4 text-right text-[0.75rem] font-bold tracking-[0.05em] text-kine-green uppercase">
            Tarif
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, index) in rows"
          :key="row.duration"
          class="hover:bg-[#eeeeee]"
        >
          <td
            class="h-12 px-4 align-middle text-[0.875rem] font-bold whitespace-nowrap text-kine-green"
            :class="index < rows.length - 1 ? 'border-b border-[rgba(0,0,0,0.12)]' : ''"
          >
            {{ row.duration }}
          </td>
          <td
            class="h-12 px-4 text-left align-middle text-[0.875rem] whitespace-normal text-kine-green"
            :class="index < rows.length - 1 ? 'border-b border-[rgba(0,0,0,0.12)]' : ''"
          >
            {{ row.description }}
          </td>
          <td
            class="h-12 px-4 text-right align-middle text-[0.875rem] font-bold whitespace-nowrap text-kine-green"
            :class="index < rows.length - 1 ? 'border-b border-[rgba(0,0,0,0.12)]' : ''"
          >
            {{ row.price }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
```

- [ ] **Step 5: Write `app/components/home/HomeRates.vue`**

```vue
<script setup lang="ts">
const tableRates = [
  {
    duration: '60 min',
    description: 'Massage sur table où vous êtes confortablement allongé sur le ventre puis sur le dos tout au long de la séance - à la clinique de Physiothérapie France Roy ou à mon bureau à Clermont.',
    price: '90 $'
  }
]

const homeRates = [
  { duration: '15-20 min', description: 'Un premier pas tout en douceur, pour apprivoiser le toucher à votre rythme.', price: '40 $' },
  { duration: '30 min', description: 'Un moment de présence et de détente, là où vous en êtes aujourd’hui.', price: '55 $' },
  { duration: '45 min', description: 'Du temps pour vraiment prendre soin de vous, sans se presser.', price: '80 $' },
  { duration: '60 min', description: 'Une heure entière pour s’abandonner, laisser le corps se relâcher pleinement.', price: '110 $' }
]
</script>

<template>
  <div>
    <InfoCard title="Les types de soin offerts" class="mt-10">
      <div class="card-text text-kine-green sm:px-15">
        <div class="mb-6 sm:mx-5">
          <UCard>
            <div class="card-text mb-3 rounded-[4px] bg-kine-yellow py-3 text-center font-bold text-kine-green">
              Massage professionnel réalisé sur table de massage
            </div>
          </UCard>
          <p>
            À la clinique de Physiothérapie France Roy ou à mon bureau à
            Clermont.
            <br>
            C’est un soin combinant des techniques de massage suédois, tissus
            profonds et thaïlandais sur table.
          </p>
          <p class="font-bold">
            L’objectif est de favoriser le relâchement des tensions et de
            promouvoir un état de détente.
          </p>
        </div>

        <div class="my-5 sm:mx-5">
          <UCard>
            <div class="card-text mb-3 rounded-[4px] bg-kine-yellow py-3 text-center font-bold text-kine-green">
              Massage de confort adapté aux personnes en perte d’autonomie,
              offert à domicile, en CHSLD ou à l’hôpital -<br class="max-lg:hidden">
              <i>ce soin ne se donne pas sur une table de massage</i>
            </div>
          </UCard>
          <p>
            C’est un soin de confort dans une <u>installation adaptée</u> (dans
            votre fauteuil, une chaise longue, etc.), alliés à des mobilisations
            douces - <i>des mouvements guidés des bras, des jambes</i> - visant
            à préserver la souplesse, encourager le mouvement et relâcher les
            tensions.
          </p>
          <p class="font-bold">
            Le but est surtout de vous déposer et de vous reconnecter avec
            vous-même, juste le temps du soin.
          </p>
          <p>
            Plus de détail en cliquant ici :&nbsp;<NuxtLink
              class="font-bold text-inherit underline"
              to="/soins/massage-de-repit/"
            >Massage de répit</NuxtLink>
          </p>
        </div>
      </div>
    </InfoCard>

    <InfoCard title="Tarifs" class="mt-10">
      <div class="card-text text-center text-kine-green">
        <UCard class="my-5 sm:mx-15">
          <div class="card-title mt-1 justify-center text-center font-bold text-kine-green italic">
            <div>
              Massage professionnel réalisé sur table de massage<br class="max-lg:hidden">
              <small class="text-vuetify-red">(je ne prends plus de nouveaux clients jusqu’à nouvel
                ordre)</small>
            </div>
          </div>

          <div class="card-text pt-0 text-kine-green">
            <RatesTable :rows="tableRates" />
          </div>
        </UCard>

        <UCard class="sm:mx-15 sm:my-5">
          <div class="card-title mt-1 justify-center text-center font-bold text-kine-green italic">
            Massage adapté à domicile – approche centrée sur l'humain
          </div>

          <div class="card-text pt-0 text-kine-green">
            <RatesTable :rows="homeRates" />
          </div>

          <div class="card-text pt-0">
            <UCard class="shadow-none! sm:mx-5">
              <div class="card-text text-left text-kine-green">
                <p class="mb-1 font-bold">
                  Frais de déplacement en sus
                </p>
                <p class="mb-1">
                  <span class="font-bold">10 $</span> - Clermont,
                  St-Agnès, Pointe-au-Pic, Cap-à-l’Aigle
                </p>
                <p class="mb-1">
                  <span class="font-bold">20 $</span> - St-Fidèle,
                  St-Hilarion, Notre-Dame-des-Monts, St-Aimé-des-Lacs
                </p>
                <p class="mb-0">
                  <span class="font-bold">30 $</span> - Baie-Saint-Paul,
                  St-Siméon, Les Éboulements, St-Irénée
                </p>
              </div>
            </UCard>
          </div>
        </UCard>

        <p class="mt-3 italic sm:mt-0">
          Reçus disponibles en massothérapie, kinésithérapie et orthothérapie
          pour fins d’assurances
        </p>
        <p>
          <a
            href="https://rmpq.ca/repertoire-des-membres/clermont/virginie-dang-778809/"
            target="_blank"
            class="text-inherit no-underline"
          >
            <img
              src="/img/rmpq.jpg"
              alt="Membre du Réseau des massothérapeutes professionnels du Québec (RMPQ)"
              width="728"
              height="90"
              loading="lazy"
              decoding="async"
              class="mx-auto block h-auto w-full max-w-[500px]"
            >
          </a>
        </p>
      </div>
    </InfoCard>

    <div class="v-row">
      <div class="v-col col-12 sm:col-6">
        <InfoCard title="Lundi, mercredi, jeudi" class="mt-10">
          <div class="card-subtitle mt-1 text-center font-bold text-kine-green underline">
            Clinique de physiothérapie France Roy
          </div>

          <div class="card-text justify-center pb-0 text-center text-kine-green">
            <p>
              425 Bd de Comporté, La Malbaie, QC G5A 1W5
              <br>
              <a
                class="text-inherit underline"
                href="https://www.physiotherapiefranceroy.com/"
                target="_blank"
              >physiotherapiefranceroy.com</a>
            </p>

            <p>
              <span class="font-bold">Horaires :</span>
              <br>
              Lundi & mercredi - 14h30 à 19h45 (dernier à 18h45)
              <br>
              Jeudi - 09h30 à 14h45 (dernier à 13h45)
            </p>
          </div>

          <div class="card-actions justify-center pb-2 text-center text-kine-green">
            <p>
              <span class="font-bold">Prendre rendez-vous :</span>
              <br>
              Appelez au <a
                class="text-inherit no-underline"
                href="tel:4186653980"
              >(418) 665-3980</a> directement
              à la clinique de physiothérapie pour un rendez-vous.
            </p>
          </div>
        </InfoCard>
      </div>

      <div class="v-col col-12 sm:col-6">
        <InfoCard title="Mardi" class="mt-5 sm:mt-10">
          <div class="card-subtitle mt-1 text-center text-kine-green">
            <p class="mb-3 font-bold underline">
              Je pratique chez nous les mardis.
            </p>
            <p class="mb-2 font-bold text-vuetify-red">
              Non adapté pour les personnes à mobilité réduite
            </p>
          </div>

          <div class="card-text justify-center pb-0 text-center text-kine-green">
            <p>2 rue Beauregard, Clermont, QC G4A 0A2</p>
            <p>
              <span class="font-bold">Horaires :</span>
              <br>
              Mardi - 09h00 à 17h30 (dernier à 16h30)
            </p>
          </div>

          <div class="card-actions justify-center pb-2 text-center text-kine-green">
            <p>
              <span class="font-bold">Prendre rendez-vous :</span>
              <br>
              Appelez au <a
                class="text-inherit no-underline"
                href="tel:4187901294"
              >(418) 790-1294</a> ou sur
              Gorendezvous :
              <a
                class="text-inherit underline"
                href="https://www.gorendezvous.com/virginiedang"
                target="_blank"
              >gorendezvous.com/virginiedang</a>
            </p>
          </div>
        </InfoCard>
      </div>

      <div class="v-col col-12 mx-auto sm:col-6">
        <InfoCard class="mt-5 sm:mt-10" title-class="text-center">
          <template #title>
            À domicile / en CHSLD / à l’hôpital -
            <br class="max-lg:hidden">sur demande
          </template>

          <div class="card-text mt-1 text-center text-kine-green">
            <p>
              Offert uniquement pour les personnes en perte d’autonomie ne
              pouvant recevoir un massage sur une table traditionnelle et leurs
              proches aidants.
            </p>
          </div>

          <div class="card-actions justify-center pb-5 text-center text-kine-green">
            <div>
              <p class="mb-2 font-bold">
                Écrivez-moi via :
              </p>
              <ul class="text-left sm:ml-5 [&>li]:mb-1 [&>li]:break-all">
                <li>
                  Facebook Messenger :
                  <a
                    class="text-inherit underline"
                    href="https://www.facebook.com/virginiedang.massotherapeute"
                    target="_blank"
                  >facebook.com/virginiedang.massotherapeute</a>
                </li>
                <li>
                  Par courriel :
                  <a
                    class="text-inherit underline"
                    href="mailto:virginiedang.massotherapeute@gmail.com"
                    target="_blank"
                  >virginiedang.massotherapeute@gmail.com</a>
                </li>
                <li>
                  Par téléphone (laissez-moi un message vocal) :
                  <a
                    class="text-inherit underline"
                    href="tel:4187901294"
                    target="_blank"
                  >(418) 790-1294</a>
                </li>
              </ul>
            </div>
          </div>
        </InfoCard>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 6: Add the section to `app/pages/index.vue`**

```vue
    <HomeIntroduction class="mb-5" />
    <HomeRates class="mb-10" />
```

- [ ] **Step 7: Run the tests and compare**

Run: `pnpm lint --fix && pnpm generate && pnpm test`
Expected: PASS.

With `pnpm preview` running, compare the region from the top of the page down to the end of the schedule cards. Measure where the rates section ends on the old site first:

```bash
agent-browser --session verify-old set viewport 1440 900 && agent-browser --session verify-old open http://localhost:3000/ && agent-browser --session verify-old eval "Math.round(document.querySelector('#a-propos').getBoundingClientRect().top + scrollY)"
```

Use that value (≈ 2690 at 1440) minus 20 as the crop height, then:

```bash
cd $V
./compare.sh / 1440 900 1440x<height>+0+0
```
Repeat at 390×844 and 1024×768 with their own heights. Expected: `"pass":true`. The yellow banners, both tables (hover a row with `agent-browser hover` to see `#eeeeee`), the floating headers and the two-row footer at 1024 must match.

- [ ] **Step 8: Full check and commit**

Run: `pnpm lint --fix && pnpm lint && pnpm typecheck && pnpm generate && pnpm test`

```bash
git add app/components/InfoCard.vue app/components/home/RatesTable.vue app/components/home/HomeRates.vue app/pages/index.vue test/content.test.ts
git commit -m "✨ add the care types, rates and schedules section"
```

---

### Task 17: Home about section

**Files:**
- Create: `app/components/home/HomeAbout.vue`
- Modify: `app/pages/index.vue`, `test/content.test.ts`

Source: `git -C /Users/damienbeaufils/IdeaProjects/ks/kine-serenite show 9236071:components/About.vue`. The old global `ul li { margin-bottom: 4px }` becomes `[&>li]:mb-1` on the list. The old `v-card-text` directly under the card had Vuetify's `rgba(0,0,0,.6)` text colour; it is kept even though every child sets its own colour.

- [ ] **Step 1: Write the failing test** (inside `home page sections`)

```ts
  it('introduces Virginie with her training list', () => {
    expect($('#a-propos h2').text().trim()).toBe('À propos')
    expect($('#a-propos img').attr('src')).toBe('/img/virginie_dang_photo_profil.jpg')
    expect($('#a-propos ul li')).toHaveLength(12)
  })
```

- [ ] **Step 2: Run it** — Expected: FAIL.

- [ ] **Step 3: Write `app/components/home/HomeAbout.vue`**

```vue
<template>
  <UCard id="a-propos">
    <div class="card-title justify-center rounded-t-[4px] bg-kine-green text-white">
      <h2 class="text-h5 font-normal sm:text-h4">
        À propos
      </h2>
    </div>
    <div class="card-text text-[rgba(0,0,0,0.6)]">
      <div class="v-row items-center justify-center">
        <div class="v-col col-12 sm:col-3">
          <img
            src="/img/virginie_dang_photo_profil.jpg"
            alt="Photo de profil de Virginie Dang"
            width="333"
            height="500"
            loading="lazy"
            decoding="async"
            class="mx-auto mt-5 block aspect-[333/500] w-full rounded-[4px] object-cover max-sm:max-h-[200px] max-sm:max-w-[200px]"
          >
        </div>

        <div class="v-col col-12 sm:col-9">
          <UCard class="shadow-none!">
            <div class="card-text pb-0 text-kine-green">
              <h3 class="my-5 text-kine-green">
                &gt; Qui suis-je ?
              </h3>

              <p>
                Je suis Virginie et
                <b>aller à la rencontre de l’autre pour l’aider a toujours fait
                  parti de mes valeurs.</b>
              </p>

              <p>
                J’ai découvert une véritable passion pour la massothérapie
                depuis 2020 — un feu intérieur que je nourris chaque jour :
                <b>c’est ce mélange riche entre la compréhension du corps
                  humain, de l’esprit et la puissance du lien humain</b>.
              </p>

              <h3 class="my-5 text-kine-green">
                &gt; Quelle est ma mission ?
              </h3>

              <p>
                Mes mains sont le prolongement de mon cœur, ce lieu où je me
                sens chez moi. À travers elles, j’aimerais vous offrir un peu de
                réconfort, d’apaisement et un espace pour vous reconnecter à
                vous-même.
              </p>
              <p class="mb-0">
                Je veux alors vous offrir un moment de répit où le corps est
                accompagné dans le mouvement, afin de préserver l’autonomie avec
                douceur et bienveillance.
              </p>
            </div>
          </UCard>
        </div>
      </div>

      <UCard class="shadow-none!">
        <div class="card-text text-kine-green">
          <h3 class="my-5 text-kine-green">
            &gt; Mes formations :
          </h3>
          <ul class="[&>li]:mb-1">
            <li>
              <i>En cours jusqu’à novembre 2026</i> - Formation Masso-Oncologie
              Chrysalide, École de massothérapie et kinésithérapie l'Hêtre, 160h
              – 2026
            </li>
            <li>
              Formation Massage Thaïlandais sur table, École de massothérapie et
              kinésithérapie l'Hêtre, 35h – 2025
            </li>
            <li>
              Formation Anatomie Musculaire Avancée et Points Gâchettes, École
              de massothérapie et kinésithérapie l'Hêtre, 30h – 2025
            </li>
            <li>
              Formation Anatomie sur cadavre, Université du Québec à
              Trois-Rivières, 6h – 2024
            </li>
            <li>
              Formation viscérale (massage du ventre), École de massothérapie et
              kinésithérapie l'Hêtre, 21h – 2023
            </li>
            <li>
              Deep Tissue sans huile (tissus profonds), Kiné-Concept Guijek, 45h
              – 2022
            </li>
            <li>
              Orthothérapie (incluant Point Knap, isométrie/isoposture),
              Académie de Massage Scientifique, 200h – 2022
            </li>
            <li>
              Vacuothérapie : problématiques générales et sportives, Académie de
              Massage Scientifique, 12h – 2021
            </li>
            <li>
              Massothérapie avancée (kinésithérapie, massage femme enceinte et
              enfants, lomi-Lomi, oncologie, oscillation rythmée), 176h – 2021
            </li>
            <li>
              Drainage Lymphatique, méthode Dr. Leduc, Académie de Massage
              Scientifique , 24h – 2021
            </li>
            <li>
              Massage suédois international intramusculaire et de détente,
              Académie de Massage Scientifique, 424h – 2021
            </li>
            <li>
              Introduction au massage Suédois Cinétique, Institut Kiné-Concept,
              15h – 2020
            </li>
          </ul>
        </div>
      </UCard>
    </div>
  </UCard>
</template>
```

- [ ] **Step 4: Add `<HomeAbout class="mb-10" />` after `HomeRates` in `app/pages/index.vue`**

- [ ] **Step 5: Run the tests and compare**

Run: `pnpm lint --fix && pnpm generate && pnpm test` — Expected: PASS.

Measure the old `#techniques` top (`agent-browser --session verify-old eval "Math.round(document.querySelector('#techniques').getBoundingClientRect().top + scrollY)"`) at each viewport and compare from 0 to that value minus 20, at 390×844, 1024×768 and 1440×900. Expected: `"pass":true`. At 390 the profile photo must be a centred 200×200 crop.

- [ ] **Step 6: Full check and commit**

```bash
git add app/components/home/HomeAbout.vue app/pages/index.vue test/content.test.ts
git commit -m "✨ add the about section"
```

---

### Task 18: Home services section, full home parity and link checks

**Files:**
- Create: `app/components/home/ServiceTile.vue`, `app/components/home/HomeServices.vue`, `test/links.test.ts`
- Modify: `app/pages/index.vue`, `test/content.test.ts`

**Interfaces:**
- Produces: `<ServiceTile to="/soins/…/" image="/img/services/….jpg" :width :height alt="">title content</ServiceTile>`; omit `to` for an unlinked tile.

Source: `git -C /Users/damienbeaufils/IdeaProjects/ks/kine-serenite show 9236071:components/Services.vue`.

- [ ] **Step 1: Write the failing tests**

In `test/content.test.ts`, replace

```ts
// The home page is assembled over Tasks 15 to 18; Task 18 removes this exclusion.
const CONTENT_ROUTES = PRERENDER_ROUTES.filter(route => route !== '/')

describe.each(CONTENT_ROUTES)('%s content', (route) => {
```

with

```ts
describe.each(PRERENDER_ROUTES)('%s content', (route) => {
```

Create `test/links.test.ts`:

```ts
import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { PRERENDER_ROUTES } from '../shared/utils/routes'
import { baseline } from './helpers/baseline'
import { loadRoute, outputPath, routeFile } from './helpers/output'

describe('route list', () => {
  it('prerenders exactly the pages of the live site', () => {
    expect([...PRERENDER_ROUTES].sort()).toEqual(Object.keys(baseline.pages).sort())
  })
})

describe.each(PRERENDER_ROUTES)('%s links and images', (route) => {
  const $ = loadRoute(route)

  it('points every internal link at a generated file, with a trailing slash for pages', () => {
    const hrefs = $('a[href^="/"]').map((_, el) => $(el).attr('href')!).get()
    for (const href of hrefs) {
      const path = href.split('#')[0]!.split('?')[0]!
      const isPage = !/\.[a-z0-9]+$/i.test(path)
      if (isPage) {
        expect(path, href).toMatch(/\/$/)
        expect(existsSync(outputPath(routeFile(path))), href).toBe(true)
      } else {
        expect(existsSync(outputPath(path.slice(1))), href).toBe(true)
      }
    }
  })

  it('points every image at a generated file', () => {
    const sources = [
      ...$('img[src^="/"]').map((_, el) => $(el).attr('src')!).get(),
      ...$('source[srcset^="/"]').map((_, el) => $(el).attr('srcset')!).get()
    ]
    for (const src of sources) {
      expect(existsSync(outputPath(src.slice(1))), src).toBe(true)
    }
  })
})

describe('home service tiles', () => {
  const $ = loadRoute('/')

  it('links five tiles and leaves the Thai massage tile unlinked', () => {
    const linked = $('#techniques a').map((_, el) => $(el).attr('href')).get()
    expect(linked).toEqual([
      '/soins/massage-de-repit/',
      '/soins/orthotherapie-kinesitherapie-soin-therapeutique/',
      '/soins/drainage-lymphatique/',
      '/soins/massage-femme-enceinte/',
      '/soins/massage-deep-tissue/'
    ])
    expect($('#techniques h3').last().text().trim()).toBe('Massage thaïlandais sur table')
    expect($('#techniques h3').last().closest('a')).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run them** — Expected: FAIL (home text mismatch, no `#techniques`).

- [ ] **Step 3: Write `app/components/home/ServiceTile.vue`**

```vue
<script setup lang="ts">
defineProps<{
  to?: string
  image: string
  width: number
  height: number
  alt: string
}>()

const NuxtLink = resolveComponent('NuxtLink')
</script>

<template>
  <div class="v-col col-12 sm:col-4">
    <UCard
      :as="to ? NuxtLink : 'div'"
      :to="to"
      class="block text-inherit no-underline shadow-none! transition-shadow duration-[280ms] ease-vuetify hover:shadow-elevation-12!"
    >
      <div class="card-text text-kine-green">
        <img
          :src="image"
          :alt="alt"
          :width="width"
          :height="height"
          loading="lazy"
          decoding="async"
          class="block aspect-[3/2] w-full rounded-[4px] object-cover"
        >
        <h3 class="mt-2">
          <slot />
        </h3>
      </div>
    </UCard>
  </div>
</template>
```

- [ ] **Step 4: Write `app/components/home/HomeServices.vue`**

```vue
<template>
  <UCard id="techniques" class="text-center">
    <div class="card-title justify-center rounded-t-[4px] bg-kine-green p-5 text-white">
      <h1 class="text-h5 font-normal sm:text-h4">
        Détail des techniques
      </h1>
    </div>
    <div class="card-text p-5 text-kine-green">
      <div class="v-row justify-center">
        <div class="v-col col-12">
          <UCard>
            <div class="card-text rounded-[4px] bg-kine-yellow text-center font-cursive text-h6 font-bold text-kine-green italic sm:text-h5">
              Je vous concocte un soin sur-mesure alliant toutes ces techniques.
            </div>
          </UCard>
        </div>

        <div class="v-col col-12">
          👇 Cliquez sur un élément pour avoir plus d'informations 👇
        </div>

        <ServiceTile
          to="/soins/massage-de-repit/"
          image="/img/services/massage_de_repit.jpg"
          :width="800"
          :height="537"
          alt=""
        >
          Massage de répit<br>(à domicile / CHSLD / hôpital)
        </ServiceTile>

        <ServiceTile
          to="/soins/orthotherapie-kinesitherapie-soin-therapeutique/"
          image="/img/services/kinesitherapie_therapeutique.jpg"
          :width="800"
          :height="565"
          alt=""
        >
          Orthothérapie - Kinésithérapie / Soin thérapeutique
        </ServiceTile>

        <ServiceTile
          to="/soins/drainage-lymphatique/"
          image="/img/services/drainage_lymphatique.jpg"
          :width="800"
          :height="531"
          alt=""
        >
          Drainage lymphatique
        </ServiceTile>

        <ServiceTile
          to="/soins/massage-femme-enceinte/"
          image="/img/services/massage_femme_enceinte.jpg"
          :width="800"
          :height="510"
          alt=""
        >
          Massage pour femme enceinte
        </ServiceTile>

        <ServiceTile
          to="/soins/massage-deep-tissue/"
          image="/img/services/massage_tissus_profonds.jpg"
          :width="800"
          :height="533"
          alt=""
        >
          Massage des tissus profonds<br class="max-lg:hidden">
          (Deep Tissue)
        </ServiceTile>

        <ServiceTile
          image="/img/services/massage_thailandais.jpg"
          :width="1280"
          :height="855"
          alt=""
        >
          Massage thaïlandais sur table
        </ServiceTile>
      </div>
    </div>
  </UCard>
</template>
```

- [ ] **Step 5: Complete `app/pages/index.vue`**

```vue
<script setup lang="ts">
usePageSeo({ title: SITE_TITLE, description: SITE_DESCRIPTION, path: '/' })
</script>

<template>
  <div>
    <HomeIntroduction class="mb-5" />
    <HomeRates class="mb-10" />
    <HomeAbout class="mb-10" />
    <HomeServices />
  </div>
</template>
```

- [ ] **Step 6: Run the tests**

Run: `pnpm lint --fix && pnpm generate && pnpm test`
Expected: PASS, including `/ content` against the live site's text.

- [ ] **Step 7: Trailing-slash redirects (Review Focus 3)**

With `pnpm preview` running:

```bash
for p in /soins/massage-de-repit /politiques-annulation-confidentialite /soins/massage-anti-stress; do curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" "http://localhost:3001$p"; done
```
Expected: `301 http://localhost:3001<path>/` for each.

- [ ] **Step 8: Anchor links from a service page (Review Focus 3)**

```bash
export AGENT_BROWSER_SESSION=task18
agent-browser set viewport 1440 900 && agent-browser open http://localhost:3001/soins/massage-de-repit/ && agent-browser wait --load load
agent-browser find text "Détail des techniques" click && agent-browser wait 1500
agent-browser get url
agent-browser eval "Math.round(document.querySelector('#techniques').getBoundingClientRect().top)"
agent-browser set viewport 390 844 && agent-browser open http://localhost:3001/soins/massage-de-repit/ && agent-browser wait --load load
agent-browser click 'header button[aria-label="Menu"]' && agent-browser wait 500 && agent-browser find text "À propos" click && agent-browser wait 1500
agent-browser get url
agent-browser eval "Math.round(document.querySelector('#a-propos').getBoundingClientRect().top)"
```
Expected: URLs `http://localhost:3001/#techniques` and `http://localhost:3001/#a-propos`; each `top` between 0 and 10 (section scrolled to the top). The old site jumps the same way; if the new one lands elsewhere, set `router.options.scrollBehaviorType` or an `app/router.options.ts` scroll behaviour until it matches.

- [ ] **Step 9: Full-page home comparison**

```bash
cd $V
./compare.sh / 390 844
./compare.sh / 1024 768
./compare.sh / 1440 900
```
Expected: `"pass":true` for all three. Hover a tile (`agent-browser snapshot -i`, then `agent-browser hover @eN` on both sites) and check the elevation-12 shadow appears, on the Thai tile too.

- [ ] **Step 10: Full check and commit**

Run: `pnpm lint --fix && pnpm lint && pnpm typecheck && pnpm generate && pnpm test`

```bash
git add app/components/home/ServiceTile.vue app/components/home/HomeServices.vue app/pages/index.vue test/content.test.ts test/links.test.ts
git commit -m "✨ add the services section and check every internal link"
```

---

### Task 19: Generated sitemap and robots.txt

**Files:**
- Create: `test/sitemap.test.ts`
- Delete: `public/robots.txt`, `public/sitemap.xml`
- Modify: `nuxt.config.ts`, `package.json`, `pnpm-lock.yaml`

**Interfaces:**
- Produces: `site` config (`url`, `name`, `defaultLocale: 'fr'`, `trailingSlash: true`) shared with `nuxt-schema-org` (Task 21); `useRobotsRule()` available to `error.vue` (Task 20).

- [ ] **Step 1: Write the failing test `test/sitemap.test.ts`**

```ts
import * as cheerio from 'cheerio'
import { describe, expect, it } from 'vitest'
import { PRERENDER_ROUTES } from '../shared/utils/routes'
import { loadRoute, readOutput } from './helpers/output'

const EXPECTED: Record<string, number> = {
  'https://kine-serenite.ca/': 1,
  'https://kine-serenite.ca/politiques-annulation-confidentialite/': 0.7,
  'https://kine-serenite.ca/soins/drainage-lymphatique/': 0.8,
  'https://kine-serenite.ca/soins/massage-anti-stress/': 0.8,
  'https://kine-serenite.ca/soins/massage-de-repit/': 0.8,
  'https://kine-serenite.ca/soins/massage-deep-tissue/': 0.8,
  'https://kine-serenite.ca/soins/massage-femme-enceinte/': 0.8,
  'https://kine-serenite.ca/soins/orthotherapie-kinesitherapie-soin-therapeutique/': 0.8
}

describe('sitemap.xml', () => {
  const xml = readOutput('sitemap.xml')
  const $ = cheerio.load(xml, { xml: true })
  const entries = $('url').map((_, el) => ({
    loc: $(el).find('loc').text(),
    priority: Number($(el).find('priority').text()),
    changefreq: $(el).find('changefreq').text(),
    lastmod: $(el).find('lastmod').length
  })).get()

  it('lists the 8 indexable pages, not the Thai massage page', () => {
    expect(entries.map(entry => entry.loc).sort()).toEqual(Object.keys(EXPECTED).sort())
  })

  it('keeps the old priorities and monthly change frequency', () => {
    for (const entry of entries) {
      expect(entry.priority, entry.loc).toBe(EXPECTED[entry.loc])
      expect(entry.changefreq, entry.loc).toBe('monthly')
    }
  })

  it('has no lastmod and no XSL stylesheet', () => {
    expect(entries.every(entry => entry.lastmod === 0)).toBe(true)
    expect(xml).not.toContain('xml-stylesheet')
  })
})

describe('robots.txt', () => {
  const robots = readOutput('robots.txt')

  it('allows every crawler, including /_nuxt/', () => {
    expect(robots).toMatch(/^User-agent:\s*\*$/m)
    expect(robots).not.toMatch(/^Disallow:\s*\/\S/m)
  })

  it('points to the sitemap', () => {
    expect(robots).toMatch(/^Sitemap:\s*https:\/\/kine-serenite\.ca\/sitemap\.xml$/m)
  })
})

describe.each(PRERENDER_ROUTES)('%s robots meta', (route) => {
  it('is indexable', () => {
    const robots = loadRoute(route)('meta[name="robots"]').attr('content')
    if (robots) {
      expect(robots).toMatch(/\bindex\b/)
      expect(robots).not.toMatch(/noindex/)
    }
  })
})
```

- [ ] **Step 2: Run it** — Expected: FAIL (`Disallow: /_nuxt/` present, Thai page absent but priorities as strings `1.00`… may already match; the robots test fails).

- [ ] **Step 3: Install the modules and remove the static copies**

```bash
pnpm add @nuxtjs/sitemap@latest @nuxtjs/robots@latest
git rm -q public/robots.txt public/sitemap.xml
```

- [ ] **Step 4: Configure them in `nuxt.config.ts`**

Add to `modules`: `'@nuxtjs/sitemap'`, `'@nuxtjs/robots'`. Add the import `import { SITE_TITLE, SITE_URL } from './shared/utils/site'`. Add:

```ts
  site: {
    url: SITE_URL,
    name: SITE_TITLE,
    defaultLocale: 'fr',
    trailingSlash: true
  },

  sitemap: {
    xsl: false,
    exclude: ['/soins/massage-thailandais-sur-table', '/soins/massage-thailandais-sur-table/**'],
    defaults: {
      changefreq: 'monthly',
      priority: 0.8
    }
  },

  routeRules: {
    '/': { sitemap: { priority: 1 } },
    '/politiques-annulation-confidentialite': { sitemap: { priority: 0.7 } }
  },
```

and change the prerender routes to `routes: [...PRERENDER_ROUTES, '/sitemap.xml']`.

- [ ] **Step 5: Run the tests**

Run: `pnpm generate && pnpm test`
Expected: PASS. If the policies priority stays 0.8, change its `routeRules` key to `'/politiques-annulation-confidentialite/'` and re-run. If a `lastmod` appears, set `sitemap.autoLastmod: false`.

- [ ] **Step 6: Full check and commit**

Run: `pnpm lint --fix && pnpm lint && pnpm typecheck && pnpm generate && pnpm test`

```bash
git add nuxt.config.ts package.json pnpm-lock.yaml test/sitemap.test.ts
git commit -m "🔍 generate the sitemap and robots.txt from the route list"
```

---

### Task 20: French 404 page

**Files:**
- Create: `app/error.vue`
- Modify: `nuxt.config.ts` (`experimental.prerenderErrorPages`), `test/output.test.ts`

- [ ] **Step 1: Write the failing test** (append to `test/output.test.ts`)

```ts
import * as cheerio from 'cheerio'

describe('404.html', () => {
  it('is a prerendered French page that search engines skip', () => {
    const $ = cheerio.load(readFileSync(outputPath('404.html'), 'utf8'))
    expect($('html').attr('lang')).toBe('fr')
    expect($('h1').text().trim()).toBe('Page introuvable')
    expect($('meta[name="robots"]').attr('content')).toMatch(/noindex/)
    expect($('main a[href="/"]').text().trim()).toBe('Retour à l’accueil')
    expect($('header nav a')).toHaveLength(4)
  })
})
```

Move the new import to the top of the file with the others.

- [ ] **Step 2: Run it** — Expected: FAIL (`404.html` is an empty SPA shell).

- [ ] **Step 3: Write `app/error.vue`**

```vue
<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const heading = computed(() => props.error.status === 404 ? 'Page introuvable' : 'Une erreur est survenue')

useSeoMeta({ title: () => pageTitle(heading.value) })
useRobotsRule({ noindex: true })
</script>

<template>
  <UApp>
    <NuxtLayout>
      <ServicePage :title="heading">
        <div class="v-col col-12 text-center">
          <p>La page demandée n’existe pas ou a été déplacée.</p>
          <NuxtLink to="/">
            Retour à l’accueil
          </NuxtLink>
        </div>
      </ServicePage>
    </NuxtLayout>
  </UApp>
</template>
```

- [ ] **Step 4: Enable error-page prerendering in `nuxt.config.ts`**

Inside `experimental`, add `prerenderErrorPages: true`.

- [ ] **Step 5: Run the tests and check a real 404**

Run: `pnpm lint --fix && pnpm generate && pnpm test` — Expected: PASS.
With `pnpm preview`: `curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3001/nope/` → `404`; open it with agent-browser at 1440 and check the page shows the header, the teal "Page introuvable" card and the footer.

- [ ] **Step 6: Full check and commit**

```bash
git add app/error.vue nuxt.config.ts test/output.test.ts
git commit -m "✨ add a French 404 page"
```

---

### Task 21: LocalBusiness structured data

**Files:**
- Create: `test/schema.test.ts`
- Modify: `nuxt.config.ts`, `package.json`, `pnpm-lock.yaml`

- [ ] **Step 1: Write the failing test `test/schema.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { PRERENDER_ROUTES } from '../shared/utils/routes'
import { loadRoute } from './helpers/output'

type Node = Record<string, unknown> & { '@type'?: string | string[] }

function graphOf(route: string): Node[] {
  const $ = loadRoute(route)
  return $('script[type="application/ld+json"]').map((_, el) => {
    const json = JSON.parse($(el).text())
    return (json['@graph'] ?? [json]) as Node[]
  }).get().flat()
}

const hasType = (node: Node, type: string) => [node['@type']].flat().includes(type)

describe.each(PRERENDER_ROUTES)('%s structured data', (route) => {
  const graph = graphOf(route)

  it('describes the website and the page', () => {
    expect(graph.some(node => hasType(node, 'WebSite'))).toBe(true)
    expect(graph.some(node => hasType(node, 'WebPage'))).toBe(true)
  })

  it('identifies the business', () => {
    const business = graph.find(node => hasType(node, 'HealthAndBeautyBusiness'))
    expect(business).toBeDefined()
    expect(business).toMatchObject({
      name: 'Kiné-Sérénité',
      telephone: '+1-418-790-1294',
      email: 'virginiedang.massotherapeute@gmail.com',
      address: {
        streetAddress: '2 rue Beauregard',
        addressLocality: 'Clermont',
        addressRegion: 'QC',
        postalCode: 'G4A 0A2',
        addressCountry: 'CA'
      }
    })
    expect(JSON.stringify(business)).toContain('Virginie Dang')
    expect(JSON.stringify(business)).toContain('Tuesday')
    expect(business!.sameAs).toEqual(expect.arrayContaining([
      'https://www.facebook.com/virginiedang.massotherapeute',
      'https://www.gorendezvous.com/virginiedang',
      'https://rmpq.ca/repertoire-des-membres/clermont/virginie-dang-778809/'
    ]))
    expect(business!.areaServed).toHaveLength(12)
  })
})
```

- [ ] **Step 2: Run it** — Expected: FAIL (no JSON-LD).

- [ ] **Step 3: Install and configure `nuxt-schema-org`**

Run: `pnpm add nuxt-schema-org@latest`

In `nuxt.config.ts`, add `'nuxt-schema-org'` to `modules`, `import { defineLocalBusiness } from 'nuxt-schema-org/schema'` at the top, and:

```ts
  schemaOrg: {
    identity: defineLocalBusiness({
      '@type': 'HealthAndBeautyBusiness',
      'name': 'Kiné-Sérénité',
      'url': SITE_URL,
      'logo': '/img/virginie_dang_massotherapeute_logo_2026.png',
      'image': '/img/virginie_dang_massage_2026.png',
      'telephone': '+1-418-790-1294',
      'email': 'virginiedang.massotherapeute@gmail.com',
      'founder': { '@type': 'Person', 'name': 'Virginie Dang' },
      'address': {
        streetAddress: '2 rue Beauregard',
        addressLocality: 'Clermont',
        addressRegion: 'QC',
        postalCode: 'G4A 0A2',
        addressCountry: 'CA'
      },
      'openingHoursSpecification': [
        { dayOfWeek: 'Tuesday', opens: '09:00', closes: '17:30' }
      ],
      'areaServed': [
        'Clermont', 'Sainte-Agnès', 'Pointe-au-Pic', 'Cap-à-l’Aigle',
        'Saint-Fidèle', 'Saint-Hilarion', 'Notre-Dame-des-Monts', 'Saint-Aimé-des-Lacs',
        'Baie-Saint-Paul', 'Saint-Siméon', 'Les Éboulements', 'Saint-Irénée'
      ],
      'sameAs': [
        'https://www.facebook.com/virginiedang.massotherapeute',
        'https://www.gorendezvous.com/virginiedang',
        'https://rmpq.ca/repertoire-des-membres/clermont/virginie-dang-778809/'
      ]
    })
  },
```

If `pnpm typecheck` rejects `founder` or `areaServed` in `defineLocalBusiness`'s input type, keep the fields and widen the object with `as Parameters<typeof defineLocalBusiness>[0]`.

- [ ] **Step 4: Run the tests** — Expected: PASS. Also paste the home page's JSON-LD into `https://validator.schema.org/` (read-only check) and confirm no errors.

- [ ] **Step 5: Full check and commit**

```bash
git add nuxt.config.ts package.json pnpm-lock.yaml test/schema.test.ts
git commit -m "🔍 describe the business with LocalBusiness structured data"
```

---

### Task 22: Per-page social meta and descriptive alt text

**Files:**
- Create: `app/utils/image-alt.ts`, `test/images.test.ts`
- Modify: `app/composables/usePageSeo.ts`, `app/app.vue`, `test/head.test.ts`, `app/components/AppHeader.vue`, `app/components/home/HomeServices.vue`, and the 7 pages under `app/pages/soins/`

**Interfaces:**
- Produces: `IMAGE_ALT: Record<string, string>` keyed by file name (auto-imported from `app/utils`).

Alt text (the owner reviews this wording as part of the plan):

| File | Alt |
|---|---|
| `virginie_dang_massotherapeute_logo_2026.png` (header logo link) | Kiné-Sérénité massothérapie, accueil |
| `drainage_lymphatique.jpg` | Drainage lymphatique : mains massant délicatement la main et le poignet d’une personne allongée |
| `kinesitherapie_therapeutique.jpg` | Soin thérapeutique : massothérapeute travaillant l’omoplate d’une personne allongée sur le ventre |
| `massage_anti-stress.jpg` | Massage anti-stress : mains enveloppant le pied d’une personne allongée |
| `massage_de_repit.jpg` | Massage de répit : une main posée avec douceur sur les mains d’une personne âgée |
| `massage_femme_enceinte.jpg` | Massage pour femme enceinte : main posée sur le ventre arrondi d’une future maman |
| `massage_tissus_profonds.jpg` | Massage des tissus profonds : mains appliquant une pression lente et profonde sur le dos |
| `massage_thailandais.jpg` | Personne assise au sol en étirement, le buste penché vers les pieds |
| `ventouses.jpg` | Ventouses en silicone transparentes posées sur une table en bois |
| `massage_thailandais_1171.jpg` | Massage thaïlandais sur table : pression sur la hanche d’un client allongé sur le ventre |
| `massage_thailandais_1191.jpg` | Massage thaïlandais sur table : la massothérapeute, assise sur la table, étire la jambe d’un client allongé sur le dos |
| `massage_thailandais_1198.jpg` | Massage thaïlandais sur table : étirement de la jambe d’un client allongé sur le ventre |
| `massage_thailandais_1215.jpg` | Massage thaïlandais sur table : la massothérapeute, debout sur la table, étire la jambe d’un client |
| `massage_thailandais_1233.jpg` | Massage thaïlandais sur table : mobilisation de la jambe pliée d’un client allongé sur le dos |

- [ ] **Step 1: Write the failing tests**

`test/images.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { PRERENDER_ROUTES } from '../shared/utils/routes'
import { loadRoute } from './helpers/output'

describe.each(PRERENDER_ROUTES)('%s images', (route) => {
  it('gives every image a text alternative', () => {
    const $ = loadRoute(route)
    const missing = $('img').filter((_, el) => !($(el).attr('alt') ?? '').trim()).map((_, el) => $(el).attr('src')).get()
    expect(missing).toEqual([])
  })
})
```

In `test/head.test.ts`, replace the `keeps the site-wide Open Graph title and description` test with:

```ts
  it('shares the page title, description and URL on social networks', () => {
    expect($('meta[property="og:title"]').attr('content')).toBe(normalize(expected.title))
    expect($('meta[property="og:description"]').attr('content')).toBe(expected.description)
    expect($('meta[property="og:url"]').attr('content')).toBe(expected.canonical)
  })
```

and append to the `site-wide head` describe:

```ts
  it('adds the social image, locale and card type', () => {
    expect(content('meta[property="og:locale"]')).toBe('fr_CA')
    expect(content('meta[property="og:image"]')).toBe('https://kine-serenite.ca/img/virginie_dang_massage_2026.png')
    expect(content('meta[property="og:image:width"]')).toBe('1531')
    expect(content('meta[property="og:image:height"]')).toBe('532')
    expect(content('meta[property="og:image:type"]')).toBe('image/png')
    expect(content('meta[property="og:image:alt"]')).toMatch(/^Vous offrir un moment de répit/)
    expect(content('meta[name="twitter:card"]')).toBe('summary_large_image')
  })
```

Remove the now-unused `SITE_DESCRIPTION` import if lint flags it.

- [ ] **Step 2: Run them** — Expected: FAIL (empty alts, site-wide og:title on subpages, no og:image).

- [ ] **Step 3: Write `app/utils/image-alt.ts`**

```ts
export const IMAGE_ALT: Record<string, string> = {
  'logo': 'Kiné-Sérénité massothérapie, accueil',
  'drainage_lymphatique.jpg': 'Drainage lymphatique : mains massant délicatement la main et le poignet d’une personne allongée',
  'kinesitherapie_therapeutique.jpg': 'Soin thérapeutique : massothérapeute travaillant l’omoplate d’une personne allongée sur le ventre',
  'massage_anti-stress.jpg': 'Massage anti-stress : mains enveloppant le pied d’une personne allongée',
  'massage_de_repit.jpg': 'Massage de répit : une main posée avec douceur sur les mains d’une personne âgée',
  'massage_femme_enceinte.jpg': 'Massage pour femme enceinte : main posée sur le ventre arrondi d’une future maman',
  'massage_tissus_profonds.jpg': 'Massage des tissus profonds : mains appliquant une pression lente et profonde sur le dos',
  'massage_thailandais.jpg': 'Personne assise au sol en étirement, le buste penché vers les pieds',
  'ventouses.jpg': 'Ventouses en silicone transparentes posées sur une table en bois',
  'massage_thailandais_1171.jpg': 'Massage thaïlandais sur table : pression sur la hanche d’un client allongé sur le ventre',
  'massage_thailandais_1191.jpg': 'Massage thaïlandais sur table : la massothérapeute, assise sur la table, étire la jambe d’un client allongé sur le dos',
  'massage_thailandais_1198.jpg': 'Massage thaïlandais sur table : étirement de la jambe d’un client allongé sur le ventre',
  'massage_thailandais_1215.jpg': 'Massage thaïlandais sur table : la massothérapeute, debout sur la table, étire la jambe d’un client',
  'massage_thailandais_1233.jpg': 'Massage thaïlandais sur table : mobilisation de la jambe pliée d’un client allongé sur le dos'
}
```

- [ ] **Step 4: Use it**

- `AppHeader.vue`: logo `alt=""` → `:alt="IMAGE_ALT.logo"`.
- `HomeServices.vue`: each tile's `alt=""` → `:alt="IMAGE_ALT['<file name>']"` (for example `:alt="IMAGE_ALT['massage_de_repit.jpg']"`).
- Each page under `app/pages/soins/`: each `<img … alt="">` → `:alt="IMAGE_ALT['<file name>']"`.

- [ ] **Step 5: Per-page social tags in `app/composables/usePageSeo.ts`**

```ts
export function usePageSeo({ title, description, path }: PageSeoInput): void {
  const url = `${SITE_URL}${path}`
  useSeoMeta({ title, description, ogTitle: title, ogDescription: description, ogUrl: url })
  useHead({ link: [{ rel: 'canonical', href: url }] })
}
```

- [ ] **Step 6: Site-wide social tags in `app/app.vue`**

Replace the `useSeoMeta` call with:

```ts
useSeoMeta({
  ogType: 'website',
  ogSiteName: SITE_TITLE,
  ogLocale: 'fr_CA',
  ogImage: {
    url: `${SITE_URL}/img/virginie_dang_massage_2026.png`,
    width: 1531,
    height: 532,
    type: 'image/png',
    alt: HERO_ALT
  },
  twitterCard: 'summary_large_image'
})
```

- [ ] **Step 7: Run the tests** — `pnpm lint --fix && pnpm generate && pnpm test` — Expected: PASS. Alt text is invisible, so no visual re-check is needed; the content tests still pass because alt is not text content.

- [ ] **Step 8: Full check and commit**

```bash
git add app/utils/image-alt.ts app/composables/usePageSeo.ts app/app.vue app/components/AppHeader.vue app/components/home/HomeServices.vue app/pages/soins test/head.test.ts test/images.test.ts
git commit -m "🔍 share each page with its own title, image and alt text"
```

---

### Task 23: Service worker kill switch

**Files:**
- Create: `public/sw.js`
- Modify: `test/output.test.ts`

- [ ] **Step 1: Write the failing test** (append to `test/output.test.ts`)

```ts
describe('sw.js', () => {
  const sw = () => readFileSync(outputPath('sw.js'), 'utf8')

  it('replaces the old Workbox worker with one that removes itself', () => {
    expect(sw()).toContain('skipWaiting()')
    expect(sw()).toContain('caches.delete')
    expect(sw()).toContain('registration.unregister()')
  })

  it('loads nothing from the old Workbox CDN', () => {
    expect(sw()).not.toMatch(/importScripts|workbox/i)
  })
})
```

- [ ] **Step 2: Run it** — Expected: FAIL (ENOENT).

- [ ] **Step 3: Write `public/sw.js`**

```js
// Replaces the Workbox service worker that the previous site registered at this URL.
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.map(key => caches.delete(key)))
    await self.registration.unregister()
    const clients = await self.clients.matchAll({ type: 'window' })
    await Promise.all(clients.map(client => client.navigate(client.url)))
  })())
})
```

- [ ] **Step 4: Run the tests** — `pnpm lint --fix && pnpm generate && pnpm test` — Expected: PASS. If ESLint reports `self` or `caches` as undefined, add a config block `{ files: ['public/sw.js'], languageOptions: { globals: { self: 'readonly', caches: 'readonly' } } }` to `eslint.config.mjs`.

- [ ] **Step 5: Returning-visitor check in a browser (Review Focus 1)**

With `pnpm preview` running:

```bash
export AGENT_BROWSER_SESSION=task23
agent-browser open http://localhost:3001/ && agent-browser wait --load load
cat <<'EOF' | agent-browser eval --stdin
(async () => {
  const stale = await caches.open('kine-serenite-prod-precache-v2-http://localhost:3001/')
  await stale.put('/stale', new Response('old'))
  await navigator.serviceWorker.register('/sw.js')
  await new Promise(resolve => setTimeout(resolve, 2000))
  return { registrations: (await navigator.serviceWorker.getRegistrations()).length, caches: await caches.keys() }
})()
EOF
```
Expected: `{ "registrations": 0, "caches": [] }`.

- [ ] **Step 6: Full check and commit**

```bash
git add public/sw.js test/output.test.ts
git commit -m "🚑 retire the old site's service worker for returning visitors"
```

(Add `eslint.config.mjs` if Step 4 changed it.)

---

### Task 24: CI and GitHub Pages deployment

**Files:**
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Write `.github/workflows/ci.yml`**

```yaml
name: ci

on:
  push:
  pull_request:

permissions:
  contents: read

jobs:
  check:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v7

      - name: Install pnpm
        uses: pnpm/action-setup@v6

      - name: Install node
        uses: actions/setup-node@v7
        with:
          node-version-file: .nvmrc
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm run lint

      - name: Typecheck
        run: pnpm run typecheck

      - name: Generate
        run: pnpm run generate

      - name: Test
        run: pnpm run test

      - name: Upload Pages artifact
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        uses: actions/upload-pages-artifact@v5
        with:
          path: .output/public

  deploy:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    needs: check
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    concurrency:
      group: pages
      cancel-in-progress: false

    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v5
```

Before writing, re-check the latest majors: `for r in actions/checkout actions/setup-node pnpm/action-setup actions/upload-pages-artifact actions/deploy-pages; do gh api repos/$r/releases/latest --jq .tag_name; done` and use them.

- [ ] **Step 2: Validate**

Run: `python3 -c "import yaml; d = yaml.safe_load(open('.github/workflows/ci.yml')); print(sorted(d['jobs']))"`
Expected: `['check', 'deploy']`.

Run the same steps as CI from a clean install: `rm -rf node_modules .output .nuxt && pnpm install --frozen-lockfile && pnpm lint && pnpm typecheck && pnpm generate && pnpm test`
Expected: all pass. The workflow itself runs for real in Task 28.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "👷 run checks on every push and deploy main to GitHub Pages"
```

---

### Task 25: Visual verification, pass 1 (agent-browser)

**Files:** none in the repo unless a fix is needed (each fix is its own commit).

- [ ] **Step 1: Fresh build and servers**

Run: `pnpm generate && pnpm preview` (background); confirm the old site answers on :3000.

- [ ] **Step 2: Clear old outputs** — `rm -rf $V/out/* && mkdir -p $V/out`

- [ ] **Step 3: Run the full matrix plus the edge cells (Review Focus 5)**

Run: `cd $V && ./matrix.sh "/ 1263x900" "/ 1264x900" "/ 320x640" "/soins/massage-de-repit/ 320x640"`
Expected: `49 cells, 0 failing`. At 1263 the header shows the hamburger; at 1264 the four buttons.

- [ ] **Step 4: Interactive states (both sites, same steps, compare screenshots with `node pixeldiff.mjs`)**

For each state, run on `verify-old` (:3000) and `verify-new` (:3001), take a viewport screenshot (`agent-browser screenshot out/state-<name>-<side>.png`, no `--full`), then `node pixeldiff.mjs out/state-<name>-old.png out/state-<name>-new.png out/state-<name>-diff.png`:
1. `menu-390`: viewport 390×844, `/`, run `settle.js`, click the hamburger (old: `.v-app-bar .v-btn--icon`; new: `header button[aria-label="Menu"]`), wait 500 ms.
2. `menu-1024`: same at 1024×768.
3. `tile-hover`: 1440×900, `/`, `agent-browser find text "Drainage lymphatique" …` is ambiguous with the nav, so use `agent-browser snapshot -i`, pick the tile's `@ref` and `agent-browser hover @ref`; scroll the tile into view first with `agent-browser scrollintoview @ref`; wait 400 ms.
4. `nav-hover`: 1440×900, `/`, hover the "À propos" header button.
5. `footer-scroll`: 1440×900, `/`, `agent-browser scroll down 1500`, wait 300 ms.
6. `active-policies`: 1440×900, `/politiques-annulation-confidentialite/`, no interaction (Politiques button active).
Expected: every state `"pass":true`.

- [ ] **Step 5: Fix loop**

For each failing cell or state: open the diff image, run `./probe.sh <route> <w> <h>`, fix the cause at the lowest layer (token, base, component class, theme, then template), and commit the fix alone with a message naming the visual difference (for example `💄 match the rates table row height`). After any fix, re-run the whole Step 3 matrix and Step 4 states, not only the failing cell. Stop when everything passes.

- [ ] **Step 6: Record the result**

Write `$V/out/pass1-report.md` with the final matrix summary line, the six state results and the list of fix commits. No repo commit for the report.

---

### Task 26: Visual verification, pass 2 (Chrome DevTools MCP)

**Files:** none in the repo unless a fix is needed (each fix is its own commit, then re-run Tasks 25 and 26 matrices).

Load the MCP tools first: `ToolSearch` with `select:mcp__plugin_chrome-devtools-mcp_chrome-devtools__new_page,mcp__plugin_chrome-devtools-mcp_chrome-devtools__select_page,mcp__plugin_chrome-devtools-mcp_chrome-devtools__resize_page,mcp__plugin_chrome-devtools-mcp_chrome-devtools__navigate_page,mcp__plugin_chrome-devtools-mcp_chrome-devtools__evaluate_script,mcp__plugin_chrome-devtools-mcp_chrome-devtools__take_screenshot,mcp__plugin_chrome-devtools-mcp_chrome-devtools__lighthouse_audit,mcp__plugin_chrome-devtools-mcp_chrome-devtools__list_console_messages,mcp__plugin_chrome-devtools-mcp_chrome-devtools__list_network_requests`.

- [ ] **Step 1: Two pages**

`new_page` with `http://localhost:3000/` (old) and `new_page` with `http://localhost:3001/` (new). Use `select_page` to switch.

- [ ] **Step 2: Screenshot matrix**

For each of the 9 routes and 5 viewports (same list as `matrix.sh`), on each page:
1. `resize_page` to the viewport, then `evaluate_script` with `() => [innerWidth, innerHeight]` and re-resize until `innerWidth` equals the target width.
2. `navigate_page` to the route.
3. `evaluate_script` with the body of `$V/settle.js` wrapped as an async function.
4. `take_screenshot` with `fullPage: true` and `filePath: $V/out/cdt/<route-name>-<w>x<h>-<old|new>.png`.

Then diff every pair: `for f in $V/out/cdt/*-old.png; do node $V/pixeldiff.mjs "$f" "${f%-old.png}-new.png" "${f%-old.png}-diff.png"; done > $V/out/cdt/matrix.jsonl`, and count failures as in `matrix.sh`.
Expected: 45 pairs, 0 failing.

- [ ] **Step 3: Console and network (new site)**

On the new page, for each route: `navigate_page`, then `list_console_messages` (expected: no errors, no message containing "Hydration") and `list_network_requests` (expected: no request to `fonts.googleapis.com`, `fonts.gstatic.com`, `cdn.jsdelivr.net`, `api.iconify.design` or `/api/_nuxt_icon`).

- [ ] **Step 4: Lighthouse**

Run `lighthouse_audit` on every route, old and new, once for mobile and once for desktop. Record SEO, accessibility, performance and CLS in `$V/out/cdt/lighthouse.md`.
Expected for every route and device: new SEO ≥ old, new accessibility ≥ old, new CLS ≤ old. The old site's `robots.txt` blocks `/_nuxt/` and its subpages share one `og:title`, so SEO should not go down; if a score does, read the failing audit and fix it (own commit).

- [ ] **Step 5: Record the result**

Write `$V/out/pass2-report.md` with the matrix summary, console/network findings, the Lighthouse table and any fix commits. If a fix was committed, re-run Task 25, Step 3 and this task's Step 2.

---

### Task 27: README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Write `README.md`**

Draft (then run it through the `humanizer` skill in embedded mode before saving, per the user's rules):

````markdown
# kine-serenite.ca

Website of Virginie Dang, massage therapist in Charlevoix (Québec). A static Nuxt 4 site deployed to GitHub Pages.

## Requirements

- Node 24 (`nvm use` reads `.nvmrc`)
- pnpm (version pinned in `package.json`, `corepack enable` installs it)

## Commands

```bash
pnpm install     # install dependencies
pnpm dev         # dev server on http://localhost:3001
pnpm generate    # build the static site into .output/public
pnpm preview     # serve .output/public like GitHub Pages, on http://localhost:3001
pnpm lint        # ESLint
pnpm typecheck   # vue-tsc through nuxt typecheck
pnpm test        # tests against .output/public (run pnpm generate first)
```

## Adding a page

1. Create the page under `app/pages/`.
2. Add its route, with a trailing slash, to `shared/utils/routes.ts`. Pages that nothing links to are only prerendered if they are listed there.
3. Call `usePageSeo()` with its title, description and path.

## Deployment

Every push runs lint, typecheck, generate and tests. A push to `main` then deploys `.output/public` to GitHub Pages. The custom domain `kine-serenite.ca` is set in the repository's Pages settings; the `CNAME` file in `public/` is kept for reference only.

## Notes

- TypeScript stays on 6.0.x: typescript-eslint supports `typescript <6.1.0`, and TypeScript 7 ships no JavaScript compiler API for vue-tsc. Renovate is configured to respect this.
- `public/sw.js` unregisters the service worker that the previous version of the site installed. Keep it.
- The layout reproduces the previous Vuetify 2 design: breakpoints, card and button metrics live in `app/assets/css/main.css` and `app/app.config.ts`.
````

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "📝 document the project"
```

---

### Task 28: Comment hygiene, GitHub repository and first deploy (owner go-ahead required)

**Files:** any file whose comments need cleanup (own commit).

- [ ] **Step 1: Comment hygiene (user rule)**

List every comment the history adds: `git diff $(git rev-list --max-parents=0 HEAD) HEAD -- . ':!pnpm-lock.yaml' ':!docs' ':!README.md' | grep -nE '^\+\s*(//|/\*|\*|<!--|# )'`. Apply the user's comment rules (delete restatements and duplicates, keep only non-obvious reasons, make survivors short and true, verify each claim against the code). Run the surviving comments through the `humanizer` skill. Confirm the diff has no non-comment lines, run the full check, and commit (`💡 tidy comments`) if anything changed.

- [ ] **Step 2: Ask the owner for the go-ahead**

Ask: "Create the public repository `damienbeaufils/kine-serenite-2026`, push `main`, and enable GitHub Pages with GitHub Actions as the source?" Wait for an explicit yes.

- [ ] **Step 3: Create, push, enable Pages**

```bash
gh repo create damienbeaufils/kine-serenite-2026 --public --source . --remote origin --push
gh api -X POST repos/damienbeaufils/kine-serenite-2026/pages -f build_type=workflow
```

- [ ] **Step 4: Watch the first run**

Run: `gh run watch $(gh run list --limit 1 --json databaseId --jq '.[0].databaseId') --exit-status`
Expected: `check` and `deploy` succeed. If `deploy` ran before Pages was enabled and failed, re-run it: `gh run rerun <id> --failed`.

---

### Task 29: Pre-cutover check of the deployed artifact

The `github.io` URL serves the site under `/kine-serenite-2026/`, which breaks absolute paths, so the artifact is checked locally instead.

- [ ] **Step 1: Download and extract the artifact**

```bash
RUN=$(gh run list --branch main --limit 1 --json databaseId --jq '.[0].databaseId')
rm -rf /tmp/kine-artifact && mkdir -p /tmp/kine-artifact && gh run download "$RUN" -n github-pages -D /tmp/kine-artifact
mkdir -p /tmp/kine-artifact/site && tar -xf /tmp/kine-artifact/artifact.tar -C /tmp/kine-artifact/site
```

- [ ] **Step 2: Run the tests against it**

Run: `SITE_OUTPUT_DIR=/tmp/kine-artifact/site pnpm test`
Expected: PASS.

- [ ] **Step 3: Visual spot check**

Stop the local preview, serve the artifact on :3001 (`npx serve /tmp/kine-artifact/site --listen 3001 --config $(pwd)/serve.json`), then run `cd $V && ./compare.sh / 1440 900 && ./compare.sh / 390 844 && ./compare.sh /soins/massage-deep-tissue/ 1440 900`.
Expected: all `"pass":true`.

---

### Task 30: Domain cutover and live checks (owner action and go-ahead required)

- [ ] **Step 1: Domain verification (owner, at the Squarespace DNS)**

Ask the owner to add the domain in GitHub → Settings → Pages → Verified domains, create the `_github-pages-challenge-damienbeaufils.kine-serenite.ca` TXT record it shows, and click Verify. Confirm with them before continuing. (Strongly recommended; skipping it leaves the domain claimable during the switch.)

- [ ] **Step 2: Ask for the cutover go-ahead**

Ask: "Switch kine-serenite.ca now? The old repository's Pages site will be turned off (its `gh-pages` branch stays untouched, so rolling back takes minutes)." Wait for an explicit yes. Prefer a quiet hour.

- [ ] **Step 3: Release the domain from the old repository**

```bash
gh api -X DELETE repos/damienbeaufils/kine-serenite/pages
```

Turning Pages off releases the domain without GitHub committing a `CNAME` change to the old `gh-pages` branch, which removing the custom domain from a branch-based site would do. This refines the spec's "remove the domain from the old repo's Pages settings"; tell the owner.

- [ ] **Step 4: Attach it to the new repository and wait for HTTPS**

```bash
gh api -X PUT repos/damienbeaufils/kine-serenite-2026/pages -f cname=kine-serenite.ca
until [ "$(gh api repos/damienbeaufils/kine-serenite-2026/pages --jq '.https_certificate.state')" = "approved" ]; do sleep 60; done
gh api -X PUT repos/damienbeaufils/kine-serenite-2026/pages -F https_enforced=true
```

(Run the wait loop in the background; certificate issuance usually takes minutes, up to about an hour.)

- [ ] **Step 5: Live checks**

```bash
for r in / /politiques-annulation-confidentialite/ /soins/drainage-lymphatique/ /soins/massage-anti-stress/ /soins/massage-de-repit/ /soins/massage-deep-tissue/ /soins/massage-femme-enceinte/ /soins/massage-thailandais-sur-table/ /soins/orthotherapie-kinesitherapie-soin-therapeutique/ /robots.txt /sitemap.xml /sw.js; do printf '%-60s ' "$r"; curl -s -o /dev/null -w '%{http_code}\n' "https://kine-serenite.ca$r"; done
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' https://kine-serenite.ca/soins/massage-de-repit
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' http://kine-serenite.ca/
curl -s -o /dev/null -w '%{http_code}\n' https://kine-serenite.ca/nope/
curl -s https://kine-serenite.ca/ | grep -o '<link rel="canonical"[^>]*>'
curl -s https://kine-serenite.ca/ | grep -c 'application/ld+json'
```
Expected: 200 for every path; `301 https://kine-serenite.ca/soins/massage-de-repit/`; `301 https://kine-serenite.ca/` for plain HTTP; `404` for `/nope/`; the canonical `https://kine-serenite.ca/`; at least one JSON-LD script. Then open `https://kine-serenite.ca/` with agent-browser at 1440 and 390 and look at it.

- [ ] **Step 6: Rollback (only if a live check fails and cannot be fixed quickly)**

```bash
gh api -X PUT repos/damienbeaufils/kine-serenite-2026/pages -F cname=null
gh api -X POST repos/damienbeaufils/kine-serenite/pages -f 'source[branch]=gh-pages' -f 'source[path]=/'
gh api -X PUT repos/damienbeaufils/kine-serenite/pages -f cname=kine-serenite.ca
```
