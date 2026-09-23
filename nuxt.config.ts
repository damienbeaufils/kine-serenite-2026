import { PRERENDER_ROUTES } from './shared/utils/routes'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui'
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

  ui: {
    colorMode: false
  },

  runtimeConfig: {
    public: {
      buildYear: new Date().getFullYear()
    }
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
      routes: PRERENDER_ROUTES
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
  }
})
