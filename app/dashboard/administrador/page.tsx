"use client"

import { useState, useEffect } from "react"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Sidebar } from "@/components/layout/sidebar"
import { LiquidGlassCard, LiquidGlassButton } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { Users, DollarSign, TrendingUp, AlertTriangle, Settings, FileText, Shield, Database, Star, Award, Activity, Target, Sparkles, Bell, ChevronRight, Clock, Server, Zap, CheckCircle } from "lucide-react"

export default function AdministradorDashboard() {
  const [isLiquidGlass, setIsLiquidGlass] = useState(false)

  useEffect(() => {
    const checkTheme = () => {
      setIsLiquidGlass(document.documentElement.classList.contains("liquid-glass"))
    }

    checkTheme()

    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    })

    return () => observer.disconnect()
  }, [])

  const estatisticasGerais = {
    totalUsuarios: 915,
    novosUsuarios: 23,
    receita: 125000,
    inadimplencia: 8.5,
    sistemaUptime: 99.9,
    servidoresOnline: 12,
    ticketsSuporte: 8,
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
    {
      tipo: "Financeiro",
      mensagem: "15 alunos com mensalidade em atraso",
      prioridade: "alta",
      data: "Hoje, 09:30",
      resolvido: false
    },
    {
      tipo: "Sistema",
      mensagem: "Backup automático concluído",
      prioridade: "baixa",
      data: "Hoje, 02:00",
      resolvido: true
    },
    {
      tipo: "Acadêmico",
      mensagem: "3 turmas precisam de professor substituto",
      prioridade: "média",
      data: "Ontem, 16:45",
      resolvido: false
    },
    {
      tipo: "Técnico",
      mensagem: "Atualização de segurança disponível",
      prioridade: "média",
      data: "Hoje, 08:15",
      resolvido: false
    },
  ]

  const atalhos = [
    {
      titulo: "Gerenciar Usuários",
      descricao: "Adicionar, editar ou remover usuários",
      icon: Users,
      cor: "green"
    },
    {
      titulo: "Configurações",
      descricao: "Configurações gerais do sistema",
      icon: Settings,
      cor: "purple"
    },
    {
      titulo: "Relatórios",
      descricao: "Gerar relatórios detalhados",
      icon: FileText,
      cor: "emerald"
    },
    {
      titulo: "Segurança",
      descricao: "Configurações de segurança",
      icon: Shield,
      cor: "orange"
    },
  ]

  const sistemaStatus = [
    { nome: "Servidor Principal", status: "online", uptime: "99.9%", carga: "45%" },
    { nome: "Banco de Dados", status: "online", uptime: "99.8%", carga: "32%" },
    { nome: "API Gateway", status: "online", uptime: "99.7%", carga: "28%" },
    { nome: "CDN", status: "online", uptime: "100%", carga: "15%" },
  ]

  const comunicados = [
    {
      titulo: "Manutenção Programada",
      descricao: "Sistema indisponível das 22h às 06h no sábado",
      data: "Sábado, 22:00",
      prioridade: "Média"
    },
    {
      titulo: "Nova versão disponível",
      descricao: "Atualização do sistema AVA v2.1.0",
      data: "Próxima semana",
      prioridade: "Baixa"
    }
  ]

  return (
    <div className={`flex h-screen ${isLiquidGlass ? 'bg-black/30 dark:bg-gray-900/20' : 'bg-background'}`}>
      <Sidebar userRole="administrador" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header aprimorado */}
          <div className={`flex items-center justify-between mb-8 p-6 rounded-2xl border backdrop-blur-sm ${
            isLiquidGlass
              ? 'bg-black/30 dark:bg-gray-800/20 border-gray-200/30 dark:border-gray-700/50'
              : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
          }`}>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                  Painel Administrativo
                </h1>
                <p className="text-muted-foreground text-lg mt-1">
                  Visão geral completa do sistema AVA
                </p>
                <div className="flex items-center mt-2 space-x-2">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                    <Star className="h-3 w-3 mr-1" />
                    {estatisticasGerais.totalUsuarios} usuários ativos
                  </Badge>
                  <Badge variant="outline" className="text-green-600 border-green-200 dark:text-green-400 dark:border-green-800">
                    <Award className="h-3 w-3 mr-1" />
                    Uptime: {estatisticasGerais.sistemaUptime}%
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <LiquidGlassButton variant="outline" size="lg" className={`backdrop-blur-sm ${
                isLiquidGlass
                  ? 'bg-black/30 dark:bg-gray-800/20 hover:bg-black/50 dark:hover:bg-gray-800/30'
                  : 'bg-gray-50/60 dark:bg-gray-800/40 hover:bg-black/80 dark:hover:bg-gray-800/60'
              }`}>
                <Database className="h-5 w-5 mr-2" />
                Backup
              </LiquidGlassButton>
              <LiquidGlassButton variant="outline" size="lg" className={`backdrop-blur-sm ${
                isLiquidGlass
                  ? 'bg-black/30 dark:bg-gray-800/20 hover:bg-black/50 dark:hover:bg-gray-800/30'
                  : 'bg-gray-50/60 dark:bg-gray-800/40 hover:bg-black/80 dark:hover:bg-gray-800/60'
              }`}>
                <Settings className="h-5 w-5 mr-2" />
                Configurações
              </LiquidGlassButton>
            </div>
          </div>

          {/* Cards de estatísticas aprimorados */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            <LiquidGlassCard
              intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
              className={`group hover:scale-105 transition-all duration-300 hover:shadow-2xl border-0 ${
                isLiquidGlass
                  ? 'bg-black/30 dark:bg-gray-800/20'
                  : 'bg-gray-50/60 dark:bg-gray-800/40'
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total de Usuários</CardTitle>
                <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                  <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">{estatisticasGerais.totalUsuarios}</div>
                <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{estatisticasGerais.novosUsuarios} este mês
                </div>
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard
              intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
              className={`group hover:scale-105 transition-all duration-300 hover:shadow-2xl border-0 ${
                isLiquidGlass
                  ? 'bg-black/30 dark:bg-gray-800/20'
                  : 'bg-gray-50/60 dark:bg-gray-800/40'
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">Receita Mensal</CardTitle>
                <div className="p-2 bg-emerald-500/20 rounded-lg group-hover:bg-emerald-500/30 transition-colors">
                  <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">R$ {estatisticasGerais.receita.toLocaleString()}</div>
                <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                  <Activity className="h-3 w-3 mr-1" />
                  +2.4% vs mês anterior
                </div>
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard
              intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
              className={`group hover:scale-105 transition-all duration-300 hover:shadow-2xl border-0 ${
                isLiquidGlass
                  ? 'bg-black/30 dark:bg-gray-800/20'
                  : 'bg-gray-50/60 dark:bg-gray-800/40'
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">Inadimplência</CardTitle>
                <div className="p-2 bg-amber-500/20 rounded-lg group-hover:bg-amber-500/30 transition-colors">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-2">{estatisticasGerais.inadimplencia}%</div>
                <Progress value={estatisticasGerais.inadimplencia} className="h-2 mb-2" />
                <p className="text-xs text-gray-600 dark:text-gray-400">15 alunos em atraso</p>
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard
              intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
              className={`group hover:scale-105 transition-all duration-300 hover:shadow-2xl border-0 ${
                isLiquidGlass
                  ? 'bg-black/30 dark:bg-gray-800/20'
                  : 'bg-gray-50/60 dark:bg-gray-800/40'
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">Uptime Sistema</CardTitle>
                <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                  <Server className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">{estatisticasGerais.sistemaUptime}%</div>
                <Progress value={estatisticasGerais.sistemaUptime} className="h-2 mb-2" />
                <p className="text-xs text-gray-600 dark:text-gray-400">{estatisticasGerais.servidoresOnline} servidores online</p>
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard
              intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
              className={`group hover:scale-105 transition-all duration-300 hover:shadow-2xl border-0 ${
                isLiquidGlass
                  ? 'bg-black/30 dark:bg-gray-800/20'
                  : 'bg-gray-50/60 dark:bg-gray-800/40'
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">Alertas Ativos</CardTitle>
                <div className="p-2 bg-red-500/20 rounded-lg group-hover:bg-red-500/30 transition-colors">
                  <Bell className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">4</div>
                <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  1 alta prioridade
                </div>
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard
              intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
              className={`group hover:scale-105 transition-all duration-300 hover:shadow-2xl border-0 ${
                isLiquidGlass
                  ? 'bg-black/30 dark:bg-gray-800/20'
                  : 'bg-gray-50/60 dark:bg-gray-800/40'
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">Suporte</CardTitle>
                <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                  <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">{estatisticasGerais.ticketsSuporte}</div>
                <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                  <Clock className="h-3 w-3 mr-1" />
                  Tickets pendentes
                </div>
              </CardContent>
            </LiquidGlassCard>
          </div>

          {/* Layout principal aprimorado */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6">
            {/* Conteúdo principal - ocupa 8 colunas no xl */}
            <div className="xl:col-span-8 space-y-6">
              {/* Gráficos de análise */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LiquidGlassCard
                  intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
                  className={`group hover:scale-[1.02] transition-all duration-300 hover:shadow-xl border-0 ${
                    isLiquidGlass
                      ? 'bg-black/30 dark:bg-gray-800/20'
                      : 'bg-gray-50/60 dark:bg-gray-800/40'
                  }`}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                      <Users className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                      Crescimento de Usuários
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">Evolução mensal por tipo de usuário</CardDescription>
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

                <LiquidGlassCard
                  intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
                  className={`group hover:scale-[1.02] transition-all duration-300 hover:shadow-xl border-0 ${
                    isLiquidGlass
                      ? 'bg-black/30 dark:bg-gray-800/20'
                      : 'bg-gray-50/60 dark:bg-gray-800/40'
                  }`}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                      <DollarSign className="h-5 w-5 mr-2 text-emerald-600 dark:text-emerald-400" />
                      Receitas vs Despesas
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">Comparativo financeiro mensal</CardDescription>
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

              {/* Status do Sistema */}
              <LiquidGlassCard
                intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
                className={`group hover:scale-[1.02] transition-all duration-300 hover:shadow-xl border-0 ${
                  isLiquidGlass
                    ? 'bg-black/30 dark:bg-gray-800/20'
                    : 'bg-gray-50/60 dark:bg-gray-800/40'
                }`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                    <Server className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                    Status do Sistema
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Monitoramento de infraestrutura</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sistemaStatus.map((servico, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <Server className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">{servico.nome}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Carga: {servico.carga}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center mb-1">
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              servico.status === "online" ? "bg-green-500" : "bg-red-500"
                            }`} />
                            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                              {servico.uptime}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Uptime</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </LiquidGlassCard>

              {/* Alertas do Sistema */}
              <LiquidGlassCard
                intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
                className={`group hover:scale-[1.02] transition-all duration-300 hover:shadow-xl border-0 ${
                  isLiquidGlass
                    ? 'bg-black/30 dark:bg-gray-800/20'
                    : 'bg-gray-50/60 dark:bg-gray-800/40'
                }`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                    <AlertTriangle className="h-5 w-5 mr-2 text-amber-600 dark:text-amber-400" />
                    Alertas do Sistema
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Notificações importantes que requerem atenção</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {alertas.map((alerta, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-lg ${
                            alerta.resolvido ? "bg-green-500/20" : "bg-amber-500/20"
                          }`}>
                            {alerta.resolvido ? (
                              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            )}
                          </div>
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
                            <p className="text-sm text-gray-900 dark:text-gray-100">{alerta.mensagem}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{alerta.data}</p>
                          </div>
                        </div>
                        <LiquidGlassButton
                          size="sm"
                          variant={alerta.resolvido ? "secondary" : "outline"}
                          className={alerta.resolvido ? "opacity-50" : ""}
                        >
                          {alerta.resolvido ? "Resolvido" : "Resolver"}
                        </LiquidGlassButton>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </LiquidGlassCard>
            </div>

            {/* Conteúdo lateral - ocupa 4 colunas no xl */}
            <div className="xl:col-span-4 space-y-6">
              {/* Atalhos Rápidos */}
              <LiquidGlassCard
                intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
                className={`group hover:scale-[1.02] transition-all duration-300 hover:shadow-xl border-0 ${
                  isLiquidGlass
                    ? 'bg-black/30 dark:bg-gray-800/20'
                    : 'bg-gray-50/60 dark:bg-gray-800/40'
                }`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                    <Target className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                    Atalhos Rápidos
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Acesso rápido às principais funcionalidades</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {atalhos.map((atalho, index) => {
                      const Icon = atalho.icon
                      return (
                        <LiquidGlassButton key={index} variant="outline" className={`w-full justify-start h-auto p-4 ${
                          isLiquidGlass
                            ? 'bg-black/30 dark:bg-gray-800/20 hover:bg-black/50 dark:hover:bg-gray-800/30'
                            : 'bg-gray-50/60 dark:bg-gray-800/40 hover:bg-black/80 dark:hover:bg-gray-800/60'
                        }`}>
                          <div className="flex items-start">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                              atalho.cor === "green" ? "bg-green-500/20" :
                              atalho.cor === "purple" ? "bg-purple-500/20" :
                              atalho.cor === "emerald" ? "bg-emerald-500/20" : "bg-orange-500/20"
                            }`}>
                              <Icon className={`h-4 w-4 ${
                                atalho.cor === "green" ? "text-green-600 dark:text-green-400" :
                                atalho.cor === "purple" ? "text-purple-600 dark:text-purple-400" :
                                atalho.cor === "emerald" ? "text-emerald-600 dark:text-emerald-400" : "text-orange-600 dark:text-orange-400"
                              }`} />
                            </div>
                            <div className="text-left">
                              <p className="font-semibold text-gray-900 dark:text-gray-100">{atalho.titulo}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">{atalho.descricao}</p>
                            </div>
                          </div>
                        </LiquidGlassButton>
                      )
                    })}
                  </div>
                </CardContent>
              </LiquidGlassCard>

              {/* Comunicados */}
              <LiquidGlassCard
                intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
                className={`group hover:scale-[1.02] transition-all duration-300 hover:shadow-xl border-0 ${
                  isLiquidGlass
                    ? 'bg-black/30 dark:bg-gray-800/20'
                    : 'bg-gray-50/60 dark:bg-gray-800/40'
                }`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                    <Bell className="h-5 w-5 mr-2 text-orange-600 dark:text-orange-400" />
                    Comunicados
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Avisos importantes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {comunicados.map((comunicado, index) => (
                      <div key={index} className="p-3 border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 flex-1">
                            {comunicado.titulo}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={comunicado.prioridade === "Alta" ? "destructive" : "secondary"}
                              className="text-xs"
                            >
                              {comunicado.prioridade}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          {comunicado.descricao}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {comunicado.data}
                          </p>
                          <button className="text-xs text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 font-medium transition-colors">
                            Ver mais
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </LiquidGlassCard>

              {/* Ações Rápidas */}
              <LiquidGlassCard
                intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
                className={`group hover:scale-[1.02] transition-all duration-300 hover:shadow-xl border-0 ${
                  isLiquidGlass
                    ? 'bg-black/30 dark:bg-gray-800/20'
                    : 'bg-gray-50/60 dark:bg-gray-800/40'
                }`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                    <Zap className="h-5 w-5 mr-2 text-yellow-600 dark:text-yellow-400" />
                    Ações Rápidas
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Ferramentas de uso frequente</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <LiquidGlassButton variant="outline" className={`justify-start ${
                      isLiquidGlass
                        ? 'bg-black/30 dark:bg-gray-800/20 hover:bg-black/50 dark:hover:bg-gray-800/30'
                        : 'bg-gray-50/60 dark:bg-gray-800/40 hover:bg-black/80 dark:hover:bg-gray-800/60'
                    }`}>
                      <Database className="h-4 w-4 mr-2" />
                      Backup
                    </LiquidGlassButton>
                    <LiquidGlassButton variant="outline" className={`justify-start ${
                      isLiquidGlass
                        ? 'bg-black/30 dark:bg-gray-800/20 hover:bg-black/50 dark:hover:bg-gray-800/30'
                        : 'bg-gray-50/60 dark:bg-gray-800/40 hover:bg-black/80 dark:hover:bg-gray-800/60'
                    }`}>
                      <Shield className="h-4 w-4 mr-2" />
                      Segurança
                    </LiquidGlassButton>
                    <LiquidGlassButton variant="outline" className={`justify-start ${
                      isLiquidGlass
                        ? 'bg-black/30 dark:bg-gray-800/20 hover:bg-black/50 dark:hover:bg-gray-800/30'
                        : 'bg-gray-50/60 dark:bg-gray-800/40 hover:bg-black/80 dark:hover:bg-gray-800/60'
                    }`}>
                      <FileText className="h-4 w-4 mr-2" />
                      Relatórios
                    </LiquidGlassButton>
                    <LiquidGlassButton variant="outline" className={`justify-start ${
                      isLiquidGlass
                        ? 'bg-black/30 dark:bg-gray-800/20 hover:bg-black/50 dark:hover:bg-gray-800/30'
                        : 'bg-gray-50/60 dark:bg-gray-800/40 hover:bg-black/80 dark:hover:bg-gray-800/60'
                    }`}>
                      <Users className="h-4 w-4 mr-2" />
                      Usuários
                    </LiquidGlassButton>
                  </div>
                </CardContent>
              </LiquidGlassCard>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
