"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { getCurrentUser } from "@/src/services/professor-dashboard"

export default function PerfilCoordenadorPage() {
  const router = useRouter()
  const [notificacoes, setNotificacoes] = useState({
    email: true,
    push: true,
    sms: true,
  })

  // Verificar autenticação
  useEffect(() => {
    const init = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("ava:token") : null
        if (!token) {
          router.push("/")
          return
        }
        const user = await getCurrentUser()
        if (!user?.id) {
          router.push("/")
        }
      } catch (error) {
        console.error("Erro ao buscar usuário:", error)
        router.push("/")
      }
    }
    init()
  }, [router])


  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Meu Perfil</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Gerencie suas informações de coordenação e configurações</p>
        </div>
      </div>

      <Tabs defaultValue="perfil" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 overflow-x-auto">
          <TabsTrigger value="perfil" className="text-xs sm:text-sm">Perfil</TabsTrigger>
          <TabsTrigger value="coordenacao" className="text-xs sm:text-sm">Coordenação</TabsTrigger>
          <TabsTrigger value="configuracoes" className="text-xs sm:text-sm">Configurações</TabsTrigger>
          <TabsTrigger value="seguranca" className="text-xs sm:text-sm">Segurança</TabsTrigger>
        </TabsList>

        <TabsContent value="perfil" className="space-y-6">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Foto do Perfil</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Atualize sua foto de perfil</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <Avatar className="w-24 h-24 sm:w-32 sm:h-32">
                  <AvatarImage src="/coordinator-profile-photo.jpg" />
                  <AvatarFallback className="text-xl sm:text-2xl">MO</AvatarFallback>
                </Avatar>
                <Button variant="outline" className="w-full bg-transparent">
                  <Camera className="w-4 h-4 mr-2" />
                  Alterar Foto
                </Button>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Informações Pessoais</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Atualize suas informações básicas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
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
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input id="endereco" defaultValue="Rua Augusta, 500 - São Paulo, SP" />
                  </div>
                </div>
                <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">Salvar Alterações</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="coordenacao" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Building className="w-4 h-4 sm:w-5 sm:h-5" />
                Informações de Coordenação
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Dados sobre sua função de coordenação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
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

              <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">Salvar Informações</Button>
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
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                Notificações
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Configure como você deseja receber notificações</CardDescription>
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
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                Preferências de Gestão
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Configure suas preferências de coordenação</CardDescription>
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
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                Segurança da Conta
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Gerencie a segurança da sua conta</CardDescription>
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
