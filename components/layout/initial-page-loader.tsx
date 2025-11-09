"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export function InitialPageLoader({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Não mostra loading na página inicial (login)
  if (pathname === "/" || pathname === null) {
    return <>{children}</>
  }

  // Durante SSR ou antes de montar, renderiza children normalmente
  // O loading inline já está sendo mostrado
  if (!isMounted) {
    return <>{children}</>
  }

  return <>{children}</>
}

