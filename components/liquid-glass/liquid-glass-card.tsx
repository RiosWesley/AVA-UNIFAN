"use client"

import type React from "react"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface LiquidGlassCardProps {
  children: React.ReactNode
  className?: string
  intensity?: "low" | "medium" | "high"
}

export function LiquidGlassCard({ children, className, intensity = "medium" }: LiquidGlassCardProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isLiquidGlass = mounted && theme === "liquid-glass"

  if (!mounted) {
    return <div className={cn("bg-card border border-border rounded-lg", className)}>{children}</div>
  }

  if (!isLiquidGlass) {
    return <div className={cn("bg-card border border-border rounded-lg", className)}>{children}</div>
  }

  const intensityClasses = {
    low: "backdrop-blur-sm bg-white/10 border-white/20",
    medium: "backdrop-blur-md bg-white/15 border-white/30",
    high: "backdrop-blur-lg bg-white/20 border-white/40",
  }

  return (
    <div
      className={cn(
        "rounded-lg border shadow-lg transition-all duration-300",
        "hover:bg-white/20 hover:border-white/40",
        intensityClasses[intensity],
        className,
      )}
      style={{
        boxShadow:
          "inset 0 1px 0 0 rgba(255, 255, 255, 0.1), 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
      }}
    >
      {children}
    </div>
  )
}
