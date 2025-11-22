"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/components/layout/sidebar"
import { LiquidGlassCard, LiquidGlassButton } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { BookOpen, Users, Calendar, TrendingUp, GraduationCap, Star, Award, Activity, Sparkles, Bell, ChevronRight, Settings, CheckCircle, Clock, Loader2, AlertCircle, ChevronLeft } from "lucide-react"
import { getCoordinatorDashboardData, type CoordenadorDashboardData } from "@/src/services/coordenador-dashboard"
import { getCurrentUser } from "@/src/services/professor-dashboard"

export default function CoordenadorDashboard() {
  const router = useRouter()
  const [isLiquidGlass, setIsLiquidGlass] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState<CoordenadorDashboardData | null>(null)
  const [cursosPage, setCursosPage] = useState(1)

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

  useEffect(() => {
    let mounted = true

    async function loadDashboardData() {
      try {
        setLoading(true)
        setError(null)

        const user = await getCurrentUser()
        if (!mounted) return

        if (!user?.id) {
          throw new Error('Usuário não autenticado')
        }

        const data = await getCoordinatorDashboardData(user.id)
        if (!mounted) return

        setDashboardData(data)
      } catch (err: any) {
        console.error('Erro ao carregar dados do dashboard:', err)
        setError(err?.message || 'Não foi possível carregar os dados do dashboard.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadDashboardData()

    return () => {
      mounted = false
    }
  }, [])

  // Resetar página quando os cursos mudarem ou ajustar se necessário
  useEffect(() => {
    if (dashboardData?.cursos) {
      const totalPaginas = Math.max(1, Math.ceil(dashboardData.cursos.length / 5))
      if (cursosPage > totalPaginas) {
        setCursosPage(totalPaginas)
      } else if (cursosPage < 1) {
        setCursosPage(1)
      }
    } else {
      setCursosPage(1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardData?.cursos?.length])

  // Preparar dados para renderização
  const cursos = dashboardData?.cursos || []
  const comunicados = dashboardData?.comunicados || []

  // Preparar dados do gráfico de pizza
  const pieData = cursos.map((curso, index) => {
    const colors = ["#15803d", "#84cc16", "#f97316", "#3b82f6", "#8b5cf6", "#ec4899"]
    return {
      name: curso.nome,
      value: curso.alunos,
      color: colors[index % colors.length]
    }
  })

  // Paginação dos cursos
  const cursosPorPagina = 5
  const totalPaginas = Math.max(1, Math.ceil(cursos.length / cursosPorPagina))
  const currentPage = Math.max(1, Math.min(cursosPage, totalPaginas))
  const cursosPaginados = cursos.slice((currentPage - 1) * cursosPorPagina, currentPage * cursosPorPagina)

  if (loading) {
    return (
      <div className={`flex h-screen ${isLiquidGlass ? 'bg-black/30 dark:bg-gray-900/20' : 'bg-background'}`}>
        <Sidebar userRole="coordenador" />
        <main className="flex-1 overflow-y-auto flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            <p className="text-muted-foreground">Carregando dados do dashboard...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex h-screen ${isLiquidGlass ? 'bg-black/30 dark:bg-gray-900/20' : 'bg-background'}`}>
        <Sidebar userRole="coordenador" />
        <main className="flex-1 overflow-y-auto flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4 p-8">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <p className="text-red-600 font-medium">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </main>
      </div>
    )
  }

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
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
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
                    {dashboardData?.totalCursos || 0} cursos ativos
                  </Badge>
                  <Badge variant="outline" className="text-green-600 border-green-200 dark:text-green-400 dark:border-green-800">
                    <Award className="h-3 w-3 mr-1" />
                    {dashboardData?.totalAlunos || 0} alunos
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <LiquidGlassButton 
                variant="outline" 
                size="lg" 
                onClick={() => router.push('/coordenador/grade')}
                className={`backdrop-blur-sm ${
                  isLiquidGlass
                    ? 'bg-black/30 dark:bg-gray-800/20 hover:bg-black/50 dark:hover:bg-gray-800/30'
                    : 'bg-gray-50/60 dark:bg-gray-800/40 hover:bg-black/80 dark:hover:bg-gray-800/60'
                }`}
              >
                <Calendar className="h-5 w-5 mr-2" />
                Montagem de Grade
              </LiquidGlassButton>
            </div>
          </div>

          {/* Cards de estatísticas aprimorados */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <LiquidGlassCard
              intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
              className={`group transition-all duration-300 hover:shadow-2xl border border-border/50 hover:border-border/80 ${
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
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">{dashboardData?.totalCursos || 0}</div>
                <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                  <Activity className="h-3 w-3 mr-1" />
                  {dashboardData?.totalTurmas || 0} turmas ativas
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
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total de Alunos</CardTitle>
                <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                  <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">{dashboardData?.totalAlunos || 0}</div>
                <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {dashboardData?.totalCursos || 0} cursos ativos
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
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">Professores Ativos</CardTitle>
                <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                  <GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">{dashboardData?.totalProfessores || 0}</div>
                <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Professores ativos
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
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">Média Geral</CardTitle>
                <div className="p-2 bg-amber-500/20 rounded-lg group-hover:bg-amber-500/30 transition-colors">
                  <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-2">{(dashboardData?.mediaGeral ?? 0).toFixed(1)}</div>
                <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                  <Award className="h-3 w-3 mr-1" />
                  Média geral dos cursos
                </div>
              </CardContent>
            </LiquidGlassCard>
          </div>

          {/* Layout principal aprimorado */}
          <div className="space-y-6">
            {/* Gráficos - Grid de 12 colunas */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6 items-stretch">
              <div className="xl:col-span-8 space-y-6">
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
                      Distribuição de Alunos
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">Por nível de ensino</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {pieData.length > 0 ? (
                      <>
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
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        Nenhum dado disponível
                      </div>
                    )}
                  </CardContent>
                </LiquidGlassCard>
              </div>

              {/* Conteúdo lateral - ocupa 4 colunas no xl */}
              <div className="xl:col-span-4 flex flex-col">
                {/* Comunicados */}
                <LiquidGlassCard
                  intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
                  className={`group transition-all duration-300 hover:shadow-xl border border-border/50 hover:border-border/80 flex-1 flex flex-col ${
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
                  <CardContent className="flex-1 flex flex-col">
                    {comunicados.length > 0 ? (
                      <div className="space-y-3 flex-1 overflow-y-auto">
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
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                        <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4">
                          <Bell className="h-8 w-8 text-orange-600 dark:text-orange-400 opacity-50" />
                        </div>
                        <p className="text-muted-foreground font-medium mb-2">Nenhum comunicado disponível</p>
                        <p className="text-sm text-muted-foreground/70">Novos avisos aparecerão aqui quando disponíveis</p>
                      </div>
                    )}
                  </CardContent>
                </LiquidGlassCard>
              </div>
            </div>

            {/* Resumo dos Cursos - Largura total */}
            <div className="w-full">
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
                    <BookOpen className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                    Resumo dos Cursos
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Informações gerais por curso</CardDescription>
                </CardHeader>
                <CardContent>
                  {cursos.length > 0 ? (
                    <>
                      <div className="space-y-4">
                        {cursosPaginados.map((curso) => (
                          <div key={curso.id} className="p-4 border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
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
                      {totalPaginas > 1 && (
                        <div key={`pagination-${currentPage}`} className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                          <div className="flex items-center space-x-2">
                            <LiquidGlassButton
                              variant="outline"
                              size="sm"
                              onClick={() => setCursosPage(prev => Math.max(1, prev - 1))}
                              disabled={currentPage === 1}
                              className={currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}
                            >
                              <ChevronLeft className="h-4 w-4 mr-1" />
                              Anterior
                            </LiquidGlassButton>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Página {currentPage} de {totalPaginas}
                            </span>
                            <LiquidGlassButton
                              variant="outline"
                              size="sm"
                              onClick={() => setCursosPage(prev => Math.min(totalPaginas, prev + 1))}
                              disabled={currentPage === totalPaginas}
                              className={currentPage === totalPaginas ? 'opacity-50 cursor-not-allowed' : ''}
                            >
                              Próxima
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </LiquidGlassButton>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Mostrando {cursosPaginados.length} de {cursos.length} cursos
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                      Nenhum curso encontrado
                    </div>
                  )}
                </CardContent>
              </LiquidGlassCard>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
