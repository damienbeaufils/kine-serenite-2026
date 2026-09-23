import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { outputPath } from './helpers/output'

describe('generated site', () => {
  it('writes the home page', () => {
    expect(existsSync(outputPath('index.html'))).toBe(true)
  })
})
