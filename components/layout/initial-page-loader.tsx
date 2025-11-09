"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { PageLoading } from "./page-loading"

export function InitialPageLoader({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsMounted(true)
    
    // Remove o loading inline criado pelo script quando React estiver pronto
    const removeInlineLoading = () => {
      const inlineLoading = document.getElementById("initial-loading")
      if (inlineLoading) {
        inlineLoading.style.opacity = "0"
        inlineLoading.style.transition = "opacity 0.3s ease-out"
        setTimeout(() => {
          inlineLoading.remove()
        }, 300)
      }
    }

    // Remove imediatamente quando React monta (já está carregado)
    removeInlineLoading()
    
    // Fallback: remove após um tempo mesmo se não encontrou
    const timeout = setTimeout(removeInlineLoading, 500)

    return () => clearTimeout(timeout)
  }, [])

  // Não mostra loading na página inicial (login)
  if (pathname === "/" || pathname === null) {
    return <>{children}</>
  }

  // Durante SSR ou antes de montar, renderiza children normalmente
  // O loading inline do script já está sendo mostrado
  if (!isMounted) {
    return <>{children}</>
  }

  return <>{children}</>
}

