"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function LiquidGlassBackground() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isLiquidGlass = mounted && theme === "liquid-glass"

  if (!mounted || !isLiquidGlass) {
    return null
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("https://4kwallpapers.com/images/wallpapers/ghost-of-yotei-5184x2160-19074.jpg")',
        }}
      />

      <div className="absolute inset-0 bg-black/40" />

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

      <div className="absolute inset-0 opacity-5">
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
