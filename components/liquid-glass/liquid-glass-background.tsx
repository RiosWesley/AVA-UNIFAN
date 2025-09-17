"use client"

import { useTheme } from "next-themes"
import { useEffect, useMemo, useRef, useState } from "react"
import { getDisplacementFilter } from "./liquid-glass-utils"
import { LIQUID_GLASS_PRESETS } from "./config"

export function LiquidGlassBackground() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)
  const [size, setSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 })

  useEffect(() => {
    setMounted(true)
  }, [])

  const isLiquidGlass = mounted && theme === "liquid-glass"

  useEffect(() => {
    if (!ref.current) return
    const el = ref.current
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect
        setSize({ width: Math.max(1, cr.width), height: Math.max(1, cr.height) })
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [mounted])

  const filterUrl = useMemo(() => {
    if (size.width === 0 || size.height === 0) return undefined
    const cfg = LIQUID_GLASS_PRESETS.background
    return getDisplacementFilter({
      width: Math.round(size.width),
      height: Math.round(size.height),
      radius: cfg.radius,
      depth: cfg.depth,
      strength: cfg.strength,
      chromaticAberration: cfg.chroma,
    })
  }, [size.width, size.height])

  if (!mounted || !isLiquidGlass) {
    return null
  }

  return (
    <div ref={ref} className="fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("https://4kwallpapers.com/images/wallpapers/chika-fujiwara-3840x2160-16148.jpg")',
        }}
      />

      {/* Overlay escuro removido conforme solicitado */}

      <div
        className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse"
        style={{ animationDuration: "8s", animationDelay: "0s" }}
      />
      <div
        className="absolute top-3/4 right-1/4 w-48 h-48 bg-green-400/10 rounded-full blur-2xl animate-pulse"
        style={{ animationDuration: "12s", animationDelay: "3s" }}
      />
      <div
        className="absolute bottom-1/4 left-1/3 w-32 h-32 bg-blue-400/8 rounded-full blur-xl animate-pulse"
        style={{ animationDuration: "10s", animationDelay: "6s" }}
      />

      <div className="absolute inset-0 opacity-5" style={{
        backdropFilter: filterUrl ? `url('${filterUrl}')` : undefined,
        WebkitBackdropFilter: filterUrl ? `url('${filterUrl}')` : undefined,
      }}>
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
                 linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                 linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
               `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>
    </div>
  )
}
