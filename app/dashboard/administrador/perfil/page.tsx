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
import { Settings, Bell, Shield, Camera, Crown } from "lucide-react"

export default function PerfilAdministradorPage() {
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
          <p className="text-gray-600">Gerencie suas informações administrativas e configurações</p>
        </div>
      </div>

      <Tabs defaultValue="perfil" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="administracao">Administração</TabsTrigger>
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
                  <AvatarImage src="/administrator-profile-photo.jpg" />
                  <AvatarFallback className="text-2xl">CS</AvatarFallback>
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
                    <Input id="nome" defaultValue="Carlos Silva Santos" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="carlos.silva@escola.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input id="telefone" defaultValue="(11) 96666-6666" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nascimento">Data de Nascimento</Label>
                    <Input id="nascimento" type="date" defaultValue="1975-12-05" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input id="endereco" defaultValue="Av. Faria Lima, 2000 - São Paulo, SP" />
                  </div>
                </div>
                <Button className="bg-green-600 hover:bg-green-700">Salvar Alterações</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="administracao" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Informações Administrativas
              </CardTitle>
              <CardDescription>Dados sobre sua função administrativa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input id="cargo" defaultValue="Administrador do Sistema" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nivel-acesso">Nível de Acesso</Label>
                  <Input id="nivel-acesso" defaultValue="Super Administrador" disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data-admissao">Data de Admissão</Label>
                  <Input id="data-admissao" type="date" defaultValue="2020-01-15" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="setor">Setor</Label>
                  <Input id="setor" defaultValue="Tecnologia da Informação" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsabilidades">Principais Responsabilidades</Label>
                <Textarea
                  id="responsabilidades"
                  rows={4}
                  defaultValue="Administração completa do sistema AVA, gerenciamento de usuários, configuração de políticas de segurança, manutenção da infraestrutura tecnológica, supervisão de backups e atualizações do sistema."
                />
              </div>

              <Button className="bg-green-600 hover:bg-green-700">Salvar Informações</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Permissões e Acessos</CardTitle>
              <CardDescription>Suas permissões no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Gestão de Usuários</span>
                  <Badge>Completo</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Configurações do Sistema</span>
                  <Badge>Completo</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Relatórios Financeiros</span>
                  <Badge>Completo</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Backup e Restauração</span>
                  <Badge>Completo</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Logs do Sistema</span>
                  <Badge>Completo</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Manutenção</span>
                  <Badge>Completo</Badge>
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
                  <p className="text-sm text-gray-600">Relatórios do sistema e alertas críticos</p>
                </div>
                <Switch
                  checked={notificacoes.email}
                  onCheckedChange={(checked) => setNotificacoes({ ...notificacoes, email: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Notificações Push</p>
                  <p className="text-sm text-gray-600">Alertas em tempo real sobre o sistema</p>
                </div>
                <Switch
                  checked={notificacoes.push}
                  onCheckedChange={(checked) => setNotificacoes({ ...notificacoes, push: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Notificações por SMS</p>
                  <p className="text-sm text-gray-600">Emergências e falhas críticas</p>
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
              <CardDescription>Gerencie a segurança da sua conta administrativa</CardDescription>
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
                <h3 className="font-medium mb-4">Autenticação de Dois Fatores</h3>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium">2FA Ativado</p>
                    <p className="text-sm text-gray-600">Proteção adicional para sua conta</p>
                  </div>
                  <Badge>Ativo</Badge>
                </div>
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
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
