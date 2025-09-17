"use client"

import type React from "react"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface LiquidGlassSidebarProps {
  children: React.ReactNode
  className?: string
}

export function LiquidGlassSidebar({ children, className }: LiquidGlassSidebarProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || theme !== "liquid-glass") {
    return <div className={cn("bg-sidebar border-r border-sidebar-border", className)}>{children}</div>
  }

  return (
    <div
      className={cn("backdrop-blur-xl bg-white/5 border-r border-white/10", "transition-all duration-300", className)}
      style={{
        boxShadow: "inset 1px 0 0 0 rgba(255, 255, 255, 0.1), 1px 0 3px 0 rgba(0, 0, 0, 0.1)",
      }}
    >
      {children}
    </div>
  )
}
