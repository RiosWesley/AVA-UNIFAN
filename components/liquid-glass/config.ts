export type LiquidGlassIntensity = "low" | "medium" | "high"

export const LIQUID_GLASS_DEFAULT_INTENSITY: LiquidGlassIntensity = "low"

export const LIQUID_GLASS_RADIUS = {
  card: 12,
  button: 10,
  sidebar: 16,
} as const

export const LIQUID_GLASS_PRESETS = {
  card: {
    low: { blur: 4, depth: 6, chroma: 5, strength: 90 },
    medium: { blur: 8, depth: 10, chroma: 5, strength: 90 },
    high: { blur: 12, depth: 14, chroma: 6, strength: 90 },
  },
  button: {
    low: { blur: 3, depth: 5, chroma: 1, strength: 85 },
    medium: { blur: 6, depth: 8, chroma: 3, strength: 85 },
    high: { blur: 9, depth: 12, chroma: 5, strength: 85 },
  },
  sidebar: {
    // Sidebar não usa intensidade variável por ora, mas mantemos formato
    low: { blur: 8, depth: 10, chroma: 3, strength: 95 },
    medium: { blur: 12, depth: 14, chroma: 4, strength: 95 },
    high: { blur: 16, depth: 18, chroma: 6, strength: 95 },
  },
  background: {
    radius: 40,
    depth: 12,
    strength: 70,
    chroma: 2,
  },
} as const


