"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sidebar } from "@/components/layout/sidebar"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { MessageSquare, Users, TrendingUp, Eye, Shield, Settings, AlertTriangle } from "lucide-react"

export default function AdministradorComunicacaoPage() {
  const estatisticasGerais = {
    mensagensTotais: 1250,
    comunicadosAtivos: 15,
    usuariosAtivos: 890,
    taxaEngajamento: 82,
  }

  const dadosEngajamento = [
    { mes: "Jan", mensagens: 980, comunicados: 12, engajamento: 78 },
    { mes: "Fev", mensagens: 1120, comunicados: 14, engajamento: 80 },
    { mes: "Mar", mensagens: 1250, comunicados: 15, engajamento: 82 },
  ]

  const comunicadosPorCategoria = [
    { categoria: "Acadêmico", quantidade: 45, cor: "#15803d" },
    { categoria: "Evento", quantidade: 32, cor: "#84cc16" },
    { categoria: "Informativo", quantidade: 28, cor: "#f97316" },
    { categoria: "Urgente", quantidade: 8, cor: "#be123c" },
  ]

  const alertasModeração = [
    {
      id: 1,
      tipo: "Conteúdo Reportado",
      descricao: "Mensagem no fórum reportada por linguagem inadequada",
      usuario: "Bruno Santos (8º B)",
      data: "Hoje, 14:30",
      prioridade: "Alta",
    },
    {
      id: 2,
      tipo: "Spam Detectado",
      descricao: "Múltiplas mensagens idênticas detectadas",
      usuario: "Sistema",
      data: "Ontem, 16:20",
      prioridade: "Média",
    },
    {
      id: 3,
      tipo: "Comunicado Expirado",
      descricao: "Comunicado sobre evento já passou da data",
      usuario: "Sistema",
      data: "2 dias atrás",
      prioridade: "Baixa",
    },
  ]

  const configuracoesSistema = [
    { nome: "Moderação Automática", status: "Ativo", descricao: "Filtro automático de conteúdo" },
    { nome: "Notificações Push", status: "Ativo", descricao: "Notificações em tempo real" },
    { nome: "Backup de Mensagens", status: "Ativo", descricao: "Backup diário das comunicações" },
    { nome: "Relatórios Automáticos", status: "Ativo", descricao: "Relatórios semanais de atividade" },
  ]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="administrador" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Administração de Comunicação</h1>
              <p className="text-muted-foreground">Monitore e gerencie toda a comunicação do sistema</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Shield className="h-4 w-4 mr-2" />
                Moderação
              </Button>
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mensagens Totais</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{estatisticasGerais.mensagensTotais}</div>
                <p className="text-xs text-muted-foreground">+12% vs mês anterior</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Comunicados Ativos</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{estatisticasGerais.comunicadosAtivos}</div>
                <p className="text-xs text-muted-foreground">3 publicados hoje</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{estatisticasGerais.usuariosAtivos}</div>
                <p className="text-xs text-muted-foreground">97% do total de usuários</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Engajamento</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{estatisticasGerais.taxaEngajamento}%</div>
                <p className="text-xs text-muted-foreground">+2% vs mês anterior</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="analytics" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="moderacao">Moderação</TabsTrigger>
              <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
              <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
            </TabsList>

            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Evolução da Comunicação</CardTitle>
                    <CardDescription>Mensagens e comunicados por mês</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={dadosEngajamento}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mes" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="mensagens" stroke="#15803d" strokeWidth={3} name="Mensagens" />
                        <Line
                          type="monotone"
                          dataKey="comunicados"
                          stroke="#84cc16"
                          strokeWidth={3}
                          name="Comunicados"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Comunicados por Categoria</CardTitle>
                    <CardDescription>Distribuição dos tipos de comunicado</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={comunicadosPorCategoria}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="categoria" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="quantidade" fill="#15803d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="moderacao">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Alertas de Moderação</h3>
                  <div className="flex items-center space-x-2">
                    <Select>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filtrar por prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="baixa">Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {alertasModeração.map((alerta) => (
                  <Card key={alerta.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            <h4 className="font-semibold text-lg">{alerta.tipo}</h4>
                            <Badge
                              variant={
                                alerta.prioridade === "Alta"
                                  ? "destructive"
                                  : alerta.prioridade === "Média"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {alerta.prioridade}
                            </Badge>
                          </div>
                          <p className="text-sm mb-2">{alerta.descricao}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>Usuário: {alerta.usuario}</span>
                            <span>{alerta.data}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            Investigar
                          </Button>
                          <Button variant="outline" size="sm">
                            Resolver
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="configuracoes">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Configurações do Sistema</h3>

                {configuracoesSistema.map((config, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg mb-1">{config.nome}</h4>
                          <p className="text-sm text-muted-foreground">{config.descricao}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge variant={config.status === "Ativo" ? "default" : "secondary"}>{config.status}</Badge>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="relatorios">
              <Card>
                <CardHeader>
                  <CardTitle>Gerar Relatórios</CardTitle>
                  <CardDescription>Relatórios detalhados de comunicação</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Tipo de Relatório</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mensagens">Relatório de Mensagens</SelectItem>
                            <SelectItem value="comunicados">Relatório de Comunicados</SelectItem>
                            <SelectItem value="engajamento">Relatório de Engajamento</SelectItem>
                            <SelectItem value="moderacao">Relatório de Moderação</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Período</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o período" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="semana">Última semana</SelectItem>
                            <SelectItem value="mes">Último mês</SelectItem>
                            <SelectItem value="trimestre">Último trimestre</SelectItem>
                            <SelectItem value="ano">Último ano</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline">Visualizar</Button>
                      <Button>Gerar Relatório</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
