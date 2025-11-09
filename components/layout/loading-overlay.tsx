"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function LoadingOverlay() {
  const pathname = usePathname()

  useEffect(() => {
    // Remove o loading quando React estiver pronto
    const removeLoading = () => {
      const loading = document.getElementById("initial-loading")
      if (loading) {
        loading.style.opacity = "0"
        loading.style.transition = "opacity 0.3s ease-out"
        setTimeout(() => {
          loading.remove()
        }, 300)
      }
    }

    // Se estiver na página inicial, remove imediatamente
    if (pathname === "/" || pathname === null) {
      removeLoading()
      return
    }

    // Remove quando React monta (página carregada)
    removeLoading()
    
    // Fallback de segurança
    setTimeout(removeLoading, 500)
  }, [pathname])

  return null
}

