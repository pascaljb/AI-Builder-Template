# Skill: figma-extract-brand

## When to trigger

Fire automatically when ANY of these occur in a session:
- A Figma URL is pasted (`figma.com/file/`, `figma.com/design/`)
- User says "use this design", "reference this figma", "build from this"
- A Figma node/screenshot is shared and the user asks to build from it
- This is the first Figma reference in a session where `brand.config.ts`
  does not yet exist or has not yet been written this session

Do NOT trigger if brand.config.ts already exists and was extracted this session.
Do trigger again if the user says "re-extract" or shares a different file.

---

## What to do

### Step 1 — Fetch from Figma MCP

Call both tools in sequence:

```
Figma:get_variable_defs(nodeId)   ← design tokens if the file uses variables
Figma:get_design_context(nodeId)  ← computed styles on the node tree
```

If the URL is a file root, use the first frame/page as the node.
If it's a specific frame, use that node directly — it's the most signal-dense.

### Step 2 — Extract visual tokens

From `get_variable_defs` (preferred — exact values):
- Find collections named like "Color", "Primitive", "Brand", "Palette"
- Identify the primary brand colour: the most-used non-neutral, non-semantic hue
  across interactive components (buttons, links, active states)
- Identify neutral/gray colours: desaturated values used for text, borders, surfaces
- Note if a secondary/accent colour exists at significant frequency

From `get_design_context` (fallback — computed styles):
- Sample `fills` across all Button, CTA, and interactive components
- The dominant saturated hue = primary 500
- Sample `cornerRadius` across Cards, Modals, Inputs, Buttons
  → median value maps to: 0=none, 1-3=sm, 4-8=md, 9-16=lg, >16=full
- Sample `effects` (shadows): 
  → no shadows = none
  → large blur, low opacity = soft
  → small blur or offset-only = crisp  
  → multiple layered effects = elevated
- Sample `itemSpacing` and padding across layout frames:
  → tight clusters (8-12px base) = compact
  → medium (16-20px base) = comfortable
  → generous (24px+) = spacious

### Step 3 — Infer spatial tokens

Map sampled values to the token vocabulary:

```
cornerRadius median → radius:
  0px        → 'none'
  1–4px      → 'sm'
  5–10px     → 'md'
  11–20px    → 'lg'
  >20px      → 'full'

shadow style → shadow:
  none found                    → 'none'
  blur > 16, opacity < 0.12     → 'soft'
  blur < 8, or x/y offset ≥ 2  → 'crisp'
  2+ shadow layers              → 'elevated'

spacing median → spacing:
  base unit < 14px  → 'compact'
  14–20px           → 'comfortable'
  > 20px            → 'spacious'
```

Motion cannot be extracted from static Figma files. Default to 'smooth'
unless the design has an explicit prototype with transitions defined —
in that case, read the transition duration and map it:
  < 100ms  → 'minimal'
  100-250ms → 'smooth'
  > 250ms  → 'expressive'
  spring/bounce easing → 'expressive'

### Step 4 — Infer tone of voice

TOV signals from the design itself:

**From copy found in the design:**
- Read all visible text strings in the node tree
- Analyse: sentence length, use of punctuation, formality of word choice,
  presence of "!" or "?", contractions, technical vs plain language
- Map to formality: formal / conversational / casual

**From visual language:**
- Illustration/icons present and expressive → casual, warm personality
- Pure type + geometric → formal, minimal personality
- Photography, human imagery → warmer, more personal
- Dense information tables → functional, precision-focused

**From naming conventions in the file:**
- Component names like "btn-destructive", "alert-danger" → functional/precise
- Names like "Card — Warm", "Hero — Friendly" → expressive/warm

Construct a one-sentence personality description synthesising these signals.
Keep it specific to what you actually saw — do not default to generic presets.

### Step 5 — Write brand.config.ts

Write the file with extracted values. Be explicit about what was directly
observed vs inferred:

```ts
// brand.config.ts
// Extracted from Figma: [file name / URL]
// Extraction date: [date]
//
// Directly observed:  primary color, radius, shadow style, spacing
// Inferred:           motion (static file), TOV personality
// Assumed defaults:   gray tint strength (12), secondary hue shift (60°)

const brand: BrandConfig = {
  name: '[project name from Figma file name]',

  colors: {
    primary: '[extracted hex]',
    // secondary: '[if found]',
    grayTintStrength: 12,
  },

  typography: {
    sans: ['[font name from design]', 'sans-serif'],
    // serif / mono if found in design
    scale: '[tight|default|loose based on type scale ratio]',
  },

  radius:  '[extracted]',
  spacing: '[extracted]',
  shadow:  '[extracted]',
  motion:  '[extracted or default smooth]',

  tov: {
    personality: '[synthesised from copy + visual language]',
    formality:   '[extracted from copy analysis]',
    sentenceLength: '[extracted from copy analysis]',
    avoid: [],  // populated if strong signals found
    examples: {
      // populated from actual copy found in design
    },
  },
}
```

Then immediately run (or instruct to run): `pnpm brand:gen`

### Step 6 — Report what was found

After writing the file, show a brief summary:

- Primary colour swatch + hex
- Which values were directly extracted vs inferred
- Any ambiguities or low-confidence extractions (flag these explicitly)
- One sentence on what the design "feels like" — the gestalt

Offer to refine: "I extracted X from 12 button components and Y from
layout spacing. If either looks wrong, tell me and I'll adjust."

---

## Extraction confidence levels

Be explicit in the output about confidence:

**High confidence** (directly read from variables or repeated consistently):
- Primary colour (3+ uses on interactive elements)
- Radius (consistent across component library)
- Font family

**Medium confidence** (sampled from computed styles, some variance):
- Shadow style
- Spacing scale
- Type scale feel

**Low confidence / inferred** (no direct signal):
- Motion (static file)
- TOV personality
- Gray tint strength

Flag low-confidence values with a comment in brand.config.ts so the
developer knows to review them.

## Add to writing skills

Add brand and TOV context to the copywriting and UX writing skills. 

---

## Edge cases

**File uses no variables** — extract entirely from computed styles.
Radius and color will still be high confidence; TOV will be low.

**Multiple brand colours** — identify the primary by frequency on
interactive/CTA components. Note secondaries as comments.

**Dark mode file** — extract from the light mode frame if available.
If dark-only, note this and adjust the gray scale generation accordingly.

**Incomplete design** — if fewer than 3 screens/components are available,
extract what's there and flag everything as low confidence. Ask if a more
complete file exists.

**Design system library file** (no real UI) — extract from component
thumbnails and token definitions. Works well for color + radius.
TOV will be unavailable — note this explicitly.
