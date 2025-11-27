"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LiquidGlassCard, LiquidGlassButton } from "@/components/liquid-glass"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Settings, Bell, Shield, Camera, GraduationCap } from "lucide-react"
import { getCurrentUser } from "@/src/services/professor-dashboard"

export default function PerfilProfessorPage() {
  const router = useRouter()
  const [notificacoes, setNotificacoes] = useState({
    email: true,
    push: true,
    sms: false,
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
    <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">Meu Perfil</h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Gerencie suas informações profissionais e configurações</p>
        </div>
      </div>

      <Tabs defaultValue="perfil" className="space-y-4 md:space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1">
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="academico">Acadêmico</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
        </TabsList>

        <TabsContent value="perfil" className="space-y-4 md:space-y-6">
          <div className="grid gap-4 md:gap-6 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Foto do Perfil</CardTitle>
                <CardDescription className="text-xs md:text-sm">Atualize sua foto de perfil</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-3 md:space-y-4">
                <Avatar className="w-24 h-24 md:w-32 md:h-32">
                  <AvatarImage src="/professor-profile-photo.jpg" />
                  <AvatarFallback className="text-xl md:text-2xl">AS</AvatarFallback>
                </Avatar>
                <Button variant="outline" className="w-full bg-transparent text-sm md:text-base">
                  <Camera className="w-4 h-4 mr-2" />
                  Alterar Foto
                </Button>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Informações Pessoais</CardTitle>
                <CardDescription className="text-xs md:text-sm">Atualize suas informações básicas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                <div className="grid gap-3 md:gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo</Label>
                    <Input id="nome" defaultValue="Ana Silva Santos" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="ana.silva@escola.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input id="telefone" defaultValue="(11) 98888-8888" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nascimento">Data de Nascimento</Label>
                    <Input id="nascimento" type="date" defaultValue="1985-03-20" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input id="endereco" defaultValue="Av. Paulista, 1000 - São Paulo, SP" />
                  </div>
                </div>
                <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">Salvar Alterações</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="academico" className="space-y-4 md:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <GraduationCap className="w-4 h-4 md:w-5 md:h-5" />
                Informações Acadêmicas
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">Dados sobre sua formação e experiência</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              <div className="grid gap-3 md:gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="registro">Registro Profissional</Label>
                  <Input id="registro" defaultValue="CRP-123456" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="departamento">Departamento</Label>
                  <Input id="departamento" defaultValue="Ciência da Computação" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="titulacao">Titulação</Label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Doutor</option>
                    <option>Mestre</option>
                    <option>Especialista</option>
                    <option>Graduado</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regime">Regime de Trabalho</Label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Dedicação Exclusiva</option>
                    <option>40h</option>
                    <option>20h</option>
                    <option>Horista</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="biografia">Biografia Profissional</Label>
                <Textarea
                  id="biografia"
                  rows={4}
                  defaultValue="Doutora em Ciência da Computação pela USP, com especialização em Inteligência Artificial e Machine Learning. Atua há 10 anos no ensino superior e possui experiência em pesquisa acadêmica."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="especializacoes">Áreas de Especialização</Label>
                <Input id="especializacoes" defaultValue="Inteligência Artificial, Machine Learning, Algoritmos" />
              </div>

              <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">Salvar Informações</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Disciplinas Ministradas</CardTitle>
              <CardDescription>Disciplinas que você leciona atualmente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm md:text-base truncate">Algoritmos e Estruturas de Dados</p>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate">Turma: CC-2023A • 45 alunos</p>
                  </div>
                  <Badge className="text-xs w-fit">Ativa</Badge>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm md:text-base truncate">Inteligência Artificial</p>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate">Turma: CC-2023B • 38 alunos</p>
                  </div>
                  <Badge className="text-xs w-fit">Ativa</Badge>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm md:text-base truncate">Machine Learning</p>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate">Turma: CC-2023C • 25 alunos</p>
                  </div>
                  <Badge variant="secondary" className="text-xs w-fit">Planejada</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuracoes" className="space-y-4 md:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Bell className="w-4 h-4 md:w-5 md:h-5" />
                Notificações
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">Configure como você deseja receber notificações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1 min-w-0 flex-1">
                  <p className="font-medium text-sm md:text-base">Notificações por Email</p>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Receba atualizações sobre suas turmas</p>
                </div>
                <Switch
                  checked={notificacoes.email}
                  onCheckedChange={(checked) => setNotificacoes({ ...notificacoes, email: checked })}
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1 min-w-0 flex-1">
                  <p className="font-medium text-sm md:text-base">Notificações Push</p>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Alertas sobre atividades e mensagens</p>
                </div>
                <Switch
                  checked={notificacoes.push}
                  onCheckedChange={(checked) => setNotificacoes({ ...notificacoes, push: checked })}
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1 min-w-0 flex-1">
                  <p className="font-medium text-sm md:text-base">Notificações por SMS</p>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Alertas urgentes por SMS</p>
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
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Settings className="w-4 h-4 md:w-5 md:h-5" />
                Preferências de Ensino
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">Configure suas preferências para o ensino</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4">
              <div className="space-y-2">
                <Label>Método de Avaliação Padrão</Label>
                <select className="w-full p-2 border rounded-md">
                  <option>Prova + Trabalhos</option>
                  <option>Apenas Provas</option>
                  <option>Apenas Trabalhos</option>
                  <option>Avaliação Contínua</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Formato de Entrega Preferido</Label>
                <select className="w-full p-2 border rounded-md">
                  <option>Digital (PDF)</option>
                  <option>Físico</option>
                  <option>Ambos</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Prazo Padrão para Correção (dias)</Label>
                <Input type="number" defaultValue="7" />
              </div>
              <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">Salvar Preferências</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguranca" className="space-y-4 md:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Shield className="w-4 h-4 md:w-5 md:h-5" />
                Segurança da Conta
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">Gerencie a segurança da sua conta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              <div className="space-y-3 md:space-y-4">
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
                <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">Alterar Senha</Button>
              </div>

              <div className="border-t pt-4 md:pt-6">
                <h3 className="font-medium mb-3 md:mb-4 text-sm md:text-base">Sessões Ativas</h3>
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm md:text-base">Navegador Atual</p>
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Chrome - São Paulo, SP</p>
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Último acesso: Agora</p>
                    </div>
                    <Badge className="text-xs w-fit">Atual</Badge>
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
