import { describe, expect, it } from 'vitest'
import { PRERENDER_ROUTES } from '../shared/utils/routes'
import { loadRoute } from './helpers/output'

type Node = Record<string, unknown> & { '@type'?: string | string[] }

function graphOf(route: string): Node[] {
  const $ = loadRoute(route)
  return $('script[type="application/ld+json"]').map((_, el) => {
    const json = JSON.parse($(el).text())
    return (json['@graph'] ?? [json]) as Node[]
  }).get().flat()
}

const hasType = (node: Node, type: string) => [node['@type']].flat().includes(type)

describe.each(PRERENDER_ROUTES)('%s structured data', (route) => {
  const graph = graphOf(route)

  it('describes the website and the page', () => {
    expect(graph.some(node => hasType(node, 'WebSite'))).toBe(true)
    expect(graph.some(node => hasType(node, 'WebPage'))).toBe(true)
  })

  it('identifies the business', () => {
    const business = graph.find(node => hasType(node, 'HealthAndBeautyBusiness'))
    expect(business).toBeDefined()
    expect(business).toMatchObject({
      name: 'Kiné-Sérénité',
      telephone: '+1-418-790-1294',
      email: 'virginiedang.massotherapeute@gmail.com',
      address: {
        streetAddress: '2 rue Beauregard',
        addressLocality: 'Clermont',
        addressRegion: 'QC',
        postalCode: 'G4A 0A2',
        addressCountry: 'CA'
      }
    })
    expect(JSON.stringify(business)).toContain('Virginie Dang')
    expect(JSON.stringify(business)).toContain('Tuesday')
    expect(business!.sameAs).toEqual(expect.arrayContaining([
      'https://www.facebook.com/virginiedang.massotherapeute',
      'https://www.gorendezvous.com/virginiedang',
      'https://rmpq.ca/repertoire-des-membres/clermont/virginie-dang-778809/'
    ]))
    expect(business!.areaServed).toHaveLength(12)
  })

  it('types the business as a LocalBusiness with typed opening hours', () => {
    const business = graph.find(node => hasType(node, 'HealthAndBeautyBusiness'))!
    expect([business['@type']].flat()).toEqual(expect.arrayContaining(['LocalBusiness', 'HealthAndBeautyBusiness']))
    // The resolver unwraps a one-entry array into a single object.
    const hours = [business.openingHoursSpecification].flat() as Node[]
    expect(hours[0]!['@type']).toBe('OpeningHoursSpecification')
  })
})
