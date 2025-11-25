"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth, mapUserRoleToRoute, UserRole } from "@/src/hooks/use-auth"
import { PageSpinner } from "@/components/ui/page-spinner"

interface RouteGuardProps {
  children: React.ReactNode
  requiredRole: UserRole
  redirectTo?: string
}

/**
 * Componente que protege rotas verificando autenticação e role
 */
export function RouteGuard({ children, requiredRole }: RouteGuardProps) {
  const { isAuthenticated, isLoading, userRole } = useAuth()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const hasRedirected = useRef(false)

  useEffect(() => {
    // Aguardar verificação de autenticação
    if (isLoading) {
      setIsAuthorized(null)
      return
    }

    // Verificar autenticação e role
    const authorized = isAuthenticated && userRole === requiredRole

    if (!authorized && !hasRedirected.current) {
      hasRedirected.current = true
      
      // Usar requestAnimationFrame para garantir que o DOM está pronto
      requestAnimationFrame(() => {
        if (!isAuthenticated || !userRole) {
          router.replace("/")
        } else if (userRole !== requiredRole) {
          const correctRoute = mapUserRoleToRoute(userRole)
          if (correctRoute) {
            router.replace(`/${correctRoute}`)
          } else {
            router.replace("/")
          }
        }
      })
      return
    }

    setIsAuthorized(authorized)
  }, [isLoading, isAuthenticated, userRole, requiredRole, router])

  // Mostrar loading durante verificação inicial ou enquanto redireciona
  if (isLoading || isAuthorized === null || !isAuthorized) {
    return (
      <div className="flex h-screen bg-background">
        <PageSpinner />
      </div>
    )
  }

  // Renderizar conteúdo se autenticado e com role correta
  return <>{children}</>
}

