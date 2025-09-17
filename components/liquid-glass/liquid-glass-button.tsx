"use client"

import { useTheme } from "next-themes"
import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ComponentProps } from "react"
import { getDisplacementFilter } from "./liquid-glass-utils"
import { LIQUID_GLASS_PRESETS, LIQUID_GLASS_RADIUS, LIQUID_GLASS_DEFAULT_INTENSITY, type LiquidGlassIntensity } from "./config"

interface LiquidGlassButtonProps extends ComponentProps<typeof Button> {
  intensity?: LiquidGlassIntensity
}

export function LiquidGlassButton({ children, className, intensity = LIQUID_GLASS_DEFAULT_INTENSITY, ...props }: LiquidGlassButtonProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const ref = useRef<HTMLButtonElement | null>(null)
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

  const preset = LIQUID_GLASS_PRESETS.button[intensity]
  const radiusPx = LIQUID_GLASS_RADIUS.button
  const blur = preset.blur
  const depth = preset.depth
  const chroma = preset.chroma
  const border = intensity === "low" ? "border-white/20 bg-white/10" : intensity === "high" ? "border-white/40 bg-white/20" : "border-white/30 bg-white/15"

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
  }, [size.width, size.height, depth, chroma, isPressed])

  if (!mounted || theme !== "liquid-glass") {
    return (
      <Button className={className} {...props}>
        {children}
      </Button>
    )
  }

  return (
    <Button
      ref={ref}
      className={cn(
        "border transition-all duration-300 text-white px-4 md:px-5",
        `backdrop-blur ${border}`,
        "hover:scale-105 hover:shadow-lg",
        "active:scale-95",
        className,
      )}
      style={{
        borderRadius: radiusPx,
        boxShadow: "inset 0 0 4px rgba(255,255,255,0.18), 0 8px 20px rgba(0,0,0,0.25)",
        backdropFilter: filterUrl
          ? `blur(${blur / 2}px) url('${filterUrl}') blur(${blur}px) brightness(1.1) saturate(1.5)`
          : undefined,
        WebkitBackdropFilter: filterUrl
          ? `blur(${blur / 2}px) url('${filterUrl}') blur(${blur}px) brightness(1.1) saturate(1.5)`
          : undefined,
      }}
      onPointerDown={() => setIsPressed(true)}
      onPointerUp={() => setIsPressed(false)}
      onPointerCancel={() => setIsPressed(false)}
      onPointerLeave={() => setIsPressed(false)}
      {...props}
    >
      {children}
    </Button>
  )
}
