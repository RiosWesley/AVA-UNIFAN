"use client"

import { useState } from "react"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Sidebar } from "@/components/layout/sidebar"
import { LiquidGlassCard, LiquidGlassButton } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { Settings, Bell, Shield, Camera } from "lucide-react"

export default function PerfilAlunoPage() {
  const [notificacoes, setNotificacoes] = useState({
    email: true,
    push: false,
    sms: false,
  })


  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="aluno" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Meu Perfil</h1>
              <p className="text-muted-foreground text-sm md:text-base">Gerencie suas informações pessoais e configurações</p>
            </div>
          </div>

      <Tabs defaultValue="perfil" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
        </TabsList>

        <TabsContent value="perfil" className="space-y-4 md:space-y-6">
          <div className="grid gap-4 md:gap-6 md:grid-cols-3">
            <LiquidGlassCard className="md:col-span-1" intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Foto do Perfil</CardTitle>
                <CardDescription className="text-sm">Atualize sua foto de perfil</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <Avatar className="w-24 h-24 md:w-32 md:h-32">
                  <AvatarImage src="/student-profile.png" />
                  <AvatarFallback className="text-xl md:text-2xl">JS</AvatarFallback>
                </Avatar>
                <LiquidGlassButton variant="outline" className="w-full bg-transparent text-sm md:text-base">
                  <Camera className="w-4 h-4 mr-2" />
                  Alterar Foto
                </LiquidGlassButton>
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard className="md:col-span-2" intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Informações Pessoais</CardTitle>
                <CardDescription className="text-sm">Atualize suas informações básicas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo</Label>
                    <Input id="nome" defaultValue="João Silva Santos" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="joao.santos@escola.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input id="telefone" defaultValue="(11) 99999-9999" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nascimento">Data de Nascimento</Label>
                    <Input id="nascimento" type="date" defaultValue="2000-05-15" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input id="endereco" defaultValue="Rua das Flores, 123 - São Paulo, SP" />
                  </div>
                </div>
                <LiquidGlassButton className="bg-green-600 hover:bg-green-700">Salvar Alterações</LiquidGlassButton>
              </CardContent>
            </LiquidGlassCard>
          </div>

          <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
            <CardHeader>
              <CardTitle className="text-base md:text-lg">Informações Acadêmicas</CardTitle>
              <CardDescription className="text-sm">Dados sobre seu curso e matrícula</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Matrícula</Label>
                  <div className="p-2 bg-gray-50 rounded-md">
                    <span className="font-mono">2023001234</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Curso</Label>
                  <div className="p-2 bg-gray-50 rounded-md">
                    <span>Ciência da Computação</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Período</Label>
                  <div className="p-2 bg-gray-50 rounded-md">
                    <span>4º Semestre</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="p-2 bg-gray-50 rounded-md">
                    <Badge>Ativo</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Ingresso</Label>
                  <div className="p-2 bg-gray-50 rounded-md">
                    <span>2023.1</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Previsão de Formatura</Label>
                  <div className="p-2 bg-gray-50 rounded-md">
                    <span>2026.2</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </LiquidGlassCard>
        </TabsContent>

        <TabsContent value="configuracoes" className="space-y-4 md:space-y-6">
          <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Bell className="w-4 h-4 md:w-5 md:h-5" />
                Notificações
              </CardTitle>
              <CardDescription className="text-sm">Configure como você deseja receber notificações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Notificações por Email</p>
                  <p className="text-sm text-gray-600">Receba atualizações importantes por email</p>
                </div>
                <Switch
                  checked={notificacoes.email}
                  onCheckedChange={(checked) => setNotificacoes({ ...notificacoes, email: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Notificações Push</p>
                  <p className="text-sm text-gray-600">Receba notificações no navegador</p>
                </div>
                <Switch
                  checked={notificacoes.push}
                  onCheckedChange={(checked) => setNotificacoes({ ...notificacoes, push: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Notificações por SMS</p>
                  <p className="text-sm text-gray-600">Receba alertas importantes por SMS</p>
                </div>
                <Switch
                  checked={notificacoes.sms}
                  onCheckedChange={(checked) => setNotificacoes({ ...notificacoes, sms: checked })}
                />
              </div>
            </CardContent>
          </LiquidGlassCard>

          <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Settings className="w-4 h-4 md:w-5 md:h-5" />
                Preferências do Sistema
              </CardTitle>
              <CardDescription className="text-sm">Personalize sua experiência no sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tema</Label>
                <select className="w-full p-2 border rounded-md">
                  <option>Claro</option>
                  <option>Escuro</option>
                  <option>Automático</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Idioma</Label>
                <select className="w-full p-2 border rounded-md">
                  <option>Português (Brasil)</option>
                  <option>English</option>
                  <option>Español</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Fuso Horário</Label>
                <select className="w-full p-2 border rounded-md">
                  <option>América/São_Paulo</option>
                  <option>América/Rio_Branco</option>
                  <option>América/Manaus</option>
                </select>
              </div>
              <LiquidGlassButton className="bg-green-600 hover:bg-green-700">Salvar Preferências</LiquidGlassButton>
            </CardContent>
          </LiquidGlassCard>
        </TabsContent>

        <TabsContent value="seguranca" className="space-y-4 md:space-y-6">
          <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Shield className="w-4 h-4 md:w-5 md:h-5" />
                Segurança da Conta
              </CardTitle>
              <CardDescription className="text-sm">Gerencie a segurança da sua conta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="senha-atual">Senha Atual</Label>
                  <Input id="senha-atual" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nova-senha">Nova Senha</Label>
                  <Input id="nova-senha" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmar-senha">Confirmar Nova Senha</Label>
                  <Input id="confirmar-senha" type="password" />
                </div>
                <LiquidGlassButton className="bg-green-600 hover:bg-green-700">Alterar Senha</LiquidGlassButton>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-medium mb-4">Sessões Ativas</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Navegador Atual</p>
                      <p className="text-sm text-gray-600">Chrome - São Paulo, SP</p>
                      <p className="text-sm text-gray-600">Último acesso: Agora</p>
                    </div>
                    <Badge>Atual</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Mobile App</p>
                      <p className="text-sm text-gray-600">Android - São Paulo, SP</p>
                      <p className="text-sm text-gray-600">Último acesso: 2 horas atrás</p>
                    </div>
                    <LiquidGlassButton variant="outline" size="sm">
                      Encerrar
                    </LiquidGlassButton>
                  </div>
                </div>
              </div>
            </CardContent>
          </LiquidGlassCard>
        </TabsContent>
      </Tabs>
        </div>
      </main>
    </div>
  )
}
