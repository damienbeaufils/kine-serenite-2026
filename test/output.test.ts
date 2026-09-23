import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { outputPath } from './helpers/output'

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
