#!/usr/bin/env tsx
// scripts/gen-tokens.ts
// ─────────────────────────────────────────────────────────────────────────────
// Run with: pnpm brand:gen
//
// Reads brand.config.ts → writes:
//   tailwind.config.ts        (color + spacing + radius tokens)
//   src/styles/theme.css      (CSS custom properties + Radix overrides)
//   .claude/context/brand.md  (Claude-readable brand reference)
// ─────────────────────────────────────────────────────────────────────────────

import fs from 'fs'
import path from 'path'
import brand from '../src/lib/tokens/brand.config'
import { generateAllScales, generateColorScale } from '../src/lib/tokens/generateColorScale'
import type { ColorScale } from '../src/lib/tokens/generateColorScale'

const ROOT = path.resolve(__dirname, '..')

// ─── 1. Generate scales ───────────────────────────────────────────────────────

const { primary, secondary, gray } = generateAllScales(brand.colors.primary, {
  secondaryHueShift: 60,
  grayTintStrength: brand.colors.grayTintStrength ?? 12,
})

// Status / feedback ("traffic light") scales — each 500 expanded to 100–900.
const STATUS_DEFAULTS = {
  positive: '#36A342',
  negative: '#E43C33',
  notice:   '#FB8A65',
}
const statusInput = brand.colors.status ?? STATUS_DEFAULTS
const positive = generateColorScale(statusInput.positive)
const negative = generateColorScale(statusInput.negative)
const notice   = generateColorScale(statusInput.notice)

// ─── Radius map ───────────────────────────────────────────────────────────────

const RADIUS_PX: Record<string, string> = {
  none: '0px',
  sm:   '4px',
  md:   '8px',
  lg:   '16px',
  full: '9999px',
}

const SPACING_SCALE: Record<string, number> = {
  compact:     0.8,
  comfortable: 1,
  spacious:    1.25,
}

// ─── Type scale ───────────────────────────────────────────────────────────────
// Each entry: [name, fontSize, lineHeight]. Tuned per typography.scale feel.

const TYPE_SCALE: Record<'tight' | 'default' | 'loose', Array<[string, string, string]>> = {
  tight: [
    ['xs', '0.75rem', '1rem'],   ['sm', '0.8125rem', '1.125rem'], ['base', '0.875rem', '1.375rem'],
    ['lg', '1rem', '1.5rem'],    ['xl', '1.125rem', '1.625rem'],  ['2xl', '1.375rem', '1.75rem'],
    ['3xl', '1.75rem', '2rem'],  ['4xl', '2.25rem', '2.5rem'],    ['5xl', '2.75rem', '1.1'],
  ],
  default: [
    ['xs', '0.75rem', '1rem'],     ['sm', '0.875rem', '1.25rem'],  ['base', '1rem', '1.5rem'],
    ['lg', '1.125rem', '1.75rem'], ['xl', '1.25rem', '1.75rem'],   ['2xl', '1.5rem', '2rem'],
    ['3xl', '1.875rem', '2.25rem'],['4xl', '2.25rem', '2.5rem'],   ['5xl', '3rem', '1.1'],
  ],
  loose: [
    ['xs', '0.8125rem', '1.25rem'],['sm', '0.9375rem', '1.5rem'],  ['base', '1.0625rem', '1.75rem'],
    ['lg', '1.25rem', '1.875rem'], ['xl', '1.5rem', '2rem'],       ['2xl', '1.875rem', '2.375rem'],
    ['3xl', '2.375rem', '2.75rem'],['4xl', '3rem', '3.25rem'],     ['5xl', '3.75rem', '1.05'],
  ],
}

// ─── Motion tokens ───────────────────────────────────────────────────────────

