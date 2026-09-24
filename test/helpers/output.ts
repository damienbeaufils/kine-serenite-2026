import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as cheerio from 'cheerio'

export const OUTPUT_DIR = process.env.SITE_OUTPUT_DIR ?? fileURLToPath(new URL('../../.output/public', import.meta.url))

export function outputPath(relative: string): string {
  return join(OUTPUT_DIR, relative)
}

export function routeFile(route: string): string {
  return route === '/' ? 'index.html' : `${route.slice(1)}index.html`
}

export function readOutput(relative: string): string {
  return readFileSync(outputPath(relative), 'utf8')
}

export function loadRoute(route: string): cheerio.CheerioAPI {
  return cheerio.load(readOutput(routeFile(route)))
}

export function allOutputFiles(dir: string = OUTPUT_DIR): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
    entry.isDirectory() ? allOutputFiles(join(dir, entry.name)) : [join(dir, entry.name)]
  )
}

// Collapses ASCII whitespace only, so a no-break space inside the text stays distinct from a plain space.
export function normalize(text: string): string {
  return text.replace(/[ \t\n\r\f]+/g, ' ').trim()
}
