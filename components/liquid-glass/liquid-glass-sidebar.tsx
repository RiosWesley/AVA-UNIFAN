"use client"

import type React from "react"

import { useTheme } from "next-themes"
import { useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { getDisplacementFilter } from "./liquid-glass-utils"
import { LIQUID_GLASS_PRESETS, LIQUID_GLASS_RADIUS } from "./config"

interface LiquidGlassSidebarProps {
  children: React.ReactNode
  className?: string
}

export function LiquidGlassSidebar({ children, className }: LiquidGlassSidebarProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)
  const [size, setSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 })
  const [isPressed, setIsPressed] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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

  const radiusPx = LIQUID_GLASS_RADIUS.sidebar
  const preset = LIQUID_GLASS_PRESETS.sidebar.high
  const blur = preset.blur
  const depth = preset.depth
  const chroma = preset.chroma

  const filterUrl = useMemo(() => {
    if (size.width === 0 || size.height === 0) return undefined
    const pressedDepth = isPressed ? depth / 0.7 : depth
    return getDisplacementFilter({
      width: Math.round(size.width),
      height: Math.round(size.height),
      radius: radiusPx,
      depth: pressedDepth,
      strength: preset.strength,
      chromaticAberration: chroma,
    })
  }, [size.width, size.height, isPressed])

  if (!mounted || theme !== "liquid-glass") {
    return <div className={cn("bg-sidebar border-r border-sidebar-border", className)}>{children}</div>
  }

  return (
    <div
      ref={ref}
      className={cn("bg-white/5 border-r border-white/10", "transition-all duration-300", className)}
      style={{
        borderTopRightRadius: radiusPx,
        borderBottomRightRadius: radiusPx,
        boxShadow: "inset 1px 0 2px rgba(255,255,255,0.15), 8px 0 24px rgba(0,0,0,0.2)",
        backdropFilter: filterUrl
          ? `blur(${blur / 2}px) url('${filterUrl}') blur(${blur}px) brightness(1.05) saturate(1.3)`
          : undefined,
        WebkitBackdropFilter: filterUrl
          ? `blur(${blur / 2}px) url('${filterUrl}') blur(${blur}px) brightness(1.05) saturate(1.3)`
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
