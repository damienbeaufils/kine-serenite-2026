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
