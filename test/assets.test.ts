import { readFileSync } from 'node:fs'
import { relative } from 'node:path'
import { describe, expect, it } from 'vitest'
import { allOutputFiles, OUTPUT_DIR } from './helpers/output'

const files = allOutputFiles()
const textOf = (extensions: string[]) => files
  .filter(file => extensions.some(extension => file.endsWith(extension)))
  .map(file => readFileSync(file, 'utf8'))
  .join('\n')

const fontFaces = (css: string) => [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)].map(match => match[1]!)

function coversCodePoint(unicodeRange: string, codePoint: number): boolean {
  return unicodeRange.split(',').some((part) => {
    const [start, end] = part.trim().replace(/^U\+/i, '').split('-').map(hex => Number.parseInt(hex, 16))
    return codePoint >= start! && codePoint <= (end ?? start!)
  })
}

describe('fonts', () => {
  const css = textOf(['.css', '.html'])

  it('self-hosts Lora and Sofia', () => {
    const faces = fontFaces(css)
    expect(faces.some(face => /font-family:\s*["']?Lora["']?\s*;/.test(face))).toBe(true)
    expect(faces.some(face => /font-family:\s*["']?Sofia["']?\s*;/.test(face))).toBe(true)
    expect(files.some(file => relative(OUTPUT_DIR, file).startsWith('_fonts/') && file.endsWith('.woff2'))).toBe(true)
  })

  it('covers latin-ext glyphs such as ĉ with Lora', () => {
    const lora = fontFaces(css).filter(face => /font-family:\s*["']?Lora["']?\s*;/.test(face) && /font-style:\s*normal/.test(face))
    expect(lora.some((face) => {
      const range = /unicode-range:\s*([^;]+)/.exec(face)
      return range ? coversCodePoint(range[1]!, 0x109) : false
    })).toBe(true)
  })
})

describe('third-party assets', () => {
  it('loads nothing from Google Fonts or jsDelivr', () => {
    expect(textOf(['.html', '.css', '.js'])).not.toMatch(/fonts\.googleapis\.com|fonts\.gstatic\.com|cdn\.jsdelivr\.net/)
  })
})
