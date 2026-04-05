#!/usr/bin/env tsx
// scripts/check-env.ts — validates required env vars before dev/build
// Run: pnpm check-env

const RESET  = '\x1b[0m'
const BOLD   = '\x1b[1m'
const GREEN  = '\x1b[32m'
const RED    = '\x1b[31m'
const YELLOW = '\x1b[33m'
const DIM    = '\x1b[2m'

interface EnvVar {
  key: string
  required: boolean
  description: string
  where: string
}

const ENV_VARS: EnvVar[] = [
  {
    key: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    description: 'Your Supabase project URL',
    where: 'supabase.com → Project Settings → API → Project URL',
  },
  {
    key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    description: 'Supabase anon/public key',
    where: 'supabase.com → Project Settings → API → anon public',
  },
  {
    key: 'NEXT_PUBLIC_APP_URL',
    required: false,
    description: 'App URL for auth redirects',
    where: 'Set to http://localhost:3000 for development',
  },
]

// Load .env.local manually (tsx doesn't auto-load it)
import fs from 'fs'
import path from 'path'

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

let hasErrors = false
let hasWarnings = false

console.log(`\n${BOLD}Environment check${RESET}\n`)

for (const envVar of ENV_VARS) {
  const value = process.env[envVar.key]
  const present = value && value.length > 0

  if (!present && envVar.required) {
    console.log(`  ${RED}✗${RESET} ${BOLD}${envVar.key}${RESET}`)
    console.log(`    ${envVar.description}`)
    console.log(`    ${DIM}Find it: ${envVar.where}${RESET}`)
    console.log()
    hasErrors = true
  } else if (!present) {
    console.log(`  ${YELLOW}○${RESET} ${envVar.key} ${DIM}(optional — not set)${RESET}`)
    hasWarnings = true
  } else {
    const preview = value!.length > 20 ? value!.slice(0, 8) + '...' : value!
    console.log(`  ${GREEN}✓${RESET} ${envVar.key} ${DIM}${preview}${RESET}`)
  }
}

console.log()

if (hasErrors) {
  console.log(`${RED}${BOLD}Missing required variables.${RESET}`)
  console.log(`${DIM}Edit .env.local and add the values above.${RESET}\n`)
  process.exit(1)
} else if (hasWarnings) {
  console.log(`${YELLOW}Optional variables not set — OK for now.${RESET}\n`)
} else {
  console.log(`${GREEN}${BOLD}All environment variables present.${RESET}\n`)
}
