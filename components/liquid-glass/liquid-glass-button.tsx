"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ButtonProps } from "@/components/ui/button"

interface LiquidGlassButtonProps extends ButtonProps {
  intensity?: "low" | "medium" | "high"
}

export function LiquidGlassButton({ children, className, intensity = "medium", ...props }: LiquidGlassButtonProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || theme !== "liquid-glass") {
    return (
      <Button className={className} {...props}>
        {children}
      </Button>
    )
  }

  const intensityClasses = {
    low: "backdrop-blur-sm bg-white/10 border-white/20 hover:bg-white/20",
    medium: "backdrop-blur-md bg-white/15 border-white/30 hover:bg-white/25",
    high: "backdrop-blur-lg bg-white/20 border-white/40 hover:bg-white/30",
  }

  return (
    <Button
      className={cn(
        "border transition-all duration-300 text-white",
        "hover:scale-105 hover:shadow-lg",
        "active:scale-95",
        intensityClasses[intensity],
        className,
      )}
      style={{
        boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.1), 0 1px 3px 0 rgba(0, 0, 0, 0.1)",
      }}
      {...props}
    >
      {children}
    </Button>
  )
}
