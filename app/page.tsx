"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, Settings, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function AuthPage() {
  const [isLiquidGlass, setIsLiquidGlass] = useState(false)

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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock login logic - redirect based on role
    const mockRole = "aluno" // This would come from authentication
    window.location.href = `/dashboard/${mockRole}`
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
                />
              </div>
              <Button type="submit" className="w-full">
                Entrar
              </Button>
              <div className="text-center">
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  Esqueci minha senha
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">Acesso rápido para demonstração:</p>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <Link href="/dashboard/aluno">
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                <Users className="h-4 w-4 mr-2" />
                Aluno
              </Button>
            </Link>
            <Link href="/dashboard/professor">
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                <BookOpen className="h-4 w-4 mr-2" />
                Professor
              </Button>
            </Link>
            <Link href="/dashboard/coordenador">
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                <BarChart3 className="h-4 w-4 mr-2" />
                Coordenador
              </Button>
            </Link>
            <Link href="/dashboard/administrador">
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                <Settings className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