const MOTION_TOKENS: Record<string, { duration: string; easing: string; scale: string }> = {
  none:       { duration: '0ms',   easing: 'linear',                       scale: '0ms' },
  minimal:    { duration: '60ms',  easing: 'ease-out',                     scale: '60ms' },
  smooth:     { duration: '200ms', easing: 'cubic-bezier(0.4, 0, 0.2, 1)', scale: '150ms' },
  expressive: { duration: '320ms', easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', scale: '250ms' },
}

// ─── Shadow tokens ────────────────────────────────────────────────────────────

const SHADOW_TOKENS: Record<string, { sm: string; md: string; lg: string }> = {
  none:     { sm: 'none', md: 'none', lg: 'none' },
  soft:     {
    sm: '0 1px 8px rgba(0,0,0,0.06)',
    md: '0 4px 20px rgba(0,0,0,0.08)',
    lg: '0 8px 40px rgba(0,0,0,0.10)',
  },
  crisp:    {
    sm: '2px 2px 0 rgba(0,0,0,0.10)',
    md: '4px 4px 0 rgba(0,0,0,0.10)',
    lg: '6px 6px 0 rgba(0,0,0,0.10)',
  },
  elevated: {
    sm: '0 1px 3px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.06)',
    md: '0 4px 12px rgba(0,0,0,0.10), 0 8px 24px rgba(0,0,0,0.08)',
    lg: '0 8px 24px rgba(0,0,0,0.12), 0 16px 48px rgba(0,0,0,0.10)',
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scaleToObj(scale: ColorScale): Record<string, string> {
  return Object.fromEntries(
    Object.entries(scale).map(([k, v]) => [k, v as string])
  )
}

function write(filePath: string, content: string) {
  const abs = path.join(ROOT, filePath)
  fs.mkdirSync(path.dirname(abs), { recursive: true })
  fs.writeFileSync(abs, content, 'utf-8')
  console.log(`  ✓ ${filePath}`)
}

// ─── 2. Write tailwind.config.ts ─────────────────────────────────────────────

function genTailwind() {
  const mult = SPACING_SCALE[brand.spacing]
  const baseSpacing = [0, 1, 2, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96]
  const spacingEntries = baseSpacing
    .map(n => `    '${n}': '${(n * mult * 0.25).toFixed(3)}rem'`)
    .join(',\n')

  const colorEntries = (name: string, scale: ColorScale) =>
    Object.entries(scaleToObj(scale))
      .map(([k, v]) => `        '${k}': '${v}'`)
      .join(',\n')

  const fontSizeEntries = TYPE_SCALE[brand.typography.scale]
    .map(([name, size, lh]) => `        '${name}': ['${size}', { lineHeight: '${lh}' }]`)
    .join(',\n')

  const content = `import type { Config } from 'tailwindcss'

// AUTO-GENERATED by scripts/gen-tokens.ts — do not edit directly
// Edit brand.config.ts then run: pnpm brand:gen

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
${colorEntries('brand', primary)}
        },
        'brand-secondary': {
${colorEntries('secondary', secondary)}
        },
        gray: {
${colorEntries('gray', gray)}
        },
        positive: {
${colorEntries('positive', positive)}
        },
        negative: {
${colorEntries('negative', negative)}
        },
        notice: {
${colorEntries('notice', notice)}
        },
      },
      fontFamily: {
        sans: ${JSON.stringify(brand.typography.sans)},
        ${brand.typography.serif ? `serif: ${JSON.stringify(brand.typography.serif)},` : ''}
        ${brand.typography.mono ? `mono: ${JSON.stringify(brand.typography.mono)},` : ''}
      },
      fontSize: {
${fontSizeEntries}
      },
      borderRadius: {
        DEFAULT: '${RADIUS_PX[brand.radius]}',
        sm:      '${RADIUS_PX[brand.radius === 'none' ? 'none' : 'sm']}',
        md:      '${RADIUS_PX[brand.radius]}',
        lg:      '${RADIUS_PX[brand.radius === 'full' ? 'full' : 'lg']}',
        full:    '9999px',
      },
      spacing: {
${spacingEntries}
      },
      transitionDuration: {
        DEFAULT: '${MOTION_TOKENS[brand.motion].duration}',
      },
      transitionTimingFunction: {
        DEFAULT: '${MOTION_TOKENS[brand.motion].easing}',
        spring:  '${MOTION_TOKENS[brand.motion].easing}',
      },
      boxShadow: {
        sm:   '${SHADOW_TOKENS[brand.shadow].sm}',
        DEFAULT: '${SHADOW_TOKENS[brand.shadow].md}',
        md:   '${SHADOW_TOKENS[brand.shadow].md}',
        lg:   '${SHADOW_TOKENS[brand.shadow].lg}',
      },
    },
  },
  plugins: [],
}

export default config
`
  write('tailwind.config.ts', content)
}

// ─── 3. Write theme.css (CSS vars + Radix overrides) ─────────────────────────

function genThemeCss() {
  const r = RADIUS_PX[brand.radius]
  const mot = MOTION_TOKENS[brand.motion]
  const shad = SHADOW_TOKENS[brand.shadow]

  const cssVarsFromScale = (prefix: string, scale: ColorScale) =>
    Object.entries(scaleToObj(scale))
      .map(([k, v]) => `  --color-${prefix}-${k}: ${v};`)
      .join('\n')

  const content = `/* AUTO-GENERATED by scripts/gen-tokens.ts — do not edit directly */
/* Edit brand.config.ts then run: pnpm brand:gen */

@layer base {
  :root {
    /* ── Brand scales ── */
${cssVarsFromScale('brand', primary)}
${cssVarsFromScale('brand-sec', secondary)}
${cssVarsFromScale('gray', gray)}

    /* ── Status scales ── */
${cssVarsFromScale('positive', positive)}
${cssVarsFromScale('negative', negative)}
${cssVarsFromScale('notice', notice)}

    /* ── Semantic aliases ── */
    --color-accent:        var(--color-brand-500);
    --color-accent-hover:  var(--color-brand-600);
    --color-accent-subtle: var(--color-brand-100);
    --color-accent-fg:     var(--color-brand-50);

    --color-surface:       var(--color-gray-100);
    --color-surface-raised: #ffffff;
    --color-border:        var(--color-gray-200);
    --color-border-strong: var(--color-gray-300);

    --color-text-primary:   var(--color-gray-900);
    --color-text-secondary: var(--color-gray-600);
    --color-text-muted:     var(--color-gray-400);

    /* ── Status / feedback ── */
    /* Use *-subtle for backgrounds, the base for borders/icons, *-fg for text on a filled surface */
    --color-success:        var(--color-positive-500);
    --color-success-subtle: var(--color-positive-100);
    --color-success-fg:     #ffffff;
    --color-danger:         var(--color-negative-500);
    --color-danger-subtle:  var(--color-negative-100);
    --color-danger-fg:      #ffffff;
    --color-warning:        var(--color-notice-500);
    --color-warning-subtle: var(--color-notice-100);
    --color-warning-fg:     var(--color-gray-900);
    --color-info:           var(--color-brand-500);
    --color-info-subtle:    var(--color-brand-100);
    --color-info-fg:        #ffffff;

    /* ── Radius ── */
    --radius-sm:   ${RADIUS_PX[brand.radius === 'none' ? 'none' : 'sm']};
    --radius:      ${r};
    --radius-lg:   ${RADIUS_PX[brand.radius === 'full' ? 'full' : 'lg']};
    --radius-full: 9999px;

    /* ── Motion ── */
    --duration-fast:    ${mot.scale};
    --duration:         ${mot.duration};
    --duration-slow:    ${brand.motion === 'expressive' ? '480ms' : brand.motion === 'smooth' ? '350ms' : mot.duration};
    --easing:           ${mot.easing};

    /* ── Shadows ── */
    --shadow-sm: ${shad.sm};
    --shadow:    ${shad.md};
    --shadow-lg: ${shad.lg};

    /* ── Radix UI overrides ── */
    /* Maps Radix accent scale to brand scale */
    --accent-1:  var(--color-brand-100);
    --accent-2:  var(--color-brand-200);
    --accent-3:  var(--color-brand-200);
    --accent-4:  var(--color-brand-300);
    --accent-5:  var(--color-brand-400);
    --accent-6:  var(--color-brand-400);
    --accent-7:  var(--color-brand-500);
    --accent-8:  var(--color-brand-500);
    --accent-9:  var(--color-brand-500);
    --accent-10: var(--color-brand-600);
    --accent-11: var(--color-brand-700);
    --accent-12: var(--color-brand-900);

    /* Radix gray scale → tinted grays */
    --gray-1:  var(--color-gray-100);
    --gray-2:  var(--color-gray-100);
    --gray-3:  var(--color-gray-200);
    --gray-4:  var(--color-gray-200);
    --gray-5:  var(--color-gray-300);
    --gray-6:  var(--color-gray-300);
    --gray-7:  var(--color-gray-400);
    --gray-8:  var(--color-gray-500);
    --gray-9:  var(--color-gray-500);
    --gray-10: var(--color-gray-600);
    --gray-11: var(--color-gray-700);
    --gray-12: var(--color-gray-900);

    /* Radix radius */
    --radius-1: var(--radius-sm);
    --radius-2: var(--radius);
    --radius-3: var(--radius-lg);
    --radius-4: var(--radius-full);
    --radius-5: var(--radius-full);
    --radius-6: var(--radius-full);
  }

  /* ── Dark mode ── */
  .dark, [data-theme="dark"] {
    --color-surface:        var(--color-gray-900);
    --color-surface-raised: var(--color-gray-800);
    --color-border:         var(--color-gray-700);
    --color-border-strong:  var(--color-gray-600);

    --color-text-primary:   var(--color-gray-100);
    --color-text-secondary: var(--color-gray-400);
    --color-text-muted:     var(--color-gray-600);

    --color-accent-subtle:  var(--color-brand-900);
    --color-accent-fg:      var(--color-brand-100);

    /* Status: tinted backgrounds + light text in dark mode */
    --color-success-subtle: var(--color-positive-900);
    --color-success-fg:     var(--color-positive-100);
    --color-danger-subtle:  var(--color-negative-900);
    --color-danger-fg:      var(--color-negative-100);
    --color-warning-subtle: var(--color-notice-900);
    --color-warning-fg:     var(--color-notice-100);
    --color-info-subtle:    var(--color-brand-900);
    --color-info-fg:        var(--color-brand-100);

    --accent-9:  var(--color-brand-400);
    --accent-10: var(--color-brand-300);
    --accent-11: var(--color-brand-200);

    --gray-1:  var(--color-gray-900);
    --gray-2:  var(--color-gray-800);
    --gray-3:  var(--color-gray-700);
    --gray-4:  var(--color-gray-700);
    --gray-5:  var(--color-gray-600);
    --gray-6:  var(--color-gray-600);
    --gray-7:  var(--color-gray-500);
    --gray-8:  var(--color-gray-400);
    --gray-9:  var(--color-gray-400);
    --gray-10: var(--color-gray-300);
    --gray-11: var(--color-gray-200);
    --gray-12: var(--color-gray-100);
  }

  /* ── Motion: respect prefers-reduced-motion ── */
  @media (prefers-reduced-motion: reduce) {
    :root {
      --duration-fast: 0ms;
      --duration:      0ms;
      --duration-slow: 0ms;
    }
  }
}
`
  write('src/styles/theme.css', content)
}

// ─── 4. Write brand.md (Claude context) ──────────────────────────────────────

function genBrandMd() {
  const swatchLine = (name: string, scale: ColorScale) => {
    const entries = Object.entries(scaleToObj(scale))
    return `| ${name} | ${entries.map(([k, v]) => `${k}: \`${v}\``).join(' · ')} |`
  }

  const content = `# Brand reference — ${brand.name}

> Auto-generated from brand.config.ts. Do not edit manually.
> Regenerate with: \`pnpm brand:gen\`

## Colour system

| Scale | Stops |
|-------|-------|
${swatchLine('Primary', primary)}
${swatchLine('Secondary', secondary)}
${swatchLine('Gray', gray)}

### Status / feedback colours

Traffic-light set for toasts, alerts, inline validation, and banners. Each
expands to a full 100–900 scale.

| Scale | Stops |
|-------|-------|
${swatchLine('Positive', positive)}
${swatchLine('Negative', negative)}
${swatchLine('Notice', notice)}

Use the semantic aliases, not the raw scales:

| Role | Alias | Tailwind colour | When |
|------|-------|-----------------|------|
| Success | \`--color-success\` | \`positive-*\` | confirmations, positive toasts |
| Error | \`--color-danger\` | \`negative-*\` | errors, destructive actions |
| Warning | \`--color-warning\` | \`notice-*\` | cautions, pending states |
| Info | \`--color-info\` | \`brand-*\` | neutral informational messages |

Pattern: \`*-subtle\` for the background, the base (\`positive-500\`) for the
border/icon, \`*-fg\` for text on a filled status surface. All four flip
automatically in dark mode.

- **Primary 500** (default brand colour): \`${brand.colors.primary}\`
- **Primary 400** — hover states, lighter emphasis
- **Primary 600** — pressed states, darker emphasis
- **Primary 100** — subtle backgrounds, highlights
- **Primary 900** — text on light primary backgrounds
- **Gray 100–300** — surfaces, borders, dividers
- **Gray 500–600** — secondary text, icons
- **Gray 800–900** — primary text

## Typography

- **Sans**: ${brand.typography.sans.join(', ')}
${brand.typography.serif ? `- **Serif** (editorial): ${brand.typography.serif.join(', ')}` : ''}
${brand.typography.mono ? `- **Mono**: ${brand.typography.mono.join(', ')}` : ''}
- **Type scale feel**: ${brand.typography.scale}
- **Sizes**: \`text-xs\` → \`text-5xl\` with line-heights tuned to the *${brand.typography.scale}* feel — use these utilities, never hardcoded \`font-size\`

## Spatial system

- **Radius**: ${brand.radius} (${RADIUS_PX[brand.radius]}) — applies to cards, inputs, buttons, modals
- **Spacing**: ${brand.spacing} (${SPACING_SCALE[brand.spacing]}× multiplier)
- **Shadow style**: ${brand.shadow}
- **Motion**: ${brand.motion} — duration: ${MOTION_TOKENS[brand.motion].duration}, easing: ${MOTION_TOKENS[brand.motion].easing}

## Tone of voice

**Personality**: ${brand.tov.personality}

- **Formality**: ${brand.tov.formality}
- **Sentence length**: ${brand.tov.sentenceLength}
- **Avoid**: ${brand.tov.avoid.join(', ')}

### Copy examples

| Context | Write this |
|---------|-----------|
${Object.entries(brand.tov.examples)
  .filter(([, v]) => v)
  .map(([k, v]) => `| ${k} | "${v}" |`)
  .join('\n')}

## Rules for Claude

When generating UI copy for this project:
1. Match the **${brand.tov.formality}** formality level
2. Keep sentences **${brand.tov.sentenceLength}**
3. Never use: ${brand.tov.avoid.map(a => `"${a}"`).join(', ')}
4. Use the copy examples above as calibration — match their register exactly

When generating components:
1. Always use \`brand-*\` Tailwind colour classes, never hardcoded hex
2. Border radius should use \`rounded\` (= ${RADIUS_PX[brand.radius]}) unless explicitly varied
3. Transitions should use \`duration-[${MOTION_TOKENS[brand.motion].duration}]\` and \`ease-[var(--easing)]\`
4. Shadows: use \`shadow\` utility (maps to ${brand.shadow} shadow style)
5. Gray tones use the tinted \`gray-*\` scale — never use Tailwind's default neutral grays
6. For toasts, alerts, and validation use the status aliases (\`--color-success\`, \`--color-danger\`, \`--color-warning\`, \`--color-info\`) or the \`positive-*\` / \`negative-*\` / \`notice-*\` scales — never raw red/green/amber hex
7. Type sizes use the \`text-*\` utilities — never hardcoded \`font-size\`
8. Use Phosphor Icons (\`@phosphor-icons/react\`) for all icons unless the user specifies otherwise
`
  write('.claude/context/brand.md', content)
}

// ─── Run ──────────────────────────────────────────────────────────────────────

console.log(`\nGenerating tokens for: ${brand.name}\n`)
genTailwind()
genThemeCss()
genBrandMd()
console.log('\nDone. Re-run after any change to brand.config.ts\n')
