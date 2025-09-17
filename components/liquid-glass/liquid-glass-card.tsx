"use client"

import type React from "react"

import { useTheme } from "next-themes"
import { useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { getDisplacementFilter } from "./liquid-glass-utils"
import { LIQUID_GLASS_PRESETS, LIQUID_GLASS_RADIUS, LIQUID_GLASS_DEFAULT_INTENSITY, type LiquidGlassIntensity } from "./config"

interface LiquidGlassCardProps {
  children: React.ReactNode
  className?: string
  intensity?: LiquidGlassIntensity
}

export function LiquidGlassCard({ children, className, intensity = LIQUID_GLASS_DEFAULT_INTENSITY }: LiquidGlassCardProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [size, setSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 })
  const [isPressed, setIsPressed] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isLiquidGlass = mounted && theme === "liquid-glass"

  useEffect(() => {
    if (!containerRef.current) return
    const el = containerRef.current
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect
        setSize({ width: Math.max(1, cr.width), height: Math.max(1, cr.height) })
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [mounted])

  const preset = LIQUID_GLASS_PRESETS.card[intensity]
  const radiusPx = LIQUID_GLASS_RADIUS.card
  const blur = preset.blur
  const depth = preset.depth
  const chroma = preset.chroma
  const border = intensity === "low" ? "border-white/20 bg-white/10" : intensity === "high" ? "border-white/40 bg-white/20" : "border-white/30 bg-white/15"

  const filterUrl = useMemo(() => {
    if (!isLiquidGlass || size.width === 0 || size.height === 0) return undefined
    const pressedDepth = isPressed ? depth / 0.7 : depth
    return getDisplacementFilter({
      width: Math.round(size.width),
      height: Math.round(size.height),
      radius: radiusPx,
      depth: pressedDepth,
      strength: preset.strength,
      chromaticAberration: chroma,
    })
  }, [isLiquidGlass, size.width, size.height, depth, chroma, isPressed])

  if (!mounted || !isLiquidGlass) {
    return <div className={cn("bg-card border border-border rounded-lg p-4 md:p-5 overflow-hidden", className)}>{children}</div>
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "rounded-lg border text-white transition-all duration-300 p-4 md:p-5 overflow-hidden",
        `backdrop-blur-md ${border}`,
        "hover:bg-white/20",
        className,
      )}
      style={{
        borderRadius: radiusPx,
        boxShadow:
          "inset 0 0 4px rgba(255,255,255,0.2), 0 10px 30px rgba(0,0,0,0.25)",
        backdropFilter: filterUrl
          ? `blur(${blur / 2}px) url('${filterUrl}') blur(${blur}px) brightness(1.1) saturate(1.4)`
          : undefined,
        WebkitBackdropFilter: filterUrl
          ? `blur(${blur / 2}px) url('${filterUrl}') blur(${blur}px) brightness(1.1) saturate(1.4)`
          : undefined,
      }}
      onPointerDown={() => setIsPressed(true)}
      onPointerUp={() => setIsPressed(false)}
      onPointerCancel={() => setIsPressed(false)}
      onPointerLeave={() => setIsPressed(false)}
    >
      {children}
    </div>
  )
}
