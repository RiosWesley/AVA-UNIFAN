"use client"

import type React from "react"
import { useTheme } from "next-themes"
import { useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { getDisplacementFilter } from "./liquid-glass-utils"
import { LIQUID_GLASS_PRESETS, LIQUID_GLASS_RADIUS, LIQUID_GLASS_DEFAULT_INTENSITY, type LiquidGlassIntensity } from "./config"

interface LiquidGlassInnerCardProps {
  children: React.ReactNode
  className?: string
  variant?: "discipline" | "bimester"
  intensity?: LiquidGlassIntensity
}

export function LiquidGlassInnerCard({ 
  children, 
  className, 
  variant = "discipline",
  intensity = LIQUID_GLASS_DEFAULT_INTENSITY
}: LiquidGlassInnerCardProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isLiquidGlass, setIsLiquidGlass] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [size, setSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 })
  const [isPressed, setIsPressed] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const checkLiquidGlass = () => {
      const hasLiquidGlassClass = document.documentElement.classList.contains("liquid-glass")
      setIsLiquidGlass(theme === "liquid-glass" || hasLiquidGlassClass)
    }
    
    checkLiquidGlass()
    
    // Observer para mudanças na classe do HTML
    const observer = new MutationObserver(checkLiquidGlass)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    
    return () => observer.disconnect()
  }, [mounted, theme])

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
  
  // Estilos baseados no variant
  const variantStyles = {
    discipline: {
      padding: "p-4",
      border: intensity === "low" ? "border-white/20 bg-white/10" : intensity === "high" ? "border-white/40 bg-white/20" : "border-white/30 bg-white/15"
    },
    bimester: {
      padding: "text-center p-2",
      border: intensity === "low" ? "border-white/15 bg-white/8" : intensity === "high" ? "border-white/30 bg-white/15" : "border-white/20 bg-white/10"
    }
  }

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
  }, [isLiquidGlass, size.width, size.height, depth, chroma, isPressed, preset.strength, radiusPx])

  if (!mounted || !isLiquidGlass) {
    return (
      <div className={cn(
        "border rounded-lg bg-card",
        variantStyles[variant].padding,
        className
      )}>
        {children}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "rounded-lg border text-white transition-all duration-300 overflow-hidden backdrop-blur-md",
        variantStyles[variant].padding,
        variantStyles[variant].border,
        "hover:bg-white/20",
        className
      )}
      data-lg-card
      style={{
        borderRadius: radiusPx,
        boxShadow: "inset 0 0 4px rgba(255,255,255,0.2), 0 10px 30px rgba(0,0,0,0.25)",
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
