# AGENTS.md

kine-serenite.ca is a static Nuxt 4 site built with Nuxt UI, prerendered and deployed to GitHub Pages. Its content is in French. Read `README.md` first: it lists the commands, the steps for adding a page and how deployment works.

## Setup and checks

- Node comes from `.nvmrc` (`nvm use`). Use pnpm, not npm or yarn.
- Before every commit, run `pnpm lint && pnpm typecheck && pnpm generate && pnpm test`. The tests read the built site in `.output/public`, so generate before you test.
- After editing Vue or TypeScript files, run `pnpm lint --fix`: ESLint also enforces the formatting.

## Static hosting

- Every page is prerendered and nothing runs on a server in production. Don't add server routes or API endpoints, because GitHub Pages can't serve them.
- Icons are bundled at build time from the installed `@iconify-json/*` collections, and there is no icon API to fall back on. Nuxt Icon finds them by scanning the source and only sees names written out in full, so write `i-mdi-phone` rather than building a name from a variable.
- Every internal URL ends with `/`: links, canonicals, the routes in `shared/utils/routes.ts` and the URLs in the sitemap test.

## Content and layout

- The tests compare each page's text exactly, collapsing only ASCII whitespace. Apostrophe style (`'` or `’`) and `&nbsp;` count, so leave them as they are unless you're asked to change the copy.
- Templates compile with `whitespace: 'preserve'`. A line break between two tags renders as a space, so rewrapping a template can change the page.
- Tailwind breakpoints use Vuetify's values instead of Tailwind's defaults: `sm` 600px, `md` 960px, `lg` 1264px, `xl` 1904px, and no `2xl`. Colours and component styles live in `app/assets/css/main.css` and `app/app.config.ts`; reuse those tokens rather than Nuxt UI's defaults. The site is light mode only.

## Commits

- The subject is a gitmoji followed by a short lowercase sentence (see `git log`).
- Make one logical change per commit and add files by explicit path, not with `git add -A`.

## Migration docs

`docs/superpowers/` keeps the spec and plan from the 2026 migration off Nuxt 2 and Vuetify as a record. The old repository they compare against no longer exists, so don't follow their verification steps.
