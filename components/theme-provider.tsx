"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)
  const [backgroundUrl, setBackgroundUrl] = React.useState<string | null>(null)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (typeof window === "undefined") return
    const role = window.localStorage.getItem("ava:userRole") || "guest"
    const url = window.localStorage.getItem(`ava:bg:${role}`)
    setBackgroundUrl(url)
  }, [])

  React.useEffect(() => {
    if (!mounted) return
    const root = document.documentElement
    if (root.classList.contains("liquid-glass")) {
      if (backgroundUrl) {
        document.body.style.backgroundImage = `url('${backgroundUrl}')`
        document.body.style.backgroundSize = "cover"
        document.body.style.backgroundRepeat = "no-repeat"
        document.body.style.backgroundPosition = "center"
      }
    } else {
      document.body.style.backgroundImage = ""
    }
  }, [mounted, backgroundUrl])

  if (!mounted) {
    return <>{children}</>
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
