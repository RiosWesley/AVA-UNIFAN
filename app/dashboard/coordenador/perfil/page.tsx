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
import { Textarea } from "@/components/ui/textarea"
import { Settings, Bell, Shield, Camera, Building } from "lucide-react"

export default function PerfilCoordenadorPage() {
  const [notificacoes, setNotificacoes] = useState({
    email: true,
    push: true,
    sms: true,
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="text-gray-600">Gerencie suas informações de coordenação e configurações</p>
        </div>
      </div>

      <Tabs defaultValue="perfil" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="coordenacao">Coordenação</TabsTrigger>
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
                  <AvatarImage src="/coordinator-profile-photo.jpg" />
                  <AvatarFallback className="text-2xl">MO</AvatarFallback>
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
                    <Input id="nome" defaultValue="Maria Oliveira Santos" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="maria.oliveira@escola.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input id="telefone" defaultValue="(11) 97777-7777" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nascimento">Data de Nascimento</Label>
                    <Input id="nascimento" type="date" defaultValue="1980-08-10" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input id="endereco" defaultValue="Rua Augusta, 500 - São Paulo, SP" />
                  </div>
                </div>
                <Button className="bg-green-600 hover:bg-green-700">Salvar Alterações</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="coordenacao" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Informações de Coordenação
              </CardTitle>
              <CardDescription>Dados sobre sua função de coordenação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input id="cargo" defaultValue="Coordenadora de Curso" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="departamento">Departamento</Label>
                  <Input id="departamento" defaultValue="Sistemas de Informação" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inicio-mandato">Início do Mandato</Label>
                  <Input id="inicio-mandato" type="date" defaultValue="2023-01-01" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fim-mandato">Fim do Mandato</Label>
                  <Input id="fim-mandato" type="date" defaultValue="2025-12-31" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsabilidades">Principais Responsabilidades</Label>
                <Textarea
                  id="responsabilidades"
                  rows={4}
                  defaultValue="Coordenação do curso de Sistemas de Informação, supervisão do corpo docente, acompanhamento do desempenho acadêmico dos alunos, planejamento curricular e gestão de recursos do departamento."
                />
              </div>

              <Button className="bg-green-600 hover:bg-green-700">Salvar Informações</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cursos Coordenados</CardTitle>
              <CardDescription>Cursos sob sua coordenação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium">Sistemas de Informação</p>
                    <p className="text-sm text-gray-600">80 alunos • 12 professores</p>
                  </div>
                  <Badge>Principal</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Análise e Desenvolvimento de Sistemas</p>
                    <p className="text-sm text-gray-600">65 alunos • 8 professores</p>
                  </div>
                  <Badge variant="secondary">Auxiliar</Badge>
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
                  <p className="text-sm text-gray-600">Relatórios e atualizações importantes</p>
                </div>
                <Switch
                  checked={notificacoes.email}
                  onCheckedChange={(checked) => setNotificacoes({ ...notificacoes, email: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Notificações Push</p>
                  <p className="text-sm text-gray-600">Alertas sobre questões acadêmicas</p>
                </div>
                <Switch
                  checked={notificacoes.push}
                  onCheckedChange={(checked) => setNotificacoes({ ...notificacoes, push: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Notificações por SMS</p>
                  <p className="text-sm text-gray-600">Emergências e situações críticas</p>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
