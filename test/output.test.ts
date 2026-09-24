import * as cheerio from 'cheerio'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { outputPath, readOutput } from './helpers/output'

describe('generated site', () => {
  it('writes the home page', () => {
    expect(existsSync(outputPath('index.html'))).toBe(true)
  })
})

const staticFiles: Record<string, string> = JSON.parse(readFileSync(new URL('./fixtures/static-files.json', import.meta.url), 'utf8'))

describe('static files from the old site', () => {
  it.each(Object.entries(staticFiles))('%s is deployed byte for byte', (file, sha256) => {
    expect(createHash('sha256').update(readFileSync(outputPath(file))).digest('hex')).toBe(sha256)
  })
})

describe('404.html', () => {
  const $ = () => cheerio.load(readFileSync(outputPath('404.html'), 'utf8'))

  it('is a prerendered French page that search engines skip', () => {
    expect($()('html').attr('lang')).toBe('fr')
    expect($()('h1').text().trim()).toBe('Page introuvable')
    expect($()('meta[name="robots"]').attr('content')).toMatch(/noindex/)
    expect($()('link[rel="canonical"]')).toHaveLength(0)
    expect($()('main a[href="/"]').text().trim()).toBe('Retour à l’accueil')
    expect($()('header nav a')).toHaveLength(4)
  })

  it('leaves no page behind for the internal route it is rendered from', () => {
    expect(existsSync(outputPath('erreur-404'))).toBe(false)
    expect(readOutput('sitemap.xml')).not.toContain('erreur-404')
  })

  it('does not reference the skipped payload file of the route it is rendered from', () => {
    expect(readOutput('404.html')).not.toContain('_payload.json')
  })

  it('carries no rendered path, so hydration keeps the URL the visitor asked for', () => {
    const payload = JSON.parse($()('script#__NUXT_DATA__').text())
    // devalue stores the root object's values as indexes into this array; -1 encodes undefined.
    expect(payload[0].path).toBe(-1)
  })
})

describe('sw.js', () => {
  const sw = () => readFileSync(outputPath('sw.js'), 'utf8')

  it('replaces the old Workbox worker with one that removes itself', () => {
    expect(sw()).toContain('skipWaiting()')
    expect(sw()).toContain('caches.delete')
    expect(sw()).toContain('registration.unregister()')
  })

  it('loads nothing from the old Workbox CDN', () => {
    expect(sw()).not.toMatch(/importScripts|workbox/i)
  })
})
