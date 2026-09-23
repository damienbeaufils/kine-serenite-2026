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
    expect(existsSync(outputPath('__404/index.html'))).toBe(false)
    expect(readOutput('sitemap.xml')).not.toContain('__404')
  })
})
