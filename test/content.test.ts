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
