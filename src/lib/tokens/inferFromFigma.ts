// src/lib/tokens/inferFromFigma.ts
// ─────────────────────────────────────────────────────────────────────────────
// Maps raw Figma MCP output → BrandConfig values.
//
// Called by scripts/extract-brand.ts after fetching from the Figma MCP.
// Can also be imported and called programmatically.
// ─────────────────────────────────────────────────────────────────────────────

import type { BrandConfig, Radius, Spacing, Shadow, Motion, Formality } from './brand.config'

// ─── Figma MCP output types (simplified) ─────────────────────────────────────

export interface FigmaColor {
  r: number  // 0–1
  g: number  // 0–1
  b: number  // 0–1
  a: number  // 0–1
}

export interface FigmaEffect {
  type: 'DROP_SHADOW' | 'INNER_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR'
  visible: boolean
  radius: number
  offset?: { x: number; y: number }
  color?: FigmaColor
}

export interface FigmaNode {
  id: string
  name: string
  type: string
  fills?: Array<{ type: string; color?: FigmaColor; opacity?: number }>
  effects?: FigmaEffect[]
  cornerRadius?: number
  absoluteBoundingBox?: { width: number; height: number; x: number; y: number }
  paddingLeft?: number
  paddingRight?: number
  paddingTop?: number
  paddingBottom?: number
  itemSpacing?: number
  style?: {
    fontFamily?: string
    fontSize?: number
    lineHeightPx?: number
    fontWeight?: number
    letterSpacing?: number
  }
  characters?: string  // text content
  children?: FigmaNode[]
}

export interface FigmaVariable {
  name: string
  resolvedType: 'COLOR' | 'FLOAT' | 'STRING' | 'BOOLEAN'
  valuesByMode: Record<string, { r?: number; g?: number; b?: number; a?: number } | number | string>
}

