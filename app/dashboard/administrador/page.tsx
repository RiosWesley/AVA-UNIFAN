"use client"

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Sidebar } from "@/components/layout/sidebar"
import { LiquidGlassCard, LiquidGlassButton } from "@/components/liquid-glass"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { Users, DollarSign, TrendingUp, AlertTriangle, Settings, FileText, Shield, Database } from "lucide-react"

export default function AdministradorDashboard() {
  const estatisticasGerais = {
    totalUsuarios: 915,
    novosUsuarios: 23,
    receita: 125000,
    inadimplencia: 8.5,
    sistemaUptime: 99.9,
  }

  const usuariosData = [
    { mes: "Jan", alunos: 820, professores: 42, coordenadores: 8, admins: 3 },
    { mes: "Fev", alunos: 835, professores: 43, coordenadores: 8, admins: 3 },
    { mes: "Mar", alunos: 870, professores: 45, coordenadores: 9, admins: 4 },
  ]

  const receitaData = [
    { mes: "Jan", receita: 118000, despesas: 85000 },
    { mes: "Fev", receita: 122000, despesas: 87000 },
    { mes: "Mar", receita: 125000, despesas: 89000 },
  ]

  const alertas = [
    { tipo: "Financeiro", mensagem: "15 alunos com mensalidade em atraso", prioridade: "alta" },
    { tipo: "Sistema", mensagem: "Backup automático concluído", prioridade: "baixa" },
    { tipo: "Acadêmico", mensagem: "3 turmas precisam de professor substituto", prioridade: "média" },
    { tipo: "Técnico", mensagem: "Atualização de segurança disponível", prioridade: "média" },
  ]

  const atalhos = [
    { titulo: "Gerenciar Usuários", descricao: "Adicionar, editar ou remover usuários", icon: Users },
    { titulo: "Configurações", descricao: "Configurações gerais do sistema", icon: Settings },
    { titulo: "Relatórios", descricao: "Gerar relatórios detalhados", icon: FileText },
    { titulo: "Segurança", descricao: "Configurações de segurança", icon: Shield },
  ]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="administrador" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Painel Administrativo</h1>
              <p className="text-muted-foreground">Visão geral completa do sistema AVA</p>
            </div>
            <div className="flex gap-2">
              <LiquidGlassButton variant="outline">
                <Database className="h-4 w-4 mr-2" />
                Backup
              </LiquidGlassButton>
              <LiquidGlassButton>
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </LiquidGlassButton>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
            <LiquidGlassCard intensity="medium">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{estatisticasGerais.totalUsuarios}</div>
                <p className="text-xs text-muted-foreground">+{estatisticasGerais.novosUsuarios} este mês</p>
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard intensity="medium">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">R$ {estatisticasGerais.receita.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+2.4% vs mês anterior</p>
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard intensity="medium">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inadimplência</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{estatisticasGerais.inadimplencia}%</div>
                <Progress value={estatisticasGerais.inadimplencia} className="mt-2" />
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard intensity="medium">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uptime Sistema</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{estatisticasGerais.sistemaUptime}%</div>
                <Progress value={estatisticasGerais.sistemaUptime} className="mt-2" />
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard intensity="medium">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">4</div>
                <p className="text-xs text-muted-foreground">1 alta prioridade</p>
              </CardContent>
            </LiquidGlassCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <LiquidGlassCard intensity="low">
              <CardHeader>
                <CardTitle>Crescimento de Usuários</CardTitle>
                <CardDescription>Evolução mensal por tipo de usuário</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={usuariosData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="alunos" fill="#15803d" name="Alunos" />
                    <Bar dataKey="professores" fill="#84cc16" name="Professores" />
                    <Bar dataKey="coordenadores" fill="#f97316" name="Coordenadores" />
                    <Bar dataKey="admins" fill="#be123c" name="Administradores" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard intensity="low">
              <CardHeader>
                <CardTitle>Receitas vs Despesas</CardTitle>
                <CardDescription>Comparativo financeiro mensal</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={receitaData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString()}`} />
                    <Line type="monotone" dataKey="receita" stroke="#15803d" strokeWidth={3} name="Receita" />
                    <Line type="monotone" dataKey="despesas" stroke="#be123c" strokeWidth={3} name="Despesas" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </LiquidGlassCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <LiquidGlassCard intensity="low" className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Alertas do Sistema
                </CardTitle>
                <CardDescription>Notificações importantes que requerem atenção</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alertas.map((alerta, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <Badge
                            variant={
                              alerta.prioridade === "alta"
                                ? "destructive"
                                : alerta.prioridade === "média"
                                  ? "secondary"
                                  : "outline"
                            }
                            className="mr-2"
                          >
                            {alerta.tipo}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {alerta.prioridade}
                          </Badge>
                        </div>
                        <p className="text-sm">{alerta.mensagem}</p>
                      </div>
                      <LiquidGlassButton size="sm" variant="outline">
                        Resolver
                      </LiquidGlassButton>
                    </div>
                  ))}
                </div>
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard intensity="low">
              <CardHeader>
                <CardTitle>Atalhos Rápidos</CardTitle>
                <CardDescription>Acesso rápido às principais funcionalidades</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {atalhos.map((atalho, index) => {
                    const Icon = atalho.icon
                    return (
                      <LiquidGlassButton key={index} variant="outline" className="w-full justify-start h-auto p-4 bg-transparent">
                        <div className="flex items-start">
                          <Icon className="h-5 w-5 mr-3 mt-0.5" />
                          <div className="text-left">
                            <p className="font-medium">{atalho.titulo}</p>
                            <p className="text-xs text-muted-foreground">{atalho.descricao}</p>
                          </div>
                        </div>
                      </LiquidGlassButton>
                    )
                  })}
                </div>
              </CardContent>
            </LiquidGlassCard>
          </div>
        </div>
      </main>
    </div>
  )
}
