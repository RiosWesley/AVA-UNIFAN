"use client"

import { usePathname } from "next/navigation"
import { Sidebar } from "./sidebar"
import { PageSpinner } from "@/components/ui/page-spinner"

export function PageLoading() {
  const pathname = usePathname()
  
  // Detecta a role baseado na rota
  const getRoleFromPath = (): "aluno" | "professor" | "coordenador" | "administrador" => {
    if (pathname?.startsWith("/aluno")) return "aluno"
    if (pathname?.startsWith("/professor")) return "professor"
    if (pathname?.startsWith("/coordenador")) return "coordenador"
    if (pathname?.startsWith("/administrador")) return "administrador"
    return "aluno" // fallback
  }

  const userRole = getRoleFromPath()

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole={userRole} />
      <main className="flex-1 overflow-y-auto">
        <PageSpinner />
      </main>
    </div>
  )
}

