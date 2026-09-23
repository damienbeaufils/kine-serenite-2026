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
