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
