"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Settings, Database, Shield, Activity, Plus, Edit, Trash2, Search } from "lucide-react"

export default function GestaoAdminPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const usuarios = [
    {
      id: 1,
      nome: "Ana Silva",
      email: "ana@escola.com",
      tipo: "Professor",
      status: "Ativo",
      ultimoAcesso: "2024-03-15",
    },
    {
      id: 2,
      nome: "João Santos",
      email: "joao@escola.com",
      tipo: "Aluno",
      status: "Ativo",
      ultimoAcesso: "2024-03-14",
    },
    {
      id: 3,
      nome: "Maria Oliveira",
      email: "maria@escola.com",
      tipo: "Coordenador",
      status: "Inativo",
      ultimoAcesso: "2024-03-10",
    },
  ]

  const configuracoes = [
    { categoria: "Sistema", item: "Backup Automático", status: "Ativo", ultimaAtualizacao: "2024-03-15" },
    { categoria: "Segurança", item: "Autenticação 2FA", status: "Ativo", ultimaAtualizacao: "2024-03-14" },
    { categoria: "Notificações", item: "Email Automático", status: "Ativo", ultimaAtualizacao: "2024-03-13" },
    { categoria: "Performance", item: "Cache Redis", status: "Ativo", ultimaAtualizacao: "2024-03-12" },
  ]

  const logs = [
    {
      id: 1,
      usuario: "admin@escola.com",
      acao: "Login realizado",
      timestamp: "2024-03-15 14:30:00",
      ip: "192.168.1.100",
    },
    {
      id: 2,
      usuario: "ana@escola.com",
      acao: "Nota atualizada",
      timestamp: "2024-03-15 14:25:00",
      ip: "192.168.1.101",
    },
    {
      id: 3,
      usuario: "joao@escola.com",
      acao: "Atividade enviada",
      timestamp: "2024-03-15 14:20:00",
      ip: "192.168.1.102",
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão do Sistema</h1>
          <p className="text-gray-600">Administração completa do sistema AVA</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Configuração
        </Button>
      </div>

      <Tabs defaultValue="usuarios" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
          <TabsTrigger value="logs">Logs do Sistema</TabsTrigger>
          <TabsTrigger value="manutencao">Manutenção</TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Gestão de Usuários
              </CardTitle>
              <CardDescription>Gerencie todos os usuários do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Buscar usuários..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="aluno">Aluno</SelectItem>
                    <SelectItem value="professor">Professor</SelectItem>
                    <SelectItem value="coordenador">Coordenador</SelectItem>
                    <SelectItem value="administrador">Administrador</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Search className="w-4 h-4 mr-2" />
                  Buscar
                </Button>
              </div>

              <div className="space-y-4">
                {usuarios.map((usuario) => (
                  <Card key={usuario.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg">{usuario.nome}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{usuario.email}</span>
                            <span>Tipo: {usuario.tipo}</span>
                            <span>Último acesso: {usuario.ultimoAcesso}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={usuario.status === "Ativo" ? "default" : "secondary"}>{usuario.status}</Badge>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuracoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configurações do Sistema
              </CardTitle>
              <CardDescription>Configure parâmetros e funcionalidades do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {configuracoes.map((config, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <h3 className="font-semibold">{config.item}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Categoria: {config.categoria}</span>
                            <span>Última atualização: {config.ultimaAtualizacao}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={config.status === "Ativo" ? "default" : "secondary"}>{config.status}</Badge>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Logs do Sistema
              </CardTitle>
              <CardDescription>Monitore atividades e eventos do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {logs.map((log) => (
                  <Card key={log.id} className="border-l-4 border-l-yellow-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-medium">{log.acao}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Usuário: {log.usuario}</span>
                            <span>IP: {log.ip}</span>
                            <span>{log.timestamp}</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Detalhes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manutencao" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Manutenção do Banco
                </CardTitle>
                <CardDescription>Operações de manutenção do banco de dados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full bg-transparent" variant="outline">
                  Executar Backup
                </Button>
                <Button className="w-full bg-transparent" variant="outline">
                  Otimizar Tabelas
                </Button>
                <Button className="w-full bg-transparent" variant="outline">
                  Limpar Logs Antigos
                </Button>
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white">Restaurar Backup</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Segurança
                </CardTitle>
                <CardDescription>Configurações de segurança do sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Política de Senhas</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a política" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basica">Básica</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="forte">Forte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tempo de Sessão (minutos)</Label>
                  <Input type="number" defaultValue="60" />
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700">Salvar Configurações</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
