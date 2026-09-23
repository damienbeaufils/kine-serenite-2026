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
    expect(normalize($('main').text())).toBe(expected.text)
  })
})

describe('home page sections', () => {
  const $ = loadRoute('/')

  it('shows the hero banner, with a narrow image below 600px', () => {
    const picture = $('main picture')
    expect(picture.find('source[media="(min-width: 600px)"]').attr('srcset')).toBe('/img/virginie_dang_massage_2026.png')
    expect(picture.find('img').attr('src')).toBe('/img/virginie_dang_massage_2026_mobile.png')
    expect(picture.find('img').attr('alt')).toMatch(/^Vous offrir un moment de répit/)
  })

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
    expect(text).toContain('40 $ 30 min')
    expect($('main table')).toHaveLength(2)
    expect($('main a[href="/soins/massage-de-repit/"]').first().text().trim()).toBe('Massage de répit')
  })
})
