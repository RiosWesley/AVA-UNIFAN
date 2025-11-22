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
    totalUsuarios: 110,
    novosUsuarios: 10,
    ticketsSuporte: 2,
  }

  const usuariosData = [
    { mes: "Set", alunos: 80, professores: 42, coordenadores: 8, admins: 3 },
    { mes: "Out", alunos: 90, professores: 43, coordenadores: 8, admins: 3 },
    { mes: "Nov", alunos: 140, professores: 45, coordenadores: 9, admins: 4 },
  ]

  const receitaData = [
    { mes: "Set", receita: 118000, despesas: 85000 },
    { mes: "Out", receita: 122000, despesas: 87000 },
    { mes: "Nov", receita: 125000, despesas: 89000 },
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <LiquidGlassCard
              intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
              className={`group transition-all duration-300 hover:shadow-2xl border border-border/50 hover:border-border/80 ${
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
              className={`group transition-all duration-300 hover:shadow-2xl border border-border/50 hover:border-border/80 ${
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
              className={`group transition-all duration-300 hover:shadow-2xl border border-border/50 hover:border-border/80 ${
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
          <div className="grid grid-cols-1 gap-6">
            {/* Conteúdo principal - ocupa 8 colunas no xl */}
            <div className="xl:col-span-12 space-y-6">
              {/* Gráficos de análise */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LiquidGlassCard
                  intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
                  className={`group transition-all duration-300 hover:shadow-xl border border-border/50 hover:border-border/80 ${
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
                  className={`group transition-all duration-300 hover:shadow-xl border border-border/50 hover:border-border/80 ${
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
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