export interface FigmaVariableCollection {
  name: string
  modes: Array<{ modeId: string; name: string }>
  variables: FigmaVariable[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function figmaColorToHex(c: FigmaColor): string {
  const r = Math.round(c.r * 255)
  const g = Math.round(c.g * 255)
  const b = Math.round(c.b * 255)
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
}

function colorSaturation(c: FigmaColor): number {
  const max = Math.max(c.r, c.g, c.b)
  const min = Math.min(c.r, c.g, c.b)
  const l = (max + min) / 2
  if (max === min) return 0
  const d = max - min
  return l > 0.5 ? d / (2 - max - min) : d / (max + min)
}

function colorLightness(c: FigmaColor): number {
  return (Math.max(c.r, c.g, c.b) + Math.min(c.r, c.g, c.b)) / 2
}

function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2
}

function walkNodes(node: FigmaNode, collector: (n: FigmaNode) => void) {
  collector(node)
  node.children?.forEach(child => walkNodes(child, collector))
}

// Is this node an interactive/CTA component?
function isInteractive(node: FigmaNode): boolean {
  const n = node.name.toLowerCase()
  return (
    n.includes('button') || n.includes('btn') || n.includes('cta') ||
    n.includes('link') || n.includes('tab') || n.includes('chip') ||
    n.includes('badge') || n.includes('tag') || n.includes('toggle') ||
    node.type === 'INSTANCE'
  )
}

function isCard(node: FigmaNode): boolean {
  const n = node.name.toLowerCase()
  return n.includes('card') || n.includes('panel') || n.includes('modal') ||
         n.includes('sheet') || n.includes('dialog') || n.includes('input') ||
         n.includes('field') || n.includes('dropdown')
}

// ─── 1. Extract primary colour ────────────────────────────────────────────────

export function extractPrimaryColor(
  nodes: FigmaNode[],
  variables?: FigmaVariableCollection[]
): { hex: string; confidence: 'high' | 'medium' | 'low' } {

  // Priority 1: Figma variables — look for a "primary", "brand", "accent" color
  if (variables?.length) {
    for (const collection of variables) {
      const brandVars = collection.variables.filter(v => {
        const n = v.name.toLowerCase()
        return v.resolvedType === 'COLOR' && (
          n.includes('primary') || n.includes('brand') ||
          n.includes('accent') || n.includes('500')
        )
      })
      if (brandVars.length > 0) {
        const firstMode = collection.modes[0].modeId
        const val = brandVars[0].valuesByMode[firstMode] as FigmaColor
        if (val && typeof val === 'object' && 'r' in val) {
          return { hex: figmaColorToHex(val), confidence: 'high' }
        }
      }
    }
  }

  // Priority 2: Sample fills on interactive components
  const interactiveFills: FigmaColor[] = []
  nodes.forEach(root => {
    walkNodes(root, node => {
      if (isInteractive(node) && node.fills) {
        node.fills.forEach(fill => {
          if (fill.type === 'SOLID' && fill.color && colorSaturation(fill.color) > 0.3) {
            interactiveFills.push(fill.color)
          }
        })
      }
    })
  })

  if (interactiveFills.length >= 3) {
    // Most saturated, mid-lightness fill = primary
    const sorted = interactiveFills
      .filter(c => colorLightness(c) > 0.2 && colorLightness(c) < 0.85)
      .sort((a, b) => colorSaturation(b) - colorSaturation(a))

    if (sorted.length > 0) {
      return {
        hex: figmaColorToHex(sorted[0]),
        confidence: interactiveFills.length >= 5 ? 'high' : 'medium',
      }
    }
  }

  // Priority 3: Most common saturated fill across all nodes
  const allFills: FigmaColor[] = []
  nodes.forEach(root => {
    walkNodes(root, node => {
      node.fills?.forEach(fill => {
        if (fill.type === 'SOLID' && fill.color && colorSaturation(fill.color) > 0.4) {
          allFills.push(fill.color)
        }
      })
    })
  })

  if (allFills.length > 0) {
    const mostSaturated = allFills.sort((a, b) => colorSaturation(b) - colorSaturation(a))[0]
    return { hex: figmaColorToHex(mostSaturated), confidence: 'low' }
  }

  return { hex: '#6366f1', confidence: 'low' }  // fallback
}

// ─── 2. Extract radius ────────────────────────────────────────────────────────

export function extractRadius(
  nodes: FigmaNode[]
): { value: Radius; confidence: 'high' | 'medium' | 'low' } {
  const radii: number[] = []

  nodes.forEach(root => {
    walkNodes(root, node => {
      if (
        (isInteractive(node) || isCard(node)) &&
        node.cornerRadius !== undefined &&
        node.cornerRadius !== null
      ) {
        radii.push(node.cornerRadius)
      }
    })
  })

  if (radii.length === 0) return { value: 'md', confidence: 'low' }

  const med = median(radii)
  const confidence = radii.length >= 5 ? 'high' : 'medium'

  let value: Radius
  if (med === 0)        value = 'none'
  else if (med <= 4)    value = 'sm'
  else if (med <= 10)   value = 'md'
  else if (med <= 20)   value = 'lg'
  else                  value = 'full'

  return { value, confidence }
}

// ─── 3. Extract shadow ────────────────────────────────────────────────────────

export function extractShadow(
  nodes: FigmaNode[]
): { value: Shadow; confidence: 'high' | 'medium' | 'low' } {
  const allEffects: FigmaEffect[] = []
  let cardCount = 0

  nodes.forEach(root => {
    walkNodes(root, node => {
      if (isCard(node)) {
        cardCount++
        node.effects?.filter(e => e.visible && e.type === 'DROP_SHADOW')
          .forEach(e => allEffects.push(e))
      }
    })
  })

  if (cardCount === 0 || allEffects.length === 0) {
    return { value: 'none', confidence: cardCount > 0 ? 'high' : 'low' }
  }

  const confidence = cardCount >= 3 ? 'high' : 'medium'

  // Multiple shadows on same element
  if (allEffects.length > cardCount * 1.5) {
    return { value: 'elevated', confidence }
  }

  const avgBlur = median(allEffects.map(e => e.radius))
  const avgOffset = median(allEffects.map(e =>
    Math.max(Math.abs(e.offset?.x ?? 0), Math.abs(e.offset?.y ?? 0))
  ))
  const avgOpacity = median(allEffects.map(e => e.color?.a ?? 0.1))

  if (avgOffset >= 2 && avgBlur <= 8) return { value: 'crisp', confidence }
  if (avgBlur > 16 && avgOpacity < 0.12) return { value: 'soft', confidence }
  return { value: 'soft', confidence }
}

// ─── 4. Extract spacing ───────────────────────────────────────────────────────

export function extractSpacing(
  nodes: FigmaNode[]
): { value: Spacing; confidence: 'high' | 'medium' | 'low' } {
  const spacings: number[] = []

  nodes.forEach(root => {
    walkNodes(root, node => {
      if (node.itemSpacing !== undefined && node.itemSpacing > 0) {
        spacings.push(node.itemSpacing)
      }
      const padding = Math.max(
        node.paddingLeft ?? 0,
        node.paddingTop ?? 0
      )
      if (padding > 0) spacings.push(padding)
    })
  })

  if (spacings.length === 0) return { value: 'comfortable', confidence: 'low' }

  const med = median(spacings)
  const confidence = spacings.length >= 8 ? 'high' : 'medium'

  let value: Spacing
  if (med < 14)       value = 'compact'
  else if (med <= 22) value = 'comfortable'
  else                value = 'spacious'

  return { value, confidence }
}

// ─── 5. Extract font ──────────────────────────────────────────────────────────

export function extractFonts(nodes: FigmaNode[]): {
  sans: string
  serif?: string
  mono?: string
  scale: 'tight' | 'default' | 'loose'
} {
  const fontCounts: Record<string, number> = {}
  const lineHeightRatios: number[] = []

  nodes.forEach(root => {
    walkNodes(root, node => {
      if (node.style?.fontFamily) {
        fontCounts[node.style.fontFamily] = (fontCounts[node.style.fontFamily] ?? 0) + 1
      }
      if (node.style?.lineHeightPx && node.style?.fontSize) {
        lineHeightRatios.push(node.style.lineHeightPx / node.style.fontSize)
      }
    })
  })

  const sortedFonts = Object.entries(fontCounts).sort((a, b) => b[1] - a[1])
  const primaryFont = sortedFonts[0]?.[0] ?? 'Inter'

  // Detect mono font
  const monoFont = sortedFonts.find(([name]) =>
    name.toLowerCase().includes('mono') ||
    name.toLowerCase().includes('code') ||
    name.toLowerCase().includes('jetbrains') ||
    name.toLowerCase().includes('fira') ||
    name.toLowerCase().includes('source code')
  )?.[0]

  // Detect serif font
  const serifFont = sortedFonts.find(([name]) =>
    name.toLowerCase().includes('serif') ||
    name.toLowerCase().includes('georgia') ||
    name.toLowerCase().includes('playfair') ||
    name.toLowerCase().includes('lora') ||
    name.toLowerCase().includes('merriweather')
  )?.[0]

  const avgLineHeight = median(lineHeightRatios)
  let scale: 'tight' | 'default' | 'loose' = 'default'
  if (avgLineHeight < 1.3) scale = 'tight'
  else if (avgLineHeight > 1.6) scale = 'loose'

  return { sans: primaryFont, serif: serifFont, mono: monoFont, scale }
}

// ─── 6. Infer TOV from copy ───────────────────────────────────────────────────

export function inferTOV(nodes: FigmaNode[]): {
  personality: string
  formality: Formality
  sentenceLength: 'short' | 'medium' | 'long'
  avoid: string[]
  examples: Record<string, string>
  confidence: 'high' | 'medium' | 'low'
} {
  const textNodes: string[] = []

  nodes.forEach(root => {
    walkNodes(root, node => {
      if (node.characters && node.characters.length > 2 && node.characters.length < 200) {
        textNodes.push(node.characters)
      }
    })
  })

  if (textNodes.length < 5) {
    return {
      personality: 'Clear and functional. Communicates directly.',
      formality: 'conversational',
      sentenceLength: 'short',
      avoid: [],
      examples: {},
      confidence: 'low',
    }
  }

  // Analyse copy signals
  const allText = textNodes.join(' ')
  const hasExclamation = (allText.match(/!/g) ?? []).length > 2
  const hasContractions = /\b(it's|you're|we're|don't|can't|we'll)\b/i.test(allText)
  const hasSlang = /\b(hey|awesome|cool|yeah|nope|yep)\b/i.test(allText)
  const hasTechnicalTerms = /\b(configure|authenticate|initialise|endpoint|token|schema)\b/i.test(allText)
  const avgWordCount = median(
    textNodes
      .filter(t => t.includes(' '))
      .map(t => t.split(/\s+/).length)
  )

  // Find examples from common UI copy patterns
  const examples: Record<string, string> = {}
  const ctaNode = textNodes.find(t =>
    /^(get started|sign up|create|continue|save|submit|send|try|start|open|add)/i.test(t.trim())
  )
  if (ctaNode) examples.cta = ctaNode.trim()

  const emptyNode = textNodes.find(t =>
    /no (results|items|data|content)|nothing|empty/i.test(t)
  )
  if (emptyNode) examples.emptyState = emptyNode.trim()

  // Formality
  let formality: Formality = 'conversational'
  if (hasSlang || hasContractions) formality = 'casual'
  if (!hasContractions && !hasSlang && hasTechnicalTerms) formality = 'formal'

  // Sentence length
  let sentenceLength: 'short' | 'medium' | 'long' = 'short'
  if (avgWordCount > 8) sentenceLength = 'medium'
  if (avgWordCount > 14) sentenceLength = 'long'

  // Avoid list
  const avoid: string[] = []
  if (!hasExclamation) avoid.push('exclamation marks')
  if (!hasContractions) avoid.push('contractions')
  if (!hasSlang) avoid.push('slang')

  // Personality — synthesised from signals
  const personalities = []
  if (formality === 'formal' && hasTechnicalTerms) personalities.push('precise and technical')
  if (formality === 'casual' && hasExclamation) personalities.push('warm and encouraging')
  if (formality === 'conversational' && !hasExclamation) personalities.push('direct and clear')
  if (!hasTechnicalTerms && sentenceLength === 'short') personalities.push('concise')
  if (hasContractions) personalities.push('approachable')

  const personality = personalities.length > 0
    ? personalities.join(', ') + '.'
    : 'Clear and direct. Says what it needs to.'

  return {
    personality,
    formality,
    sentenceLength,
    avoid,
    examples,
    confidence: textNodes.length >= 20 ? 'high' : 'medium',
  }
}

// ─── 7. Main entry point ─────────────────────────────────────────────────────

export interface ExtractionResult {
  config: Omit<BrandConfig, 'name'>
  confidence: {
    primary: 'high' | 'medium' | 'low'
    radius: 'high' | 'medium' | 'low'
    shadow: 'high' | 'medium' | 'low'
    spacing: 'high' | 'medium' | 'low'
    tov: 'high' | 'medium' | 'low'
    motion: 'low'  // always low for static files
  }
  notes: string[]
}

export function inferFromFigma(
  nodes: FigmaNode[],
  variables?: FigmaVariableCollection[]
): ExtractionResult {
  const notes: string[] = []

  const primaryResult = extractPrimaryColor(nodes, variables)
  const radiusResult  = extractRadius(nodes)
  const shadowResult  = extractShadow(nodes)
  const spacingResult = extractSpacing(nodes)
  const fonts         = extractFonts(nodes)
  const tov           = inferTOV(nodes)

  if (primaryResult.confidence === 'low') {
    notes.push('Primary colour was not clearly identified — review and adjust colors.primary')
  }
  if (radiusResult.confidence === 'low') {
    notes.push('Radius could not be reliably sampled — defaulted to md (8px)')
  }
  if (tov.confidence === 'low') {
    notes.push('TOV inferred with low confidence — limited copy found in design')
  }
  notes.push('Motion defaults to smooth (200ms) — cannot extract from static Figma file')

  return {
    config: {
      colors: {
        primary: primaryResult.hex,
        grayTintStrength: 12,
      },
      typography: {
        sans: [fonts.sans, 'sans-serif'],
        ...(fonts.serif ? { serif: [fonts.serif, 'serif'] } : {}),
        ...(fonts.mono  ? { mono:  [fonts.mono,  'monospace'] } : {}),
        scale: fonts.scale,
      },
      radius:  radiusResult.value,
      spacing: spacingResult.value,
      shadow:  shadowResult.value,
      motion:  'smooth',
      tov: {
        personality:    tov.personality,
        formality:      tov.formality,
        sentenceLength: tov.sentenceLength,
        avoid:          tov.avoid,
        examples:       tov.examples,
      },
    },
    confidence: {
      primary: primaryResult.confidence,
      radius:  radiusResult.confidence,
      shadow:  shadowResult.confidence,
      spacing: spacingResult.confidence,
      tov:     tov.confidence,
      motion:  'low',
    },
    notes,
  }
}
