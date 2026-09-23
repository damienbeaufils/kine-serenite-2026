import { existsSync } from 'node:fs'
import { OUTPUT_DIR } from './helpers/output'

export default function setup(): void {
  if (!existsSync(OUTPUT_DIR)) {
    throw new Error(`${OUTPUT_DIR} is missing: run "pnpm generate" before "pnpm test".`)
  }
}
