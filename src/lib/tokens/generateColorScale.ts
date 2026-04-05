// generateColorScale.ts
// Derives a full 100–900 scale from a single 500 hex value.
// Also generates hue-tinted grays from the same primary hue.

export type ColorScale = Record<100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900, string>

// ─── HSL helpers ─────────────────────────────────────────────────────────────

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }

  return [h * 360, s * 100, l * 100]
}

function hslToHex(h: number, s: number, l: number): string {
  h /= 360; s /= 100; l /= 100

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  let r: number, g: number, b: number
  if (s === 0) {
    r = g = b = l
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return (
    '#' +
    [r, g, b]
      .map((x) => Math.round(x * 255).toString(16).padStart(2, '0'))
      .join('')
  )
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

// ─── Scale generation ─────────────────────────────────────────────────────────

const STOPS = [100, 200, 300, 400, 500, 600, 700, 800, 900] as const

// Lightness targets per stop. 500 is anchored to the input colour's actual
// lightness so the brand colour is always preserved exactly.
const LIGHTNESS_MAP: Record<number, number> = {
  100: 96,
  200: 91,
  300: 84,
  400: 73,
  500: -1,   // placeholder — filled from input at runtime
  600: 44,
  700: 34,
  800: 24,
  900: 14,
}

// Saturation multiplier per stop. Lighter stops are more washed out;
// darker stops hold saturation to stay rich rather than muddy.
const SATURATION_CURVE: Record<number, number> = {
  100: 0.20,
  200: 0.35,
  300: 0.55,
  400: 0.78,
  500: 1.00,
  600: 0.96,
  700: 0.90,
  800: 0.84,
  900: 0.72,
}

/**
 * Generate a full 100–900 colour scale from a single 500 hex value.
 *
 * @param hex500  The brand colour at 500 weight, e.g. "#5B4CF5"
 * @param hueShift  Optional hue rotation in degrees (use 60 for secondary)
 */
export function generateColorScale(hex500: string, hueShift = 0): ColorScale {
  const [h, s, l] = hexToHsl(hex500)
  const rotatedH = (h + hueShift + 360) % 360

  LIGHTNESS_MAP[500] = l

  const scale = {} as ColorScale

  for (const stop of STOPS) {
    const targetL = LIGHTNESS_MAP[stop]
    const targetS = clamp(s * SATURATION_CURVE[stop], 0, 100)
    scale[stop] = hslToHex(rotatedH, targetS, targetL)
  }

  return scale
}

/**
 * Generate a hue-tinted neutral gray scale.
 * The primary hue bleeds in subtly — more visible in mid-tones,
 * nearly imperceptible at the extremes.
 *
 * @param primaryHex  The brand 500 colour — hue is extracted from this
 * @param tintStrength  0–100. 12 is a good default. 0 = pure neutral gray.
 */
export function generateGrayScale(primaryHex: string, tintStrength = 12): ColorScale {
  const [h] = hexToHsl(primaryHex)

  const lightnessMap: Record<number, number> = {
    100: 97, 200: 93, 300: 86, 400: 74,
    500: 58, 600: 44, 700: 34, 800: 23, 900: 13,
  }

  const scale = {} as ColorScale

  for (const stop of STOPS) {
    const l = lightnessMap[stop]
    // Tint tapers toward the extremes — 500 gets max tint, 100/900 very little
    const taper = 1 - Math.abs((stop - 500) / 500) * 0.7
    const s = clamp((tintStrength / 100) * 14 * taper, 0, 18)
    scale[stop] = hslToHex(h, s, l)
  }

  return scale
}

/**
 * Convenience: generate all three scales (primary, secondary, gray) at once.
 */
export function generateAllScales(
  primaryHex: string,
  options: {
    secondaryHueShift?: number  // default 60°
    grayTintStrength?: number   // default 12
  } = {}
) {
  const { secondaryHueShift = 60, grayTintStrength = 12 } = options

  return {
    primary:   generateColorScale(primaryHex),
    secondary: generateColorScale(primaryHex, secondaryHueShift),
    gray:      generateGrayScale(primaryHex, grayTintStrength),
  }
}
