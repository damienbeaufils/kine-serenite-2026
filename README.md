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
2. Add its route, with a trailing slash, to `shared/utils/routes.ts`. Unlinked pages are prerendered only because they're listed there. The list also drives every per-page test (content, images, schema, head, links, sitemap).
3. Add an entry for that route to `test/fixtures/seo-baseline.json`: its title, description, canonical URL, h1 and expected page text.
4. Call `usePageSeo()` with its title, description and path.
5. For a page with images, add each one's alt text to `IMAGE_ALT` in `app/utils/image-alt.ts`, keyed by file name; a wrong key fails typecheck.

## Deployment

Every push runs lint, typecheck, generate and tests. A push to `main` then deploys `.output/public` to GitHub Pages. The custom domain `kine-serenite.ca` is set in the repository's Pages settings; the `CNAME` file in `public/` is kept for reference only.

## Notes

- TypeScript stays on 6.0.x: typescript-eslint supports `typescript <6.1.0`, and TypeScript 7 ships no JavaScript compiler API for vue-tsc. Renovate is configured to respect this.
- `public/sw.js` unregisters the service worker that the previous version of the site installed. Keep it.
- The layout reproduces the previous Vuetify 2 design: breakpoints, card and button metrics live in `app/assets/css/main.css` and `app/app.config.ts`.
