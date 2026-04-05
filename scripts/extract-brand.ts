#!/usr/bin/env tsx
// scripts/extract-brand.ts
// ─────────────────────────────────────────────────────────────────────────────
// Run with: pnpm brand:extract <figma-url-or-node-id>
//
// Calls the Figma MCP → runs inferFromFigma() → writes brand.config.ts
// → runs gen-tokens.ts
//
// This replaces brand:init entirely. No questions asked.
// The design is the source of truth.
// ─────────────────────────────────────────────────────────────────────────────

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { inferFromFigma } from '../src/lib/tokens/inferFromFigma'

const ROOT = path.resolve(__dirname, '..')

const RESET = '\x1b[0m'
const BOLD  = '\x1b[1m'
const DIM   = '\x1b[2m'
const CYAN  = '\x1b[36m'
const GREEN = '\x1b[32m'
const YELLOW = '\x1b[33m'
const RED   = '\x1b[31m'

// ─── Parse Figma URL → node ID ────────────────────────────────────────────────

function parseFigmaInput(input: string): { fileKey: string; nodeId?: string } {
  // figma.com/design/FILEKEY/...?node-id=X
  const fileMatch = input.match(/figma\.com\/(?:file|design)\/([a-zA-Z0-9]+)/)
  const nodeMatch = input.match(/node-id=([^&]+)/)

  if (fileMatch) {
    return {
      fileKey: fileMatch[1],
      nodeId: nodeMatch ? decodeURIComponent(nodeMatch[1]) : undefined,
    }
  }

  // Bare node ID passed directly
  return { fileKey: input, nodeId: undefined }
}

// ─── Confidence display ───────────────────────────────────────────────────────

function confidenceColor(level: string): string {
  if (level === 'high')   return '\x1b[32m'  // green
  if (level === 'medium') return '\x1b[33m'  // yellow
  return '\x1b[31m'                           // red
}

function confidenceMark(level: string): string {
  if (level === 'high')   return '●'
  if (level === 'medium') return '◐'
  return '○'
}

// ─── Write brand.config.ts ────────────────────────────────────────────────────

