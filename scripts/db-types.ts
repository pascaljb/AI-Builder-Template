#!/usr/bin/env tsx
// scripts/db-types.ts — generates TypeScript types from Supabase schema
// Run: pnpm db:types

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const RESET = '\x1b[0m'
const CYAN  = '\x1b[36m'
const GREEN = '\x1b[32m'
const RED   = '\x1b[31m'
const DIM   = '\x1b[2m'

// Load env
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const [key, ...valueParts] = trimmed.split('=')
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim()
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
if (!supabaseUrl) {
  console.error(`${RED}NEXT_PUBLIC_SUPABASE_URL not set. Run pnpm setup first.${RESET}`)
  process.exit(1)
}

// Extract project ref from URL
const projectRef = supabaseUrl.replace('https://', '').split('.')[0]
const outputPath = path.join(process.cwd(), 'src/types/database.ts')

console.log(`\n${CYAN}Generating types from Supabase project: ${projectRef}${RESET}`)
console.log(`${DIM}Output: ${outputPath}${RESET}\n`)

try {
  execSync(
    `npx supabase gen types typescript --project-id "${projectRef}" > "${outputPath}"`,
    { stdio: 'inherit' }
  )

  // Add header comment
  const existing = fs.readFileSync(outputPath, 'utf-8')
  const header = `// src/types/database.ts
// AUTO-GENERATED — do not edit manually
// Regenerate with: pnpm db:types
// Last generated: ${new Date().toISOString().split('T')[0]}

`
  fs.writeFileSync(outputPath, header + existing)

  console.log(`\n${GREEN}Types generated → src/types/database.ts${RESET}`)
  console.log(`${DIM}Import as: import type { Database } from '@/types/database'${RESET}\n`)

} catch (err) {
  console.error(`\n${RED}Type generation failed.${RESET}`)
  console.error(`${DIM}Make sure you're logged in: npx supabase login${RESET}\n`)
  process.exit(1)
}
