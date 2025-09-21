"use client"

import { useState, useEffect } from "react"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/components/layout/sidebar"
import { LiquidGlassCard, LiquidGlassButton } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { BookOpen, Users, Calendar, TrendingUp, GraduationCap, Star, Award, Activity, Target, Sparkles, Bell, ChevronRight, Settings, AlertCircle, CheckCircle, Clock } from "lucide-react"

export default function CoordenadorDashboard() {
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

  const cursos = [
    {
      nome: "Ensino Fundamental I",
      turmas: 8,
      alunos: 240,
      professores: 12,
      media: 8.2,
      status: "Excelente",
      cor: "emerald"
    },
    {
      nome: "Ensino Fundamental II",
      turmas: 12,
      alunos: 360,
      professores: 18,
      media: 7.8,
      status: "Bom",
      cor: "green"
    },
    {
      nome: "Ensino Médio",
      turmas: 9,
      alunos: 270,
      professores: 15,
      media: 7.5,
      status: "Atenção",
      cor: "orange"
    },
  ]

  const desempenhoData = [
    { curso: "Fund. I", media: 8.2, frequencia: 95 },
    { curso: "Fund. II", media: 7.8, frequencia: 92 },
    { curso: "Médio", media: 7.5, frequencia: 89 },
  ]

  const professoresDisponibilidade = [
    {
      nome: "Prof. Ana Santos",
      disciplina: "Português",
      disponivel: true,
      carga: "20h/sem",
      especialidade: "Linguística",
      avaliacao: 4.8
    },
    {
      nome: "Prof. Carlos Silva",
      disciplina: "Matemática",
      disponivel: false,
      carga: "24h/sem",
      especialidade: "Álgebra",
      avaliacao: 4.9
    },
    {
      nome: "Prof. Maria Costa",
      disciplina: "História",
      disponivel: true,
      carga: "18h/sem",
      especialidade: "História Antiga",
      avaliacao: 4.6
    },
    {
      nome: "Prof. João Oliveira",
      disciplina: "Física",
      disponivel: true,
      carga: "22h/sem",
      especialidade: "Mecânica",
      avaliacao: 4.7
    },
  ]

  const pieData = [
    { name: "Fund. I", value: 240, color: "#15803d" },
    { name: "Fund. II", value: 360, color: "#84cc16" },
    { name: "Médio", value: 270, color: "#f97316" },
  ]

  const eventosProximos = [
    {
      titulo: "Reunião Pedagógica",
      data: "Hoje, 14:00",
      tipo: "Reunião",
      prioridade: "Alta"
    },
    {
      titulo: "Entrega de Notas",
      data: "Amanhã, 17:00",
      tipo: "Prazo",
      prioridade: "Média"
    },
    {
      titulo: "Planejamento Anual",
      data: "15/01/2025",
      tipo: "Planejamento",
      prioridade: "Baixa"
    }
  ]

  const comunicados = [
    {
      titulo: "Nova diretriz do MEC",
      descricao: "Atualização nas normas de avaliação",
      data: "Hoje, 09:00",
      prioridade: "Alta"
    },
    {
      titulo: "Manutenção no sistema",
      descricao: "Sistema indisponível das 22h às 06h",
      data: "Sábado, 22:00",
      prioridade: "Média"
    }
  ]

  return (
    <div className={`flex h-screen ${isLiquidGlass ? 'bg-black/30 dark:bg-gray-900/20' : 'bg-background'}`}>
      <Sidebar userRole="coordenador" />

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
                <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                  Painel de Coordenação
                </h1>
                <p className="text-muted-foreground text-lg mt-1">
                  Visão geral dos cursos e desempenho acadêmico
                </p>
                <div className="flex items-center mt-2 space-x-2">
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                    <Star className="h-3 w-3 mr-1" />
                    {cursos.length} cursos ativos
                  </Badge>
                  <Badge variant="outline" className="text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-800">
                    <Award className="h-3 w-3 mr-1" />
                    870 alunos
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
                <Calendar className="h-5 w-5 mr-2" />
                Montagem de Grade
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <LiquidGlassCard
              intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
              className={`group hover:scale-105 transition-all duration-300 hover:shadow-2xl border-0 ${
                isLiquidGlass
                  ? 'bg-black/30 dark:bg-gray-800/20'
                  : 'bg-gray-50/60 dark:bg-gray-800/40'
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total de Cursos</CardTitle>
                <div className="p-2 bg-emerald-500/20 rounded-lg group-hover:bg-emerald-500/30 transition-colors">
                  <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">3</div>
                <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                  <Activity className="h-3 w-3 mr-1" />
                  29 turmas ativas
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
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total de Alunos</CardTitle>
                <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">870</div>
                <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +15 novos este mês
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
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">Professores Ativos</CardTitle>
                <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                  <GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">45</div>
                <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  3 disponíveis para novas turmas
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
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">Média Geral</CardTitle>
                <div className="p-2 bg-amber-500/20 rounded-lg group-hover:bg-amber-500/30 transition-colors">
                  <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-2">7.8</div>
                <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                  <Award className="h-3 w-3 mr-1" />
                  +0.1 desde o último bimestre
                </div>
              </CardContent>
            </LiquidGlassCard>
          </div>

          {/* Layout principal aprimorado */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6">
            {/* Conteúdo principal - ocupa 8 colunas no xl */}
            <div className="xl:col-span-8 space-y-6">
              {/* Gráficos de desempenho */}
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
                      <TrendingUp className="h-5 w-5 mr-2 text-emerald-600 dark:text-emerald-400" />
                      Desempenho por Curso
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">Média e frequência dos cursos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={desempenhoData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="curso" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="media" fill="#15803d" name="Média" />
                        <Bar dataKey="frequencia" fill="#84cc16" name="Frequência %" />
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
                      <Users className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                      Distribuição de Alunos
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">Por nível de ensino</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2">
                      {pieData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                            <span className="text-sm text-gray-900 dark:text-gray-100">{item.name}</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </LiquidGlassCard>
              </div>

              {/* Resumo dos Cursos */}
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
                    <BookOpen className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                    Resumo dos Cursos
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Informações gerais por curso</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cursos.map((curso, index) => (
                      <div key={index} className="p-4 border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                              curso.cor === "emerald" ? "bg-emerald-600" :
                              curso.cor === "green" ? "bg-green-600" : "bg-orange-600"
                            }`}>
                              <BookOpen className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100">{curso.nome}</h4>
                              <div className="flex items-center mt-1">
                                <Badge
                                  variant={curso.status === "Excelente" ? "default" : curso.status === "Bom" ? "secondary" : "outline"}
                                  className="text-xs mr-2"
                                >
                                  {curso.status}
                                </Badge>
                                <span className="text-xs text-green-600 dark:text-green-400">
                                  Média: {curso.media}
                                </span>
                              </div>
                            </div>
                          </div>
                          <LiquidGlassButton size="sm" variant="outline">
                            Gerenciar
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </LiquidGlassButton>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">Turmas</p>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{curso.turmas}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">Alunos</p>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{curso.alunos}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">Professores</p>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{curso.professores}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </LiquidGlassCard>

              {/* Eventos Próximos */}
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
                    <Calendar className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                    Eventos Próximos
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Compromissos e prazos importantes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {eventosProximos.map((evento, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-lg ${
                            evento.tipo === "Reunião" ? "bg-blue-500/20" :
                            evento.tipo === "Prazo" ? "bg-amber-500/20" : "bg-green-500/20"
                          }`}>
                            <Clock className={`h-5 w-5 ${
                              evento.tipo === "Reunião" ? "text-blue-600 dark:text-blue-400" :
                              evento.tipo === "Prazo" ? "text-amber-600 dark:text-amber-400" : "text-green-600 dark:text-green-400"
                            }`} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">{evento.titulo}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{evento.tipo}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              evento.prioridade === "Alta"
                                ? "destructive"
                                : evento.prioridade === "Média"
                                  ? "secondary"
                                  : "outline"
                            }
                            className="mb-1"
                          >
                            {evento.prioridade}
                          </Badge>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{evento.data}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </LiquidGlassCard>
            </div>

            {/* Conteúdo lateral - ocupa 4 colunas no xl */}
            <div className="xl:col-span-4 space-y-6">
              {/* Disponibilidade dos Professores */}
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
                    <Users className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                    Disponibilidade dos Professores
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Status atual da equipe docente</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {professoresDisponibilidade.map((professor, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                            <Users className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">{professor.nome}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{professor.disciplina}</p>
                            <div className="flex items-center mt-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400">{professor.especialidade}</span>
                              <span className="text-xs text-yellow-600 dark:text-yellow-400 ml-2">
                                ⭐ {professor.avaliacao}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={professor.disponivel ? "default" : "secondary"} className="mb-1">
                            {professor.disponivel ? "Disponível" : "Ocupado"}
                          </Badge>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{professor.carga}</p>
                        </div>
                      </div>
                    ))}
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
                          <button className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium transition-colors">
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
                    <Target className="h-5 w-5 mr-2 text-emerald-600 dark:text-emerald-400" />
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
                      <BookOpen className="h-4 w-4 mr-2" />
                      Novo Curso
                    </LiquidGlassButton>
                    <LiquidGlassButton variant="outline" className={`justify-start ${
                      isLiquidGlass
                        ? 'bg-black/30 dark:bg-gray-800/20 hover:bg-black/50 dark:hover:bg-gray-800/30'
                        : 'bg-gray-50/60 dark:bg-gray-800/40 hover:bg-black/80 dark:hover:bg-gray-800/60'
                    }`}>
                      <Users className="h-4 w-4 mr-2" />
                      Alocar Professor
                    </LiquidGlassButton>
                    <LiquidGlassButton variant="outline" className={`justify-start ${
                      isLiquidGlass
                        ? 'bg-black/30 dark:bg-gray-800/20 hover:bg-black/50 dark:hover:bg-gray-800/30'
                        : 'bg-gray-50/60 dark:bg-gray-800/40 hover:bg-black/80 dark:hover:bg-gray-800/60'
                    }`}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Reunião
                    </LiquidGlassButton>
                    <LiquidGlassButton variant="outline" className={`justify-start ${
                      isLiquidGlass
                        ? 'bg-black/30 dark:bg-gray-800/20 hover:bg-black/50 dark:hover:bg-gray-800/30'
                        : 'bg-gray-50/60 dark:bg-gray-800/40 hover:bg-black/80 dark:hover:bg-gray-800/60'
                    }`}>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Relatórios
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
