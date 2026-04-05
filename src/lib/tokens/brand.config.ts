// brand.config.ts
// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for every project's visual identity.
//
// HOW TO USE:
//   1. Run `pnpm brand:init` — answers 3 questions, writes sensible defaults here
//   2. Set `colors.primary` to your brand 500 hex
//   3. Adjust anything you like — the rest is auto-derived at build time
//   4. Run `pnpm brand:gen` to regenerate tokens, theme.css, and brand.md
// ─────────────────────────────────────────────────────────────────────────────

export type Radius   = 'none' | 'sm' | 'md' | 'lg' | 'full'
export type Spacing  = 'compact' | 'comfortable' | 'spacious'
export type Motion   = 'none' | 'minimal' | 'smooth' | 'expressive'
export type Shadow   = 'none' | 'soft' | 'crisp' | 'elevated'
export type Formality = 'formal' | 'conversational' | 'casual'

export interface BrandConfig {
  /** Human name for the project — used in generated docs */
  name: string

  colors: {
    /** The 500 value for your primary brand colour. Everything else is derived. */
    primary: string
    /**
     * Optional manual override for secondary 500. If omitted, auto-derived
     * at 60° hue shift from primary.
     */
    secondary?: string
    /**
     * How strongly the primary hue tints the neutral grays. 0 = pure gray.
     * 8–16 is the sweet spot. Default: 12.
     */
    grayTintStrength?: number
  }

  typography: {
    /** Primary UI font — loaded via next/font or @font-face */
    sans: string[]
    /** Optional editorial / display font */
    serif?: string[]
    mono?: string[]
    /**
     * Overall type scale feel.
     * 'tight'  — smaller sizes, tighter line-height (dense UIs)
     * 'default' — balanced
     * 'loose'  — larger sizes, more leading (editorial / marketing)
     */
    scale: 'tight' | 'default' | 'loose'
  }

  /**
   * Corner rounding, applied consistently to all interactive elements.
   * 'none' → 0px  'sm' → 4px  'md' → 8px  'lg' → 16px  'full' → 9999px
   */
  radius: Radius

  /**
   * Base spacing unit multiplier — affects padding, gaps, section rhythm.
   * 'compact' → 0.8×  'comfortable' → 1×  'spacious' → 1.25×
   */
  spacing: Spacing

  /**
   * Shadow system. Controls depth cues across cards, dropdowns, modals.
   * 'none'     → no shadows anywhere
   * 'soft'     → large, diffused, low opacity (airy / modern)
   * 'crisp'    → tight, high contrast (editorial / graphic)
   * 'elevated' → layered multi-shadow system (rich / material-ish)
   */
  shadow: Shadow

  /**
   * Motion personality. Controls duration, easing, and which things animate.
   * 'none'       → no transitions at all (accessibility-first / utilitarian)
   * 'minimal'    → only opacity, near-instant (50–80ms)
   * 'smooth'     → standard transitions (150–250ms), considered easing
   * 'expressive' → springy, choreographed, longer durations (200–400ms)
   */
  motion: Motion

  tov: {
    /**
     * One-sentence personality description — written into brand.md for Claude.
     * e.g. "Direct and warm, with a dry wit. Never corporate."
     */
    personality: string

    formality: Formality

    /**
     * How long sentences should feel.
     * 'short' = punchy fragments welcome
     * 'medium' = natural prose
     * 'long' = complex ideas, subordinate clauses fine
     */
    sentenceLength: 'short' | 'medium' | 'long'

    /**
     * Words, patterns, or phrases to actively avoid.
     * Injected into brand.md as a "never say" list for Claude.
     */
    avoid: string[]

    /**
     * Concrete examples — the fastest way to calibrate Claude's copy output.
     * Each key is a UI context, value is the correct voice for that context.
     */
    examples: {
      cta?: string          // e.g. "Get started" not "Begin your journey"
      emptyState?: string   // e.g. "Nothing here yet."
      error?: string        // e.g. "Something went wrong."
      placeholder?: string  // e.g. "Search…" not "Start typing to search"
      tooltip?: string      // e.g. "Saves automatically" not "Your work is being saved"
      [key: string]: string | undefined
    }
  }

  /**
   * Button-specific overrides. By default derived from radius + shadow,
   * but can be decoupled (e.g. full-radius buttons on an otherwise sharp UI).
   */
  buttons?: {
    radius?: Radius   // overrides global radius for buttons only
    shadow?: boolean  // whether buttons cast a shadow
    uppercase?: boolean
    letterSpacing?: 'none' | 'wide' | 'wider'
  }
}

