"use client"

import { useEffect, useState } from "react"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Sidebar } from "@/components/layout/sidebar"
import { LiquidGlassCard, LiquidGlassButton } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { Settings, Bell, Palette, Crown } from "lucide-react"

export default function ConfiguracoesAdministradorPage() {
  const [notificacoes, setNotificacoes] = useState({
    email: true,
    push: true,
    sms: false,
  })

  const [bgUrlInput, setBgUrlInput] = useState("")

  useEffect(() => {
    if (typeof window === "undefined") return
    const url = window.localStorage.getItem("ava:bg:administrador") || ""
    setBgUrlInput(url)
  }, [])

  const saveBgUrl = () => {
    if (typeof window !== "undefined") {
      try {
        if (bgUrlInput.trim()) {
          window.localStorage.setItem("ava:bg:administrador", bgUrlInput.trim())
        } else {
          window.localStorage.removeItem("ava:bg:administrador")
        }
        console.log("Imagem de fundo salva para o modo Liquid Glass.")
      } catch (error) {
        console.error("Erro ao salvar imagem de fundo:", error)
      }
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="administrador" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
              <p className="text-muted-foreground">Personalize sua experiência no AVA</p>
            </div>
          </div>

          <div className="space-y-6">
            <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações Gerais
                </CardTitle>
                <CardDescription>
                  Gerencie suas preferências de interface e comportamento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações por Email</Label>
                    <div className="text-sm text-muted-foreground">
                      Receba atualizações importantes por email
                    </div>
                  </div>
                  <Switch
                    checked={notificacoes.email}
                    onCheckedChange={(checked) =>
                      setNotificacoes(prev => ({ ...prev, email: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações Push</Label>
                    <div className="text-sm text-muted-foreground">
                      Receba notificações instantâneas no navegador
                    </div>
                  </div>
                  <Switch
                    checked={notificacoes.push}
                    onCheckedChange={(checked) =>
                      setNotificacoes(prev => ({ ...prev, push: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações SMS</Label>
                    <div className="text-sm text-muted-foreground">
                      Receba mensagens de texto no celular
                    </div>
                  </div>
                  <Switch
                    checked={notificacoes.sms}
                    onCheckedChange={(checked) =>
                      setNotificacoes(prev => ({ ...prev, sms: checked }))
                    }
                  />
                </div>
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Aparência
                </CardTitle>
                <CardDescription>
                  Personalize a aparência do seu dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bgUrl">URL da Imagem de Fundo (Liquid Glass)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="bgUrl"
                      placeholder="https://exemplo.com/imagem.jpg"
                      value={bgUrlInput}
                      onChange={(e) => setBgUrlInput(e.target.value)}
                    />
                    <LiquidGlassButton onClick={saveBgUrl} intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
                      Salvar
                    </LiquidGlassButton>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Cole a URL de uma imagem para usar como fundo no modo Liquid Glass
                  </div>
                </div>
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Configurações de Administrador
                </CardTitle>
                <CardDescription>
                  Opções avançadas para administradores do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Permissões do Sistema</Label>
                  <div className="text-sm text-muted-foreground">
                    Você tem acesso total ao sistema como administrador
                  </div>
                </div>
              </CardContent>
            </LiquidGlassCard>
          </div>
        </div>
      </main>
    </div>
  )
}