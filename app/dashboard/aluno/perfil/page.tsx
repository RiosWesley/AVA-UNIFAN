"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Settings, Bell, Shield, Camera } from "lucide-react"

export default function PerfilAlunoPage() {
  const [notificacoes, setNotificacoes] = useState({
    email: true,
    push: false,
    sms: false,
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="text-gray-600">Gerencie suas informações pessoais e configurações</p>
        </div>
      </div>

      <Tabs defaultValue="perfil" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
        </TabsList>

        <TabsContent value="perfil" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Foto do Perfil</CardTitle>
                <CardDescription>Atualize sua foto de perfil</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <Avatar className="w-32 h-32">
                  <AvatarImage src="/student-profile.png" />
                  <AvatarFallback className="text-2xl">JS</AvatarFallback>
                </Avatar>
                <Button variant="outline" className="w-full bg-transparent">
                  <Camera className="w-4 h-4 mr-2" />
                  Alterar Foto
                </Button>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>Atualize suas informações básicas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
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
                <Button className="bg-green-600 hover:bg-green-700">Salvar Alterações</Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informações Acadêmicas</CardTitle>
              <CardDescription>Dados sobre seu curso e matrícula</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
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
          </Card>
        </TabsContent>

        <TabsContent value="configuracoes" className="space-y-6">
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
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Preferências do Sistema
              </CardTitle>
              <CardDescription>Personalize sua experiência no sistema</CardDescription>
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
              <Button className="bg-green-600 hover:bg-green-700">Salvar Preferências</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguranca" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Segurança da Conta
              </CardTitle>
              <CardDescription>Gerencie a segurança da sua conta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                <Button className="bg-green-600 hover:bg-green-700">Alterar Senha</Button>
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
                    <Button variant="outline" size="sm">
                      Encerrar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