function writeConfig(
  result: ReturnType<typeof inferFromFigma>,
  projectName: string,
  sourceUrl: string
): void {
  const { config, confidence } = result
  const c = confidence

  const confComment = (field: string, level: string) =>
    level === 'high' ? '' : `  // confidence: ${level}`

  const content = `// brand.config.ts
// AUTO-EXTRACTED from Figma — do not edit directly unless refining.
// Source: ${sourceUrl}
// Extracted: ${new Date().toISOString().split('T')[0]}
//
// Confidence key: ● high  ◐ medium  ○ low (inferred/default)

import type { BrandConfig } from './src/lib/tokens/brand.config'

const brand: BrandConfig = {
  name: ${JSON.stringify(projectName)},

  colors: {
    primary: ${JSON.stringify(config.colors.primary)},  // ${confidenceMark(c.primary)} ${c.primary}
    grayTintStrength: 12,
  },

  typography: {
    sans: ${JSON.stringify(config.typography.sans)},
    ${config.typography.serif ? `serif: ${JSON.stringify(config.typography.serif)},` : '// serif: not found in design'}
    ${config.typography.mono  ? `mono:  ${JSON.stringify(config.typography.mono)},`  : '// mono:  not found in design'}
    scale: ${JSON.stringify(config.typography.scale)},
  },

  radius:  ${JSON.stringify(config.radius)},   // ${confidenceMark(c.radius)} ${c.radius}
  spacing: ${JSON.stringify(config.spacing)},  // ${confidenceMark(c.spacing)} ${c.spacing}
  shadow:  ${JSON.stringify(config.shadow)},   // ${confidenceMark(c.shadow)} ${c.shadow}
  motion:  ${JSON.stringify(config.motion)},   // ○ low — cannot extract from static file

  tov: {  // ${confidenceMark(c.tov)} ${c.tov}
    personality:    ${JSON.stringify(config.tov.personality)},
    formality:      ${JSON.stringify(config.tov.formality)},
    sentenceLength: ${JSON.stringify(config.tov.sentenceLength)},
    avoid:    ${JSON.stringify(config.tov.avoid)},
    examples: ${JSON.stringify(config.tov.examples, null, 2).replace(/\n/g, '\n    ')},
  },
}

export default brand
`

  fs.writeFileSync(path.join(ROOT, 'brand.config.ts'), content, 'utf-8')
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  const input = process.argv[2]

  if (!input) {
    console.error(`\n  ${RED}Usage: pnpm brand:extract <figma-url-or-file-key>${RESET}\n`)
    process.exit(1)
  }

  console.log(`\n${BOLD}${CYAN}Extracting brand from Figma…${RESET}\n`)

  const { fileKey, nodeId } = parseFigmaInput(input)

  // ── Call Figma MCP ────────────────────────────────────────────────────────
  // In a real agentic context (Claude Code / MCP-enabled session), this would
  // call the Figma MCP tools directly. Here we use the MCP HTTP API format
  // so this script can be run from Claude Code with MCP configured.

  let designContext: any
  let variableDefs: any

  try {
    console.log(`  ${DIM}Fetching design context…${RESET}`)

    // These would be actual MCP tool calls in an agentic context:
    // designContext = await mcp.figma.get_design_context({ node_id: nodeId ?? fileKey })
    // variableDefs  = await mcp.figma.get_variable_defs({ node_id: nodeId ?? fileKey })
    //
    // For now, read from a local cache if available (set by Claude Code MCP session)
    const cachePath = path.join(ROOT, '.figma-cache.json')
    if (fs.existsSync(cachePath)) {
      const cache = JSON.parse(fs.readFileSync(cachePath, 'utf-8'))
      designContext = cache.designContext
      variableDefs  = cache.variableDefs
      console.log(`  ${DIM}Using cached Figma data${RESET}`)
    } else {
      console.log(`  ${YELLOW}No Figma MCP cache found.${RESET}`)
      console.log(`  ${DIM}Run this from a Claude Code session with the Figma MCP connected,`)
      console.log(`  or use Claude chat with Figma connected and ask it to run the extraction.${RESET}`)
      process.exit(1)
    }
  } catch (err) {
    console.error(`  ${RED}Failed to fetch from Figma MCP:${RESET}`, err)
    process.exit(1)
  }

  // ── Run extraction ────────────────────────────────────────────────────────

  console.log(`  ${DIM}Analysing design…${RESET}`)

  const nodes = designContext?.nodes ?? [designContext]
  const variables = variableDefs?.collections ?? []

  const result = inferFromFigma(nodes, variables)
  const projectName = designContext?.name ?? fileKey

  // ── Write config ──────────────────────────────────────────────────────────

  writeConfig(result, projectName, input)

  // ── Report ────────────────────────────────────────────────────────────────

  const { confidence, notes } = result
  const cfg = result.config

  console.log(`\n${GREEN}${BOLD}✓ brand.config.ts written${RESET}\n`)
  console.log(`  ${confidenceColor(confidence.primary)}${confidenceMark(confidence.primary)}${RESET} Primary     ${BOLD}${cfg.colors.primary}${RESET}`)
  console.log(`  ${confidenceColor(confidence.radius)}${confidenceMark(confidence.radius)}${RESET} Radius      ${cfg.radius}`)
  console.log(`  ${confidenceColor(confidence.shadow)}${confidenceMark(confidence.shadow)}${RESET} Shadow      ${cfg.shadow}`)
  console.log(`  ${confidenceColor(confidence.spacing)}${confidenceMark(confidence.spacing)}${RESET} Spacing     ${cfg.spacing}`)
  console.log(`  ${confidenceColor('low')}${confidenceMark('low')}${RESET} Motion      ${cfg.motion} (default — static file)`)
  console.log(`  ${confidenceColor(confidence.tov)}${confidenceMark(confidence.tov)}${RESET} TOV         "${cfg.tov.personality}"`)
  console.log(`  ${DIM}  Sans: ${cfg.typography.sans[0]}${RESET}`)

  if (notes.length > 0) {
    console.log(`\n${YELLOW}Notes:${RESET}`)
    notes.forEach(n => console.log(`  ${DIM}→ ${n}${RESET}`))
  }

  console.log(`\n${DIM}Generating tokens…${RESET}`)
  execSync('pnpm brand:gen', { stdio: 'inherit', cwd: ROOT })

  console.log(`\n${GREEN}${BOLD}Done.${RESET} ${DIM}Review brand.config.ts, adjust any low-confidence values, then re-run pnpm brand:gen.${RESET}\n`)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
