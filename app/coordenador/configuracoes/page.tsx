"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Sidebar } from "@/components/layout/sidebar"
import { Settings, Bell, Palette, Building } from "lucide-react"

export default function ConfiguracoesCoordenadorPage() {
  const [notificacoes, setNotificacoes] = useState({
    email: true,
    push: true,
    sms: false,
  })

  const [bgUrlInput, setBgUrlInput] = useState("")
  
  useEffect(() => {
    if (typeof window === "undefined") return
    const url = window.localStorage.getItem(`ava:bg:coordenador`) || ""
    setBgUrlInput(url)
  }, [])

  function saveBgUrl() {
    try {
      if (bgUrlInput.trim()) {
        window.localStorage.setItem(`ava:bg:coordenador`, bgUrlInput.trim())
      } else {
        window.localStorage.removeItem(`ava:bg:coordenador`)
      }
      alert("Imagem de fundo salva para o modo Liquid Glass.")
    } catch {}
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="coordenador" />

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
                    <p className="text-sm text-muted-foreground">Relatórios e atualizações importantes</p>
                  </div>
                  <Switch
                    checked={notificacoes.email}
                    onCheckedChange={(checked) => setNotificacoes({ ...notificacoes, email: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">Notificações Push</p>
                    <p className="text-sm text-muted-foreground">Alertas sobre questões acadêmicas</p>
                  </div>
                  <Switch
                    checked={notificacoes.push}
                    onCheckedChange={(checked) => setNotificacoes({ ...notificacoes, push: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">Notificações por SMS</p>
                    <p className="text-sm text-muted-foreground">Emergências e situações críticas</p>
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
                  <Building className="w-5 h-5" />
                  Preferências de Gestão
                </CardTitle>
                <CardDescription>Configure suas preferências de coordenação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Frequência de Relatórios</Label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Semanal</option>
                    <option>Quinzenal</option>
                    <option>Mensal</option>
                    <option>Bimestral</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Nível de Detalhamento</Label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Resumido</option>
                    <option>Detalhado</option>
                    <option>Completo</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Horário Preferido para Reuniões</Label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Manhã (8h-12h)</option>
                    <option>Tarde (13h-17h)</option>
                    <option>Noite (18h-22h)</option>
                  </select>
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
