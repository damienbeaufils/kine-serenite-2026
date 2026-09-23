import type { PrerenderRoute } from 'nitropack'
import { PRERENDER_ROUTES } from './shared/utils/routes'
import { SITE_TITLE, SITE_URL } from './shared/utils/site'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots'
  ],

  components: [
    { path: '~/components', pathPrefix: false }
  ],

  devtools: {
    enabled: true
  },

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

  css: ['~/assets/css/main.css'],

  vue: {
    compilerOptions: {
      whitespace: 'preserve'
    }
  },

  site: {
    url: SITE_URL,
    name: SITE_TITLE,
    defaultLocale: 'fr',
    trailingSlash: true
  },

  ui: {
    colorMode: false
  },

  runtimeConfig: {
    public: {
      buildYear: new Date().getFullYear()
    }
  },

  routeRules: {
    '/': { sitemap: { priority: 1 } },
    '/politiques-annulation-confidentialite': { sitemap: { priority: 0.7 } }
  },

  experimental: {
    defaults: {
      nuxtLink: {
        trailingSlash: 'append'
      }
    }
  },

  compatibilityDate: '2026-06-30',

  nitro: {
    prerender: {
      routes: [...PRERENDER_ROUTES, '/sitemap.xml', '/erreur-404/']
    },
    hooks: {
      // Nuxt always prerenders /404.html as an empty SPA shell. Write the server-rendered
      // error page of an unknown route there instead; clearing the error here, before Nitro
      // records it, keeps the build from failing on the expected 404.
      'prerender:generate'(route: PrerenderRoute) {
        if (route.route === '/404.html') {
          route.skip = true
        } else if (route.route === '/erreur-404/') {
          delete route.error
          route.fileName = '/404.html'
          // Its payload file is skipped below: strip the preload link and the __NUXT_DATA__
          // data-src that would otherwise fetch it on every hydration.
          if (route.contents) {
            route.contents = route.contents
              .replace(/<link rel="preload" as="fetch" crossorigin="anonymous" href="\/erreur-404\/_payload\.json\?[^"]*">/, '')
              .replace(/ data-src="\/erreur-404\/_payload\.json\?[^"]*"/, '')
          }
        } else if (route.route.startsWith('/erreur-404/')) {
          // Payload-extraction companion route (e.g. _payload.json) crawled from the page above: skip it too.
          route.skip = true
        }
      }
    }
  },

  typescript: {
    nodeTsConfig: {
      include: ['../test/**/*', '../vitest.config.ts'],
      compilerOptions: { types: ['node'] }
    }
  },

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
  },

  sitemap: {
    xsl: false,
    exclude: [
      '/soins/massage-thailandais-sur-table',
      '/soins/massage-thailandais-sur-table/**',
      '/erreur-404',
      '/erreur-404/**'
    ],
    defaults: {
      changefreq: 'monthly',
      priority: 0.8
    }
  }
})
