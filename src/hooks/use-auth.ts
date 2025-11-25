"use client"

import { useState, useEffect, useRef } from "react"
import { me, logout } from "@/src/services/auth"

export type UserRole = "student" | "teacher" | "coordinator" | "admin"
export type RouteRole = "aluno" | "professor" | "coordenador" | "administrador"

export interface AuthState {
  user: { id: string; name: string; email: string; roles: string[] } | null
  isLoading: boolean
  isAuthenticated: boolean
  userRole: UserRole | null
  routeRole: RouteRole | null
}

/**
 * Mapeia role do backend para role do frontend
 */
function mapBackendRoleToUserRole(roles: string[]): UserRole | null {
  if (roles.includes("admin")) return "admin"
  if (roles.includes("teacher")) return "teacher"
  if (roles.includes("coordinator")) return "coordinator"
  if (roles.includes("student")) return "student"
  return null
}

/**
 * Mapeia role do usuário para rota do frontend
 */
export function mapUserRoleToRoute(role: UserRole | null): RouteRole | null {
  if (role === "admin") return "administrador"
  if (role === "teacher") return "professor"
  if (role === "coordinator") return "coordenador"
  if (role === "student") return "aluno"
  return null
}

/**
 * Mapeia rota do frontend para role do usuário
 */
export function mapRouteToUserRole(route: string): UserRole | null {
  if (route.startsWith("/administrador")) return "admin"
  if (route.startsWith("/professor")) return "teacher"
  if (route.startsWith("/coordenador")) return "coordinator"
  if (route.startsWith("/aluno")) return "student"
  return null
}

/**
 * Hook para gerenciar autenticação e verificar roles
 */
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    userRole: null,
    routeRole: null,
  })
  const hasChecked = useRef(false)

  useEffect(() => {
    // Evitar verificações múltiplas durante navegação
    if (hasChecked.current) {
      return
    }

    async function checkAuth() {
      // Verificar se há token no localStorage
      if (typeof window === "undefined") {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          userRole: null,
          routeRole: null,
        })
        return
      }

      const token = localStorage.getItem("ava:token")
      if (!token) {
        hasChecked.current = true
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          userRole: null,
          routeRole: null,
        })
        return
      }

      try {
        // Verificar autenticação via API
        const user = await me()
        const userRole = mapBackendRoleToUserRole(user.roles || [])
        const routeRole = mapUserRoleToRoute(userRole)

        hasChecked.current = true
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
          userRole,
          routeRole,
        })

        // Atualizar localStorage com role atualizada
        if (routeRole) {
          localStorage.setItem("ava:userRole", routeRole)
        }
      } catch (error) {
        // Token inválido ou expirado
        hasChecked.current = true
        logout()
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          userRole: null,
          routeRole: null,
        })
      }
    }

    checkAuth()
  }, [])

  const handleLogout = () => {
    logout()
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      userRole: null,
      routeRole: null,
    })
    if (typeof window !== "undefined") {
      window.location.href = "/"
    }
  }

  return {
    ...authState,
    logout: handleLogout,
    refetch: async () => {
      setAuthState((prev) => ({ ...prev, isLoading: true }))
      const token = localStorage.getItem("ava:token")
      if (!token) {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          userRole: null,
          routeRole: null,
        })
        return
      }

      try {
        const user = await me()
        const userRole = mapBackendRoleToUserRole(user.roles || [])
        const routeRole = mapUserRoleToRoute(userRole)

        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
          userRole,
          routeRole,
        })

        if (routeRole) {
          localStorage.setItem("ava:userRole", routeRole)
        }
      } catch (error) {
        logout()
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          userRole: null,
          routeRole: null,
        })
      }
    },
  }
}

