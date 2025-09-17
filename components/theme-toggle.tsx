"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Sun, Moon, Droplets } from "lucide-react"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const themes = [
    { name: "light", icon: Sun, label: "Claro" },
    { name: "dark", icon: Moon, label: "Escuro" },
    { name: "liquid-glass", icon: Droplets, label: "Vidro Líquido" },
  ]

  const handleThemeChange = (themeName: string) => {
    setTheme(themeName)
  }

  return (
    <div className="flex items-center space-x-1 p-1 bg-muted rounded-lg">
      {themes.map(({ name, icon: Icon, label }) => (
        <Button
          key={name}
          variant="ghost"
          size="sm"
          onClick={() => handleThemeChange(name)}
          className={cn(
            "h-8 w-8 p-0 transition-all hover:bg-accent/50",
            theme === name && "bg-primary text-primary-foreground shadow-sm",
          )}
          title={label}
        >
          <Icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  )
}
