"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/components/layout/sidebar"
import { LiquidGlassCard, LiquidGlassButton } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { BookOpen, Calendar, FileText, Users, CheckCircle, Star, Award, Clock, GraduationCap, Activity, Target, Sparkles, Bell, ChevronRight, Play } from "lucide-react"
import Carousel from "@/components/ui/carousel"
import { useMemo } from "react"
import { getTeacherClassesWithDetails, getTeacherActivitiesAggregated, getTeacherNotices, buildAgendaSemanalFromClasses, buildProximasAulasFromClasses, buildTurmasData, calculateStats, getCurrentUser, getSemestresDisponiveisProfessor } from "@/src/services/professor-dashboard"
import api from "@/src/services/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { getMurals } from "@/src/services/muralsService"

export default function ProfessorDashboard() {
  const router = useRouter()
  const [isLiquidGlass, setIsLiquidGlass] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<{ id: string; name?: string } | null>(null)

  const [turmas, setTurmas] = useState<any[]>([])
  const [agendaSemanal, setAgendaSemanal] = useState<any[]>([])
  const [atividades, setAtividades] = useState<any[]>([])
  const [proximasAulas, setProximasAulas] = useState<any[]>([])
  const [comunicados, setComunicados] = useState<any[]>([])
  const [stats, setStats] = useState({ totalTurmas: 0, totalAlunos: 0, aulasHoje: 0, atividadesPendentes: 0, corrigindo: 0 })
  const [activitiesPage, setActivitiesPage] = useState(1)
  const ACTIVITIES_PAGE_SIZE = 5
  const [turmasPage, setTurmasPage] = useState(1)
  const TURMAS_PAGE_SIZE = 5
  const [comunicadosPage, setComunicadosPage] = useState(1)
  const COMUNICADOS_PAGE_SIZE = 5
  const [semestreSelecionado, setSemestreSelecionado] = useState<string>("")
  const [semestres, setSemestres] = useState<Array<{ id: string; nome: string; ativo: boolean }>>([])
  const [allClasses, setAllClasses] = useState<any[]>([])
  const [carouselImages, setCarouselImages] = useState<Array<{ src: string; alt: string }>>([])

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
    async function loadData() {
      try {
        setLoading(true)
        setError(null)
        
        // Verificar token de autenticação
        const token = typeof window !== "undefined" ? localStorage.getItem("ava:token") : null
        if (!token) {
          router.push("/")
          return
        }
        
        // Buscar usuário atual
        const user = await getCurrentUser()
        if (!mounted || !user?.id) {
          router.push("/")
          return
        }
        
        const teacherId = user.id
        setCurrentUser({ id: teacherId, name: user.name || 'Professor' })

        // Buscar semestres disponíveis
        const semestresDisponiveis = await getSemestresDisponiveisProfessor(teacherId)
        setSemestres(semestresDisponiveis)
        
        // Selecionar semestre ativo ou o primeiro disponível
        const semestreAtivo = semestresDisponiveis.find(s => s.ativo)
        if (semestreAtivo) {
          setSemestreSelecionado(semestreAtivo.id)
        } else if (semestresDisponiveis.length > 0) {
          setSemestreSelecionado(semestresDisponiveis[0].id)
        }

        const classes = await getTeacherClassesWithDetails(teacherId)
        if (!mounted) return
        
        setAllClasses(classes)
      } catch (e: any) {
        if (mounted) {
          router.push("/")
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadData()
    return () => {
      mounted = false
    }
  }, [router])

  // Filtrar classes por semestre e atualizar dados derivados
  useEffect(() => {
    if (allClasses.length === 0) return

    const classesFiltradas = semestreSelecionado
      ? allClasses.filter(classe => {
          const periodo = classe.semestre
          const periodoNormalizado = periodo?.replace('-', '.')
          const semestreNormalizado = semestreSelecionado.replace('-', '.')
          return periodoNormalizado === semestreNormalizado
        })
      : allClasses

    const turmasData = buildTurmasData(classesFiltradas)
    const agenda = buildAgendaSemanalFromClasses(classesFiltradas)
    const proximas = buildProximasAulasFromClasses(classesFiltradas)
    setTurmas(turmasData)
    setTurmasPage(1)
    setAgendaSemanal(agenda)
    setProximasAulas(proximas)

    // Atualizar atividades e estatísticas
    getTeacherActivitiesAggregated(classesFiltradas).then(atividadesAgg => {
      setAtividades(atividadesAgg)
      setActivitiesPage(1)
      const s = calculateStats(classesFiltradas, atividadesAgg)
      setStats(s)
    })
  }, [allClasses, semestreSelecionado])

  useEffect(() => {
    // Garante que a página atual seja válida quando o total muda
    const maxPage = Math.max(1, Math.ceil((atividades?.length || 0) / ACTIVITIES_PAGE_SIZE))
    if (activitiesPage > maxPage) {
      setActivitiesPage(maxPage)
    }
  }, [atividades, activitiesPage])

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil((turmas?.length || 0) / TURMAS_PAGE_SIZE))
    if (turmasPage > maxPage) {
      setTurmasPage(maxPage)
    }
  }, [turmas, turmasPage])

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil((comunicados?.length || 0) / COMUNICADOS_PAGE_SIZE))
    if (comunicadosPage > maxPage) {
      setComunicadosPage(maxPage)
    }
  }, [comunicados, comunicadosPage])

  // Buscar imagens do mural
  useEffect(() => {
    const carregarMural = async () => {
      try {
        const murais = await getMurals('professor')
        const imagensAtivas = murais
          .filter(m => m.isActive)
          .map(m => ({
            src: m.imageUrl,
            alt: m.title
          }))
        setCarouselImages(imagensAtivas)
      } catch (error) {
        console.error("Erro ao carregar mural:", error)
        // Fallback para imagens padrão em caso de erro
        setCarouselImages([
          { src: "/placeholder.jpg", alt: "Aviso 1" },
          { src: "/placeholder-user.jpg", alt: "Aviso 2" },
          { src: "/placeholder-logo.png", alt: "Aviso 3" },
        ])
      }
    }
    carregarMural()
  }, [])

  const paginatedAtividades = useMemo(() => {
    const start = (activitiesPage - 1) * ACTIVITIES_PAGE_SIZE
    const end = start + ACTIVITIES_PAGE_SIZE
    return (atividades || []).slice(start, end)
  }, [atividades, activitiesPage])

  const totalActivityPages = useMemo(
    () => Math.max(1, Math.ceil((atividades?.length || 0) / ACTIVITIES_PAGE_SIZE)),
    [atividades]
  )

  const paginatedTurmas = useMemo(() => {
    const start = (turmasPage - 1) * TURMAS_PAGE_SIZE
    const end = start + TURMAS_PAGE_SIZE
    return (turmas || []).slice(start, end)
  }, [turmas, turmasPage])

  const totalTurmasPages = useMemo(
    () => Math.max(1, Math.ceil((turmas?.length || 0) / TURMAS_PAGE_SIZE)),
    [turmas]
  )

  const paginatedComunicados = useMemo(() => {
    const start = (comunicadosPage - 1) * COMUNICADOS_PAGE_SIZE
    const end = start + COMUNICADOS_PAGE_SIZE
    return (comunicados || []).slice(start, end)
  }, [comunicados, comunicadosPage])

  const totalComunicadosPages = useMemo(
    () => Math.max(1, Math.ceil((comunicados?.length || 0) / COMUNICADOS_PAGE_SIZE)),
    [comunicados]
  )

  if (loading) {
    return (
      <div className={`flex h-screen ${isLiquidGlass ? 'bg-black/30 dark:bg-gray-900/20' : 'bg-background'}`}>
        <Sidebar userRole="professor" />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            {/* Skeleton do Header */}
            <div className={`flex items-center justify-between mb-8 p-6 rounded-2xl border backdrop-blur-sm ${
              isLiquidGlass
                ? 'bg-black/30 dark:bg-gray-800/20 border-gray-200/30 dark:border-gray-700/50'
                : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
            }`}>
              <div className="flex items-center space-x-4">
                <Skeleton className="w-16 h-16 rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-10 w-64" />
                  <Skeleton className="h-5 w-80" />
                  <div className="flex gap-2 mt-2">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-10 w-40" />
                </div>
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-40" />
              </div>
            </div>

            {/* Skeleton do Carrossel */}
            <div className="mb-8">
              <Skeleton className="h-96 w-full rounded-xl" />
            </div>

            {/* Skeleton dos Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <LiquidGlassCard key={i} intensity={LIQUID_GLASS_DEFAULT_INTENSITY} className={isLiquidGlass ? 'bg-black/30 dark:bg-gray-800/20' : 'bg-gray-50/60 dark:bg-gray-800/40'}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-9 w-9 rounded-lg" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </CardContent>
                </LiquidGlassCard>
              ))}
            </div>

            {/* Skeleton do Layout Principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6">
              <div className="xl:col-span-8 space-y-6">
                <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY} className={isLiquidGlass ? 'bg-black/30 dark:bg-gray-800/20' : 'bg-gray-50/60 dark:bg-gray-800/40'}>
                  <CardHeader>
                    <Skeleton className="h-6 w-40 mb-2" />
                    <Skeleton className="h-4 w-64" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="p-4 border rounded-xl space-y-2">
                          <Skeleton className="h-5 w-48" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </LiquidGlassCard>

                <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY} className={isLiquidGlass ? 'bg-black/30 dark:bg-gray-800/20' : 'bg-gray-50/60 dark:bg-gray-800/40'}>
                  <CardHeader>
                    <Skeleton className="h-6 w-40 mb-2" />
                    <Skeleton className="h-4 w-64" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                          <Skeleton className="h-12 w-12 rounded-lg" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </LiquidGlassCard>
              </div>

              <div className="xl:col-span-4 space-y-6">
                <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY} className={isLiquidGlass ? 'bg-black/30 dark:bg-gray-800/20' : 'bg-gray-50/60 dark:bg-gray-800/40'}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-48" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-lg" />
                          <div className="flex-1 space-y-1">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-3 w-2/3" />
                          </div>
                        </div>
                      ))}
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

  if (error) {
    return (
      <div className={`flex h-screen ${isLiquidGlass ? 'bg-black/30 dark:bg-gray-900/20' : 'bg-background'}`}>
        <Sidebar userRole="professor" />
        <main className="flex-1 overflow-y-auto flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className={`flex h-screen ${isLiquidGlass ? 'bg-black/30 dark:bg-gray-900/20' : 'bg-background'}`}>
      <Sidebar userRole="professor" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6 lg:p-8">
          {/* Header aprimorado */}
          <div className={`flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6 lg:mb-8 p-4 md:p-6 rounded-2xl border backdrop-blur-sm gap-4 ${
            isLiquidGlass
              ? 'bg-black/30 dark:bg-gray-800/20 border-gray-200/30 dark:border-gray-700/50'
              : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
          }`}>
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <GraduationCap className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                  <Sparkles className="h-2.5 w-2.5 md:h-3 md:w-3 text-white" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-green-600 dark:text-green-400 truncate">
                  Olá, {currentUser?.name ? `Prof. ${currentUser.name}` : 'Professor(a)'}!
                </h1>
                <p className="text-muted-foreground text-sm md:text-base lg:text-lg mt-1">
                  Gerencie suas turmas e atividades
                </p>
                <div className="flex items-center mt-2 flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 text-xs md:text-sm">
                    <Star className="h-3 w-3 mr-1" />
                    {turmas.length} turmas ativas
                  </Badge>
                  <Badge variant="outline" className="text-green-600 border-green-200 dark:text-green-400 dark:border-green-800 text-xs md:text-sm">
                    <Award className="h-3 w-3 mr-1" />
                    Média geral: 8.2
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full md:w-auto">
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-4 w-4 md:h-5 md:w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                {loading || semestres.length === 0 ? (
                  <Skeleton className="h-10 w-full sm:w-40" />
                ) : (
                  <Select value={semestreSelecionado} onValueChange={setSemestreSelecionado}>
                    <SelectTrigger className={`w-full sm:w-40 backdrop-blur-sm ${
                      isLiquidGlass
                        ? 'bg-black/30 dark:bg-gray-800/20 border-gray-200/30 dark:border-gray-700/50'
                        : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
                    }`}>
                      <SelectValue placeholder="Selecionar semestre" />
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border-gray-200/30 dark:border-gray-700/50">
                      {semestres.map((semestre) => (
                        <SelectItem key={semestre.id} value={semestre.id}>
                          <div className="flex items-center space-x-2">
                            <span>{semestre.nome}</span>
                            {semestre.ativo && (
                              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 text-xs">
                                Atual
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <LiquidGlassButton variant="outline" size="lg" className={`backdrop-blur-sm w-full sm:w-auto ${
                isLiquidGlass
                  ? 'bg-black/30 dark:bg-gray-800/20 hover:bg-black/50 dark:hover:bg-gray-800/30'
                  : 'bg-gray-50/60 dark:bg-gray-800/40 hover:bg-black/80 dark:hover:bg-gray-800/60'
              }`}>
                <FileText className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                <span className="text-sm md:text-base">Lançar Notas</span>
              </LiquidGlassButton>
              <LiquidGlassButton variant="outline" size="lg" className={`backdrop-blur-sm w-full sm:w-auto ${
                isLiquidGlass
                  ? 'bg-black/30 dark:bg-gray-800/20 hover:bg-black/50 dark:hover:bg-gray-800/30'
                  : 'bg-gray-50/60 dark:bg-gray-800/40 hover:bg-black/80 dark:hover:bg-gray-800/60'
              }`}>
                <CheckCircle className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                <span className="text-sm md:text-base">Registrar Frequência</span>
              </LiquidGlassButton>
            </div>
          </div>

          {/* Mural de Avisos (Carrossel) */}
          <div className="mb-4 md:mb-6 lg:mb-8">
            <Carousel
              images={carouselImages}
              heightClass="h-120 md:h-125 lg:h-140"
              className={isLiquidGlass ? "bg-black/20" : "bg-white/50 dark:bg-gray-800/50"}
            />
          </div>

          {/* Cards de estatísticas aprimorados */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6 lg:mb-8">
            <LiquidGlassCard
              intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
              className={`group transition-all duration-300 hover:shadow-2xl border border-border/50 hover:border-border/80 ${
                isLiquidGlass
                  ? 'bg-black/30 dark:bg-gray-800/20'
                  : 'bg-gray-50/60 dark:bg-gray-800/40'
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total de Turmas</CardTitle>
                <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                  <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">{stats.totalTurmas}</div>
                <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                  <Activity className="h-3 w-3 mr-1" />
                  {stats.totalAlunos} alunos no total
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
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">Aulas Hoje</CardTitle>
                <div className="p-2 bg-emerald-500/20 rounded-lg group-hover:bg-emerald-500/30 transition-colors">
                  <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">{stats.aulasHoje}</div>
                <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                  <Clock className="h-3 w-3 mr-1" />
                  {/* Indicativo simples baseado em agenda */}
                  {agendaSemanal.reduce((acc: number, d: any) => acc + (d.totalHoras || 0), 0)} horas/aula semanais
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
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">Atividades Pendentes</CardTitle>
                <div className="p-2 bg-amber-500/20 rounded-lg group-hover:bg-amber-500/30 transition-colors">
                  <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-2">{stats.atividadesPendentes}</div>
                <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                  <Target className="h-3 w-3 mr-1" />
                  {stats.corrigindo} para correção
                </div>
              </CardContent>
            </LiquidGlassCard>

          </div>

          {/* Layout principal aprimorado */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-12 gap-4 md:gap-6">
            {/* Conteúdo principal - ocupa 8 colunas no xl */}
            <div className="xl:col-span-12 lg:xl:col-span-8 space-y-4 md:space-y-6">
              {/* Próximas Aulas */}
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
                    <Calendar className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                    Próximas Aulas
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Suas aulas de hoje e próximas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 md:space-y-4">
                    {proximasAulas.map((aula: any, index: number) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 md:p-4 border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors gap-3">
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Play className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{aula.turma}</h4>
                            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate">{aula.sala}</p>
                            <div className="flex items-center mt-1 flex-wrap gap-2">
                              <Badge variant="outline" className="text-xs">
                                {aula.tipo}
                              </Badge>
                              <span className={`text-xs ${
                                aula.status === "Próxima" ? "text-green-600 dark:text-green-400" : "text-green-600 dark:text-green-400"
                              }`}>
                                {aula.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end sm:flex-col sm:items-end gap-2 sm:gap-0">
                          <p className="text-xs md:text-sm font-semibold text-gray-900 dark:text-gray-100">{aula.horario}</p>
                          <LiquidGlassButton size="sm" variant="outline" className="sm:mt-2">
                            <ChevronRight className="h-4 w-4" />
                          </LiquidGlassButton>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </LiquidGlassCard>

              {/* Minhas Turmas */}
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
                    Minhas Turmas
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Turmas sob sua responsabilidade</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 md:space-y-4">
                    {paginatedTurmas.map((turma: any, index: number) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 md:p-4 border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors gap-3">
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                            <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{turma.nome}</h4>
                            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate">{turma.disciplina}</p>
                            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{turma.alunos} alunos</p>
                            <div className="flex items-center mt-1 flex-wrap gap-2">
                              <Badge variant="outline" className="text-xs">
                                {turma.status}
                              </Badge>
                              <span className="text-xs text-green-600 dark:text-green-400">
                                Média: {turma.media}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end sm:flex-col sm:items-end gap-2 sm:gap-0">
                          <div className="text-right sm:text-right">
                            <p className="text-xs md:text-sm font-semibold text-gray-900 dark:text-gray-100">{turma.proxima}</p>
                            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{turma.sala}</p>
                          </div>
                          <LiquidGlassButton size="sm" variant="outline" className="sm:mt-2">
                            <span className="hidden sm:inline">Gerenciar</span>
                            <ChevronRight className="h-4 w-4 sm:ml-2" />
                          </LiquidGlassButton>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Paginação Turmas */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0 mt-4">
                    <LiquidGlassButton
                      size="sm"
                      variant="outline"
                      disabled={turmasPage <= 1}
                      onClick={() => setTurmasPage((p) => Math.max(1, p - 1))}
                    >
                      Anterior
                    </LiquidGlassButton>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Página {turmasPage} de {totalTurmasPages}
                    </span>
                    <LiquidGlassButton
                      size="sm"
                      variant="outline"
                      disabled={turmasPage >= totalTurmasPages}
                      onClick={() => setTurmasPage((p) => Math.min(totalTurmasPages, p + 1))}
                    >
                      Próxima
                    </LiquidGlassButton>
                  </div>
                </CardContent>
              </LiquidGlassCard>
            </div>

            {/* Conteúdo lateral - ocupa 4 colunas no xl */}
            <div className="xl:col-span-12 lg:xl:col-span-4 space-y-4 md:space-y-6">
              {/* Agenda Semanal */}
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
                    <Calendar className="h-5 w-5 mr-2 text-emerald-600 dark:text-emerald-400" />
                    Agenda Semanal
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Sua programação da semana</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {agendaSemanal.map((dia, index) => (
                      <div key={index} className="p-3 border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{dia.dia}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">{dia.aulas} aulas</Badge>
                            <span className="text-xs text-gray-600 dark:text-gray-400">{dia.totalHoras}h</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {dia.turmas.map((turma: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {turma}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </LiquidGlassCard>

              {/* Comunicados */}
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
                    <Bell className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                    Comunicados
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Avisos importantes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {paginatedComunicados.map((comunicado: any, index: number) => (
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
                  {/* Paginação Comunicados */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0 mt-4">
                    <LiquidGlassButton
                      size="sm"
                      variant="outline"
                      disabled={comunicadosPage <= 1}
                      onClick={() => setComunicadosPage((p) => Math.max(1, p - 1))}
                    >
                      Anterior
                    </LiquidGlassButton>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Página {comunicadosPage} de {totalComunicadosPages}
                    </span>
                    <LiquidGlassButton
                      size="sm"
                      variant="outline"
                      disabled={comunicadosPage >= totalComunicadosPages}
                      onClick={() => setComunicadosPage((p) => Math.min(totalComunicadosPages, p + 1))}
                    >
                      Próxima
                    </LiquidGlassButton>
                  </div>
                </CardContent>
              </LiquidGlassCard>

            </div>
          </div>

          {/* Atividades Recentes - full width */}
          <div className="mt-4 md:mt-6">
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
                  <FileText className="h-5 w-5 mr-2 text-amber-600 dark:text-amber-400" />
                  Atividades Recentes
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">Atividades e avaliações pendentes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {paginatedAtividades.map((atividade: any, index: number) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors gap-3">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className={`${"w-10 h-10 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0 "}
                          ${atividade.tipo === "Prova" ? "bg-red-500/20" :
                          atividade.tipo === "Exercício" ? "bg-green-500/20" : "bg-green-500/20"}`}> 
                          <FileText className={`h-5 w-5 ${
                            atividade.tipo === "Prova" ? "text-red-600 dark:text-red-400" :
                            atividade.tipo === "Exercício" ? "text-green-600 dark:text-green-400" : "text-green-600 dark:text-green-400"
                          }`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{atividade.titulo}</h4>
                          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate">{atividade.turma}</p>
                          <div className="flex items-center mt-1 flex-wrap gap-2">
                            <Badge variant="outline" className="text-xs">
                              {atividade.tipo}
                            </Badge>
                            <Badge
                              variant={
                                atividade.prioridade === "Alta"
                                  ? "destructive"
                                  : atividade.prioridade === "Média"
                                    ? "secondary"
                                    : "outline"
                              }
                              className="text-xs"
                            >
                              {atividade.prioridade}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end sm:flex-col sm:items-end gap-2 sm:gap-0">
                        <Badge
                          variant={
                            atividade.status === "Pendente"
                              ? "destructive"
                              : atividade.status === "Corrigindo"
                                ? "secondary"
                                : "outline"
                          }
                          className="text-xs"
                        >
                          {atividade.status}
                        </Badge>
                        <p className="text-xs text-gray-600 dark:text-gray-400 sm:mt-1">{atividade.prazo}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Paginação */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0 mt-4">
                  <LiquidGlassButton
                    size="sm"
                    variant="outline"
                    disabled={activitiesPage <= 1}
                    onClick={() => setActivitiesPage((p) => Math.max(1, p - 1))}
                  >
                    Anterior
                  </LiquidGlassButton>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Página {activitiesPage} de {totalActivityPages}
                  </span>
                  <LiquidGlassButton
                    size="sm"
                    variant="outline"
                    disabled={activitiesPage >= totalActivityPages}
                    onClick={() =>
                      setActivitiesPage((p) => Math.min(totalActivityPages, p + 1))
                    }
                  >
                    Próxima
                  </LiquidGlassButton>
                </div>
              </CardContent>
            </LiquidGlassCard>
          </div>
        </div>
      </main>
    </div>
  )
}
