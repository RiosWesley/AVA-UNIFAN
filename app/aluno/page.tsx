"use client"

import { useState, useEffect } from "react"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LiquidGlassButton } from "@/components/liquid-glass"
import { Progress } from "@/components/ui/progress"
import { Sidebar } from "@/components/layout/sidebar"
import { LiquidGlassCard } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { Bell, Calendar, Clock, DollarSign, FileText, GraduationCap, TrendingUp, Star, Target, Activity, Sparkles } from "lucide-react"
import Carousel from "@/components/ui/carousel"
import { useDashboardData } from "@/hooks/use-dashboard"

export default function AlunoDashboard() {
  const [isLiquidGlass, setIsLiquidGlass] = useState(false)

  // Mock student ID - TODO: Get from authentication context
  const studentId = "1"

  // Dashboard data with React Query
  const {
    student,
    upcomingSchedules,
    recentGrades,
    news,
    attendancePercentage,
    gradeAverage,
    pendingActivitiesCount,
    isLoading,
    error
  } = useDashboardData(studentId)

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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar userRole="aluno" />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar userRole="aluno" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Erro ao carregar dados</h2>
            <p className="text-gray-600">Tente novamente em alguns minutos</p>
          </div>
        </div>
      </div>
    )
  }

  const carouselImages = [
    { src: "/placeholder.jpg", alt: "Aviso 1" },
    { src: "/placeholder-user.jpg", alt: "Aviso 2" },
    { src: "/placeholder-logo.png", alt: "Aviso 3" },
  ]

  
  return (
    <div className={`flex h-screen ${isLiquidGlass ? 'bg-gray-50/30 dark:bg-gray-900/20' : 'bg-background'}`}>
      <Sidebar userRole="aluno" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header com gradiente e animações */}
          <div className={`flex items-center justify-between mb-8 p-6 rounded-2xl border backdrop-blur-sm ${
            isLiquidGlass
              ? 'bg-black/30 dark:bg-gray-800/20 border-gray-200/30 dark:border-gray-700/50'
              : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
          }`}>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-green-600 dark:text-green-400">
                  Bem-vindo, {student?.name || 'Aluno'}!
                </h1>
                <p className="text-muted-foreground text-lg mt-1">
                  Aqui está um resumo das suas atividades acadêmicas
                </p>
                <div className="flex items-center mt-2 space-x-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                    <Activity className="h-3 w-3 mr-1" />
                    Ativo
                  </Badge>
                  <Badge variant="outline" className="text-green-600 border-green-200 dark:text-green-400 dark:border-green-800">
                    <Target className="h-3 w-3 mr-1" />
                    Meta: 9.0
                  </Badge>
                </div>
              </div>
            </div>
            <LiquidGlassButton
              variant="outline"
              size="lg"
              className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/30 transition-all duration-300"
            >
              <Bell className="h-5 w-5 mr-2 text-green-600" />
              <span className="font-semibold">3 Notificações</span>
            </LiquidGlassButton>
          </div>

          {/* Mural de Avisos (Carrossel) */}
          <div className="mb-8">
            <Carousel
              images={carouselImages}
              heightClass="h-120 md:h-125 lg:h-140"
              className={isLiquidGlass ? "bg-black/20" : "bg-white/50 dark:bg-gray-800/50"}
            />
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
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">Frequência Geral</CardTitle>
                <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">{attendancePercentage}%</div>
                <Progress value={attendancePercentage} className="h-2 mb-2" />
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {attendancePercentage >= 90 ? 'Excelente participação!' :
                   attendancePercentage >= 75 ? 'Boa participação!' :
                   'Atenção à frequência!'}
                </p>
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
                <div className="p-2 bg-emerald-500/20 rounded-lg group-hover:bg-emerald-500/30 transition-colors">
                  <GraduationCap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">{gradeAverage}</div>
                <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {gradeAverage >= 9 ? 'Excelente desempenho!' :
                   gradeAverage >= 8 ? 'Ótimo desempenho!' :
                   gradeAverage >= 7 ? 'Bom desempenho!' :
                   'Pode melhorar!'}
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
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">Atividades</CardTitle>
                <div className="p-2 bg-amber-500/20 rounded-lg group-hover:bg-amber-500/30 transition-colors">
                  <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-2">{pendingActivitiesCount}</div>
                <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                  <Target className="h-3 w-3 mr-1" />
                  {pendingActivitiesCount === 0 ? 'Nenhuma pendente!' :
                   pendingActivitiesCount === 1 ? '1 atividade pendente' :
                   `${pendingActivitiesCount} atividades pendentes`}
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
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">Financeiro</CardTitle>
                <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                  <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">✓</div>
                <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                  <Clock className="h-3 w-3 mr-1" />
                  Vence em 15 dias
                </div>
              </CardContent>
            </LiquidGlassCard>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6">
            <div className="md:col-span-1 xl:col-span-8 space-y-6">
              {/* Próximas Aulas */}
              <LiquidGlassCard
                intensity={LIQUID_GLASS_DEFAULT_INTENSITY}  // Fixed to correct type for max blur
                className={`
                  ${
                    isLiquidGlass
                      ? 'bg-black/30 dark:bg-gray-800/20'
                      : 'bg-gray-50/60 dark:bg-gray-800/40'
                  }
                `}
              >
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <div className="p-2 bg-green-500/20 rounded-lg mr-3">
                      <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    Próximas Aulas
                  </CardTitle>
                  <CardDescription className="text-base">Suas aulas de hoje e próximas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingSchedules && upcomingSchedules.length > 0 ? (
                      upcomingSchedules.map((aula) => (
                        <div key={aula.id} className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-300 hover:shadow-lg backdrop-blur-lg ${
                          isLiquidGlass
                            ? 'bg-transparent/50 hover:bg-white/15 dark:hover:bg-gray-800/15 border-green-200/40 dark:border-green-800/40'
                            : 'bg-white/70 dark:bg-gray-800/70 border-green-200/60 dark:border-green-800/60 hover:bg-white/90 dark:hover:bg-gray-800/90'
                        }`}>
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100">{aula.discipline}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{aula.professor}</p>
                              <div className="flex items-center mt-1">
                                <Badge variant="outline" className="text-xs mr-2">
                                  {aula.type}
                                </Badge>
                                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                                  Próxima
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {aula.startTime} - {aula.endTime}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{aula.room}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">Nenhuma aula agendada</p>
                    )}
                  </div>
                </CardContent>
              </LiquidGlassCard>

              {/* Últimas Notas */}
              <LiquidGlassCard
                intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
                className={`${
                  isLiquidGlass
                    ? 'bg-black/30 dark:bg-gray-800/20'
                    : 'bg-gray-50/60 dark:bg-gray-800/40'
                }`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <div className="p-2 bg-green-500/20 rounded-lg mr-3">
                      <GraduationCap className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    Últimas Notas
                  </CardTitle>
                  <CardDescription className="text-base">Suas avaliações recentes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentGrades && recentGrades.length > 0 ? (
                      recentGrades.map((nota) => (
                        <div key={nota.id} className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                          isLiquidGlass
                            ? 'bg-transparent hover:bg-white/10 dark:hover:bg-gray-800/10 border-green-200/30 dark:border-green-800/30'
                            : 'bg-white/60 dark:bg-gray-800/60 border-green-200/50 dark:border-green-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80'
                        }`}>
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              nota.value >= 9 ? "bg-green-500/20" :
                              nota.value >= 8 ? "bg-green-500/20" :
                              nota.value >= 6 ? "bg-yellow-500/20" : "bg-red-500/20"
                            }`}>
                              <span className="text-lg font-bold text-gray-700 dark:text-gray-300">
                                {nota.value}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-gray-100">{nota.discipline}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(nota.date).toLocaleDateString('pt-BR')}
                              </p>
                              <Badge
                                variant="outline"
                                className={`text-xs mt-1 ${
                                  nota.value >= 9 ? "border-green-500 text-green-700 dark:text-green-300" :
                                  nota.value >= 8 ? "border-green-500 text-green-700 dark:text-green-300" :
                                  nota.value >= 6 ? "border-yellow-500 text-yellow-700 dark:text-yellow-300" :
                                  "border-red-500 text-red-700 dark:text-red-300"
                                }`}
                              >
                                {nota.concept}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-semibold ${
                              nota.value >= 9 ? "text-green-600 dark:text-green-400" :
                              nota.value >= 8 ? "text-green-600 dark:text-green-400" :
                              nota.value >= 6 ? "text-yellow-600 dark:text-yellow-400" :
                              "text-red-600 dark:text-red-400"
                            }`}>
                              {nota.value}/10
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">Nenhuma nota disponível</p>
                    )}
                  </div>
                </CardContent>
              </LiquidGlassCard>

            </div>

            <div className="md:col-span-1 xl:col-span-4 space-y-6">
              {/* Comunicados */}
              <LiquidGlassCard
                intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
                className={`${
                  isLiquidGlass
                    ? 'bg-black/30 dark:bg-gray-800/20'
                    : 'bg-gray-50/60 dark:bg-gray-800/40'
                }`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <div className="p-2 bg-red-500/20 rounded-lg mr-3">
                      <Bell className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    Comunicados
                  </CardTitle>
                  <CardDescription className="text-base">Avisos importantes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {news && news.length > 0 ? (
                      news.map((comunicado) => (
                        <div key={comunicado.id} className={`group p-4 rounded-xl border transition-all duration-300 hover:shadow-lg ${
                          isLiquidGlass
                            ? (comunicado.priority === "alta"
                                ? "bg-transparent border-red-200/30 dark:border-red-800/30 hover:bg-white/10 dark:hover:bg-gray-800/10"
                                : comunicado.priority === "média"
                                  ? "bg-transparent border-orange-200/30 dark:border-orange-800/30 hover:bg-white/10 dark:hover:bg-gray-800/10"
                                  : "bg-transparent border-green-200/30 dark:border-green-800/30 hover:bg-white/10 dark:hover:bg-gray-800/10")
                            : (comunicado.priority === "alta"
                                ? "bg-red-50/60 dark:bg-red-950/30 border-red-200 dark:border-red-800"
                                : comunicado.priority === "média"
                                  ? "bg-orange-50/60 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800"
                                  : "bg-green-50/60 dark:bg-green-950/30 border-green-200 dark:border-green-800")
                        }`}>
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 flex-1">
                              {comunicado.title}
                            </h4>
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  comunicado.priority === "alta"
                                    ? "border-red-500 text-red-700 dark:text-red-300"
                                    : comunicado.priority === "média"
                                      ? "border-orange-500 text-orange-700 dark:text-orange-300"
                                      : "border-green-500 text-green-700 dark:text-green-300"
                                }`}
                              >
                                {comunicado.type}
                              </Badge>
                              <div className={`w-2 h-2 rounded-full ${
                                comunicado.priority === "alta" ? "bg-red-500" :
                                comunicado.priority === "média" ? "bg-orange-500" : "bg-green-500"
                              } animate-pulse`}></div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(comunicado.date).toLocaleDateString('pt-BR')}
                            </p>
                            <button className="text-xs text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 font-medium transition-colors">
                              Ver mais
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">Nenhum comunicado</p>
                    )}
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
