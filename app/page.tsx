"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, Settings, BarChart3 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { login } from "@/src/services/auth"
import { toastError } from "@/components/ui/toast"
import { PageSpinner } from "@/components/ui/page-spinner"

export default function AuthPage() {
  const [isLiquidGlass, setIsLiquidGlass] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkTheme = () => {
      setIsLiquidGlass(document.documentElement.classList.contains("liquid-glass"))
    }

    checkTheme()

    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    })

    return () => observer.disconnect()
  }, [])

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  function mapRoleToRoute(roles: string[]): "administrador" | "professor" | "aluno" | "coordenador" {
    const has = (r: string) => roles.includes(r)
    if (has("admin")) return "administrador"
    if (has("teacher")) return "professor"
    if (has("coordinator")) return "coordenador"
    return "aluno"
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const { access_token, user } = await login(loginData.email, loginData.password)
      localStorage.setItem("ava:token", access_token)
      localStorage.setItem("ava:userId", user.id)
      const route = mapRoleToRoute(user.roles || [])
      localStorage.setItem("ava:userRole", route)
      // Manter loading até redirecionamento
      router.push(`/${route}`)
    } catch {
      setIsLoading(false)
      toastError("Credenciais inválidas", "Verifique seu e-mail e senha e tente novamente")
    }
  }

  // Mostrar loading durante autenticação
  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${
        isLiquidGlass ? 'bg-black/90' : 'bg-gray-50 dark:bg-gray-900'
      }`}>
        <PageSpinner />
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      isLiquidGlass ? 'bg-black/90' : 'bg-gray-50 dark:bg-gray-900'
    }`}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">AVA</h1>
          <p className="text-muted-foreground">Ambiente Virtual de Aprendizagem</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo de volta</CardTitle>
            <CardDescription>Entre com suas credenciais para acessar o sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail/Usuário</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
              <div className="text-center">
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  Esqueci minha senha
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
