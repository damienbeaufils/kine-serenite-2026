import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { allOutputFiles, loadRoute, normalize } from './helpers/output'

describe('site shell', () => {
  const $ = loadRoute('/politiques-annulation-confidentialite/')

  it('links the logo to the home page', () => {
    expect($('header a').first().attr('href')).toBe('/')
  })

  it('links the header buttons with trailing slashes and anchors', () => {
    expect($('header nav a').map((_, el) => $(el).attr('href')).get()).toEqual([
      '/',
      '/#techniques',
      '/#a-propos',
      '/politiques-annulation-confidentialite/'
    ])
  })

  it('renders a labelled hamburger button', () => {
    expect($('header button[aria-label="Menu"]')).toHaveLength(1)
  })

  it('renders the footer contact links', () => {
    expect($('footer a').map((_, el) => $(el).attr('href')).get()).toEqual([
      'https://www.facebook.com/virginiedang.massotherapeute',
      'https://www.gorendezvous.com/virginiedang',
      'mailto:virginiedang.massotherapeute@gmail.com',
      'tel:4187901294'
    ])
  })

  it('names every footer link without the labels that phones hide, keeping their visible text in the name', () => {
    const links = $('footer a').toArray()
    expect(links.map(el => $(el).attr('aria-label') ?? $(el).find('img').attr('alt'))).toEqual([
      'Facebook',
      'Prendre un rendez-vous',
      'Courriel : virginiedang.massotherapeute@gmail.com',
      'Téléphone : 418-790-1294'
    ])
    for (const el of links) {
      expect($(el).attr('aria-label') ?? '').toContain($(el).text().trim())
    }
  })

  it('prints the build year in the copyright', () => {
    expect(normalize($('footer').text())).toContain(`© 2021-${new Date().getFullYear()} - Virginie Dang`)
  })

  it('inlines the SVG of every mdi icon it uses', () => {
    const inlined = [...$('style').text().matchAll(/:where\(\.i-mdi\\:([a-z-]+)\)\{[^}]*--svg:url\("data:image\/svg\+xml,/g)].map(match => match[1])
    expect(inlined).toEqual(expect.arrayContaining(['menu', 'facebook', 'email', 'phone']))
  })

  it('does not depend on a remote icon API', () => {
    const html = allOutputFiles().filter(file => file.endsWith('.html')).map(file => readFileSync(file, 'utf8')).join('\n')
    expect(html).not.toMatch(/api\.iconify\.design|\/api\/_nuxt_icon/)
  })
})
