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
    expect(robots).toMatch(/\bindex\b/)
    expect(robots).not.toMatch(/noindex/)
  })
})
