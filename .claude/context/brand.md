# Brand reference — My Project

> Auto-generated from brand.config.ts. Do not edit manually.
> Regenerate with: `pnpm brand:gen`

## Colour system

| Scale | Stops |
|-------|-------|
| Primary | 100: `#f3f6f7` · 200: `#e1ebf0` · 300: `#c1dfeb` · 400: `#88ceed` · 500: `#079edf` · 600: `#0b98d5` · 700: `#0d74a0` · 800: `#0d506d` · 900: `#0c2d3c` |
| Secondary | 100: `#f4f3f7` · 200: `#e5e1f0` · 300: `#cec1eb` · 400: `#a688ed` · 500: `#4807df` · 600: `#480bd5` · 700: `#3a0da0` · 800: `#2a0d6d` · 900: `#1a0c3c` |
| Gray | 100: `#f7f7f7` · 200: `#ededed` · 300: `#dbdbdc` · 400: `#bcbdbe` · 500: `#929596` · 600: `#6f7172` · 700: `#565758` · 800: `#3a3b3b` · 900: `#212121` |

### Status / feedback colours

Traffic-light set for toasts, alerts, inline validation, and banners. Each
expands to a full 100–900 scale.

| Scale | Stops |
|-------|-------|
| Positive | 100: `#f4f6f4` · 200: `#e4ece5` · 300: `#cbe1cd` · 400: `#9fd5a5` · 500: `#36a342` · 600: `#3aa646` · 700: `#307e38` · 800: `#235729` · 900: `#17311a` |
| Negative | 100: `#f6f3f3` · 200: `#eee3e2` · 300: `#e7c7c5` · 400: `#e39591` · 500: `#e43c33` · 600: `#c3261e` · 700: `#92211b` · 800: `#651a16` · 900: `#371210` |
| Notice | 100: `#f7f4f3` · 200: `#f0e4e0` · 300: `#eccbc1` · 400: `#eda087` · 500: `#fb8a65` · 600: `#d63c0a` · 700: `#a1310d` · 800: `#6e240c` · 900: `#3c170b` |

Use the semantic aliases, not the raw scales:

| Role | Alias | Tailwind colour | When |
|------|-------|-----------------|------|
| Success | `--color-success` | `positive-*` | confirmations, positive toasts |
| Error | `--color-danger` | `negative-*` | errors, destructive actions |
| Warning | `--color-warning` | `notice-*` | cautions, pending states |
| Info | `--color-info` | `brand-*` | neutral informational messages |

Pattern: `*-subtle` for the background, the base (`positive-500`) for the
border/icon, `*-fg` for text on a filled status surface. All four flip
automatically in dark mode.

- **Primary 500** (default brand colour): `#079EDF`
- **Primary 400** — hover states, lighter emphasis
- **Primary 600** — pressed states, darker emphasis
- **Primary 100** — subtle backgrounds, highlights
- **Primary 900** — text on light primary backgrounds
- **Gray 100–300** — surfaces, borders, dividers
- **Gray 500–600** — secondary text, icons
- **Gray 800–900** — primary text

## Typography

- **Sans**: Inter, sans-serif
- **Type scale feel**: default

Named text styles — use the utility class (e.g. `text-heading1`), never a hardcoded `font-size`. Each class also sets weight, line-height, and tracking.

| Style | Size | Line height | Weight | Tracking |
|-------|------|-------------|--------|----------|
| `text-heading1` | 22px | 30.5px | 700 | -0.2px |
| `text-heading2` | 19px | normal | 700 | -0.2px |
| `text-heading3` | 17px | normal | 700 | -0.2px |
| `text-body1` | 17px | 24px | 400 | -0.4px |
| `text-body2` | 15px | 21.45px | 400 | 0 |
| `text-body3` | 13.8px | 20px | 400 | 0 |
| `text-caption1` | 13px | 18px | 400 | 0 |
| `text-caption2` | 12.3px | 18.45px | 400 | 0 |

## Spatial system

- **Radius**: md (8px) — applies to cards, inputs, buttons, modals
- **Spacing**: spacious (1.25× multiplier)
- **Shadow style**: soft
- **Motion**: smooth — duration: 200ms, easing: cubic-bezier(0.4, 0, 0.2, 1)

## Tone of voice

**Personality**: Clear and quiet. Says what it needs to, nothing more.

- **Formality**: conversational
- **Sentence length**: short
- **Avoid**: exclamation marks, filler phrases, over-explanation

### Copy examples

| Context | Write this |
|---------|-----------|
| cta | "Get started" |
| emptyState | "Nothing here yet." |
| error | "Something went wrong." |
| placeholder | "Search…" |

## Rules for Claude

When generating UI copy for this project:
1. Match the **conversational** formality level
2. Keep sentences **short**
3. Never use: "exclamation marks", "filler phrases", "over-explanation"
4. Use the copy examples above as calibration — match their register exactly

When generating components:
1. Always use `brand-*` Tailwind colour classes, never hardcoded hex
2. Border radius should use `rounded` (= 8px) unless explicitly varied
3. Transitions should use `duration-[200ms]` and `ease-[var(--easing)]`
4. Shadows: use `shadow` utility (maps to soft shadow style)
5. Gray tones use the tinted `gray-*` scale — never use Tailwind's default neutral grays
6. For toasts, alerts, and validation use the status aliases (`--color-success`, `--color-danger`, `--color-warning`, `--color-info`) or the `positive-*` / `negative-*` / `notice-*` scales — never raw red/green/amber hex
7. Type uses the named styles — `text-heading1`/`-heading2`/`-heading3`, `text-body1`/`-body2`/`-body3`, `text-caption1`/`-caption2` — never hardcoded `font-size`
8. Use Phosphor Icons (`@phosphor-icons/react`) for all icons unless the user specifies otherwise
