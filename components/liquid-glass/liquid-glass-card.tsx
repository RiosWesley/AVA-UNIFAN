"use client"

import type React from "react"

import { useTheme } from "next-themes"
import { useEffect, useMemo, useRef, useState, useCallback } from "react"
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

  // Debounce para atualizações de size (evita spam em resizes)
  const debouncedSetSize = useCallback((newSize: { width: number; height: number }) => {
    const timeoutId = setTimeout(() => {
      setSize(newSize)
    }, 200) // 200ms - bom equilíbrio
    return () => clearTimeout(timeoutId)
  }, [])

  useEffect(() => {
    if (!containerRef.current) return
    const el = containerRef.current
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect
        const newSize = { width: Math.max(1, cr.width), height: Math.max(1, cr.height) }
        debouncedSetSize(newSize)
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [debouncedSetSize, mounted])

  const preset = LIQUID_GLASS_PRESETS.card[intensity]
  const radiusPx = LIQUID_GLASS_RADIUS.card
  const blur = preset.blur * 0.8 // Manter redução leve no blur para perf (ajuste em config)
  const depth = preset.depth
  const chroma = preset.chroma
  const border = intensity === "low" ? "border-white/20 bg-white/10" : intensity === "high" ? "border-white/40 bg-white/20" : "border-white/30 bg-white/15"

  // Gera filtros em RESOLUÇÃO FULL (para alinhar com o container e manter distorção nas bordas)
  const generateFilterUrl = useMemo(() => {
    if (!isLiquidGlass || size.width === 0 || size.height === 0) return undefined
    const fullWidth = Math.round(size.width)
    const fullHeight = Math.round(size.height)
    const normalDepth = depth
    const pressedDepth = depth / 0.7

    // Cache: dois filtros por size (normal e pressed)
    const normalFilter = getDisplacementFilter({
      width: fullWidth,
      height: fullHeight,
      radius: radiusPx,
      depth: normalDepth,
      strength: preset.strength,
      chromaticAberration: chroma,
      optimizeForPerf: true,
    })
    const pressedFilter = getDisplacementFilter({
      width: fullWidth,
      height: fullHeight,
      radius: radiusPx,
      depth: pressedDepth,
      strength: preset.strength,
      chromaticAberration: chroma,
      optimizeForPerf: true,
    })

    return { normal: normalFilter, pressed: pressedFilter }
  }, [isLiquidGlass, size.width, size.height, depth, chroma, preset.strength, radiusPx])

  // Seleciona filtro atual (sem recriar SVG)
  const currentFilterUrl = useMemo(() => {
    if (!generateFilterUrl) return undefined
    return isPressed ? generateFilterUrl.pressed : generateFilterUrl.normal
  }, [generateFilterUrl, isPressed])

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
      data-lg-card
      style={{
        borderRadius: radiusPx,
        boxShadow:
          "inset 0 0 4px rgba(255,255,255,0.2), 0 10px 30px rgba(0,0,0,0.25)",
        backdropFilter: currentFilterUrl
          ? `blur(${blur / 2}px) url('${currentFilterUrl}') blur(${blur}px) brightness(1.1) saturate(1.4)`
          : undefined,
        WebkitBackdropFilter: currentFilterUrl
          ? `blur(${blur / 2}px) url('${currentFilterUrl}') blur(${blur}px) brightness(1.1) saturate(1.4)`
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