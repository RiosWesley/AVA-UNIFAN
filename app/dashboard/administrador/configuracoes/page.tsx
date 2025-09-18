"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Sidebar } from "@/components/layout/sidebar"
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
    const url = window.localStorage.getItem(`ava:bg:administrador`) || ""
    setBgUrlInput(url)
  }, [])

  function saveBgUrl() {
    try {
      if (bgUrlInput.trim()) {
        window.localStorage.setItem(`ava:bg:administrador`, bgUrlInput.trim())
      } else {
        window.localStorage.removeItem(`ava:bg:administrador`)
      }
      alert("Imagem de fundo salva para o modo Liquid Glass.")
    } catch {}
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

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notificações
                </CardTitle>
                <CardDescription>Configure como você deseja receber notificações</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">Notificações por Email</p>
                    <p className="text-sm text-muted-foreground">Relatórios do sistema e alertas críticos</p>
                  </div>
                  <Switch
                    checked={notificacoes.email}
                    onCheckedChange={(checked) => setNotificacoes({ ...notificacoes, email: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">Notificações Push</p>
                    <p className="text-sm text-muted-foreground">Alertas em tempo real sobre o sistema</p>
                  </div>
                  <Switch
                    checked={notificacoes.push}
                    onCheckedChange={(checked) => setNotificacoes({ ...notificacoes, push: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">Notificações por SMS</p>
                    <p className="text-sm text-muted-foreground">Emergências e falhas críticas</p>
                  </div>
                  <Switch
                    checked={notificacoes.sms}
                    onCheckedChange={(checked) => setNotificacoes({ ...notificacoes, sms: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Aparência
                </CardTitle>
                <CardDescription>Personalize a aparência do sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Imagem de Fundo (modo Liquid Glass)</Label>
                  <Input 
                    value={bgUrlInput} 
                    onChange={(e) => setBgUrlInput(e.target.value)} 
                    placeholder="https://exemplo.com/imagem.jpg" 
                  />
                  <p className="text-xs text-muted-foreground">Usada somente quando o tema Liquid Glass estiver ativo.</p>
                  <Button onClick={saveBgUrl} className="bg-primary hover:bg-primary/90">
                    Salvar imagem de fundo
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Preferências Administrativas
                </CardTitle>
                <CardDescription>Configure suas preferências de administração</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Frequência de Backup Automático</Label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Diário</option>
                    <option>Semanal</option>
                    <option>Mensal</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Retenção de Logs (dias)</Label>
                  <Input type="number" defaultValue="90" />
                </div>
                <div className="space-y-2">
                  <Label>Timeout de Sessão (minutos)</Label>
                  <Input type="number" defaultValue="30" />
                </div>
                <Button className="bg-primary hover:bg-primary/90">Salvar Preferências</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