// ─── Preset inference ─────────────────────────────────────────────────────────
// This is what the `brand:init` script writes based on the 3 onboarding
// questions. Exported so the init script can import it directly.

export type ProductType = 'saas' | 'consumer' | 'ai-prototype' | 'editorial'
export type VibeType    = 'minimal' | 'functional' | 'expressive' | 'trustworthy'
export type MotionPref  = 'none' | 'minimal' | 'smooth' | 'expressive'

export function inferPreset(
  productType: ProductType,
  vibe: VibeType,
  motionPref: MotionPref
): Omit<BrandConfig, 'name' | 'colors' | 'typography'> {
  // Radius: expressive + consumer → rounder; functional/trustworthy → squarer
  const radius: Radius = (() => {
    if (vibe === 'expressive' || productType === 'consumer') return 'lg'
    if (vibe === 'functional') return 'sm'
    if (vibe === 'trustworthy') return 'md'
    return 'md'
  })()

  // Spacing: editorial + minimal → spacious; functional → compact
  const spacing: Spacing = (() => {
    if (vibe === 'minimal' || productType === 'editorial') return 'spacious'
    if (vibe === 'functional' || productType === 'saas') return 'compact'
    return 'comfortable'
  })()

  // Shadow: minimal/ai-prototype → none/soft; expressive → elevated; trustworthy → crisp
  const shadow: Shadow = (() => {
    if (vibe === 'minimal' || productType === 'ai-prototype') return 'soft'
    if (vibe === 'expressive') return 'elevated'
    if (vibe === 'trustworthy') return 'crisp'
    if (vibe === 'functional') return 'none'
    return 'soft'
  })()

  // TOV: inferred from vibe + product type
  const personality = (() => {
    const map: Record<VibeType, string> = {
      minimal:     'Clear and quiet. Says what it needs to, nothing more.',
      functional:  'Precise and efficient. Respects the user\'s time.',
      expressive:  'Warm, characterful, a little playful. Sounds human.',
      trustworthy: 'Calm and confident. Authoritative without being stiff.',
    }
    return map[vibe]
  })()

  const formality: Formality = (() => {
    if (vibe === 'expressive' || productType === 'consumer') return 'casual'
    if (vibe === 'trustworthy') return 'formal'
    return 'conversational'
  })()

  const sentenceLength = vibe === 'functional' ? 'short' : vibe === 'expressive' ? 'medium' : 'short'

  const avoidMap: Record<VibeType, string[]> = {
    minimal:     ['exclamation marks', 'filler phrases', 'over-explanation'],
    functional:  ['jargon', 'passive voice', 'marketing language'],
    expressive:  ['corporate speak', 'passive voice', 'cold error messages'],
    trustworthy: ['slang', 'exclamation marks', 'vague language'],
  }

  const examplesMap: Record<VibeType, BrandConfig['tov']['examples']> = {
    minimal: {
      cta: 'Get started',
      emptyState: 'Nothing here yet.',
      error: 'Something went wrong.',
      placeholder: 'Search…',
    },
    functional: {
      cta: 'Open',
      emptyState: 'No results.',
      error: 'Request failed. Try again.',
      placeholder: 'Filter…',
    },
    expressive: {
      cta: 'Let\'s go',
      emptyState: 'Nothing here yet — but that\'s about to change.',
      error: 'Hmm, that didn\'t work. Give it another try.',
      placeholder: 'What are you looking for?',
    },
    trustworthy: {
      cta: 'Get started',
      emptyState: 'No items to display.',
      error: 'We couldn\'t complete that action. Please try again.',
      placeholder: 'Search',
    },
  }

  return {
    radius,
    spacing,
    shadow,
    motion: motionPref,
    buttons: {
      radius,
      shadow: shadow !== 'none' && shadow !== 'soft',
      uppercase: false,
      letterSpacing: 'none',
    },
    tov: {
      personality,
      formality,
      sentenceLength,
      avoid: avoidMap[vibe],
      examples: examplesMap[vibe],
    },
  }
}

// ─── Default config (overwritten by brand:init) ───────────────────────────────

const brand: BrandConfig = {
  name: 'My Project',

  colors: {
    primary: '#5B4CF5',
    grayTintStrength: 12,
  },

  typography: {
    sans: ['Inter', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
    scale: 'default',
  },

  ...inferPreset('ai-prototype', 'minimal', 'smooth'),
}

export default brand
