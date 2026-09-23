import { readFileSync } from 'node:fs'

export interface BaselinePage {
  title: string
  description: string
  canonical: string
  h1: string[]
  text: string
}

export const baseline: { source: string, pages: Record<string, BaselinePage> } = JSON.parse(
  readFileSync(new URL('../fixtures/seo-baseline.json', import.meta.url), 'utf8')
)
