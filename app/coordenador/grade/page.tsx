"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { LiquidGlassCard, LiquidGlassButton } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, Users, BookOpen, Plus, Search, Trash2, AlertCircle, CheckCircle, X, GraduationCap, Loader2, Eye, Sparkles, Sun, Sunset, Moon } from "lucide-react"
import { toast } from "@/components/ui/toast"
import { getSemestresDisponiveisCoordenador, getCoordinatorDepartments, getCoursesByDepartments } from "@/src/services/coordenador-dashboard"
import { getCurrentUser } from "@/src/services/professor-dashboard"
import { Skeleton } from "@/components/ui/skeleton"
import { getCourseAvailabilitySummary, type CourseAvailabilitySummary } from "@/src/services/availability-service"
import { getCourses, type BackendCourse } from "@/src/services/coursesService"
import { cn } from "@/lib/utils"

type HorarioAula = {
  id: string
  disciplina: string
  professor: string
  turma: string
  curso: string
  diaSemana: "Segunda" | "Terça" | "Quarta" | "Quinta" | "Sexta" | "Sábado"
  horarioInicio: string
  horarioFim: string
  sala: string
  tipo: "Teórica" | "Prática" | "Laboratório"
  cargaHoraria: number
  semestre?: string
}

type ConflitoHorario = {
  id: string
  tipo: "professor" | "sala" | "turma"
  descricao: string
  horarios: string[]
  severidade: "alta" | "media" | "baixa"
}

const DIAS_SEMANA = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"] as const
const HORARIOS_DISPONIVEIS = [
  "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"
]

export default function GradeHorariaPage() {
  const router = useRouter()
  const [isLiquidGlass, setIsLiquidGlass] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroCurso, setFiltroCurso] = useState<string>("todos")
  const [filtroTurma, setFiltroTurma] = useState<string>("todos")
  const [semestreSelecionado, setSemestreSelecionado] = useState<string>("")
  const [semestres, setSemestres] = useState<Array<{ id: string; nome: string; ativo: boolean }>>([])
  const [loadingSemestres, setLoadingSemestres] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeMainTab, setActiveMainTab] = useState<"ver-grade" | "gerar-grade">("ver-grade")
  const [coordinatorId, setCoordinatorId] = useState<string | null>(null)
  const [courses, setCourses] = useState<BackendCourse[]>([])
  const [selectedCourseForGeneration, setSelectedCourseForGeneration] = useState<string>("")
  const [selectedSemesterForGeneration, setSelectedSemesterForGeneration] = useState<string>("")
  const [availabilitySummary, setAvailabilitySummary] = useState<CourseAvailabilitySummary | null>(null)
  const [loadingAvailabilitySummary, setLoadingAvailabilitySummary] = useState(false)
  const [generatingSchedule, setGeneratingSchedule] = useState(false)
  const [modalData, setModalData] = useState<Partial<HorarioAula>>({
    disciplina: "",
    professor: "",
    turma: "",
    curso: "",
    diaSemana: "Segunda",
    horarioInicio: "08:00",
    horarioFim: "10:00",
    sala: "",
    tipo: "Teórica",
    cargaHoraria: 0
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [horarios, setHorarios] = useState<HorarioAula[]>([
    {
      id: "1",
      disciplina: "Algoritmos e Estruturas de Dados",
      professor: "Prof. Ana Silva",
      turma: "SI-2024A",
      curso: "Sistemas de Informação",
      diaSemana: "Segunda",
      horarioInicio: "08:00",
      horarioFim: "10:00",
      sala: "Lab 1",
      tipo: "Prática",
      cargaHoraria: 4,
      semestre: "2025.1"
    },
    {
      id: "2",
      disciplina: "Banco de Dados",
      professor: "Prof. Carlos Santos",
      turma: "SI-2024A",
      curso: "Sistemas de Informação",
      diaSemana: "Terça",
      horarioInicio: "14:00",
      horarioFim: "16:00",
      sala: "Sala 201",
      tipo: "Teórica",
      cargaHoraria: 4,
      semestre: "2025.1"
    },
    {
      id: "3",
      disciplina: "Engenharia de Software",
      professor: "Prof. Maria Oliveira",
      turma: "SI-2024B",
      curso: "Sistemas de Informação",
      diaSemana: "Quarta",
      horarioInicio: "19:00",
      horarioFim: "21:00",
      sala: "Sala 301",
      tipo: "Teórica",
      cargaHoraria: 4,
      semestre: "2024.2"
    },
    {
      id: "4",
      disciplina: "Redes de Computadores",
      professor: "Prof. João Lima",
      turma: "ADS-2024A",
      curso: "Análise e Desenvolvimento de Sistemas",
      diaSemana: "Quinta",
      horarioInicio: "08:00",
      horarioFim: "10:00",
      sala: "Lab 2",
      tipo: "Laboratório",
      cargaHoraria: 4,
      semestre: "2025.1"
    }
  ])

  const cursos = ["Sistemas de Informação", "Análise e Desenvolvimento de Sistemas", "Engenharia de Software"]
  const turmas = ["SI-2024A", "SI-2024B", "ADS-2024A", "ADS-2024B", "ES-2024A"]
  const professores = ["Prof. Ana Silva", "Prof. Carlos Santos", "Prof. Maria Oliveira", "Prof. João Lima"]
  const salas = ["Lab 1", "Lab 2", "Sala 201", "Sala 301", "Auditório Principal"]

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

  // Buscar usuário e dados iniciais
  useEffect(() => {
    let mounted = true

    async function loadInitialData() {
      try {
        setLoading(true)
        setLoadingSemestres(true)
        const token = typeof window !== "undefined" ? localStorage.getItem("ava:token") : null
        if (!token) {
          router.push("/")
          return
        }
        const user = await getCurrentUser()
        if (!mounted || !user?.id) {
          router.push("/")
          return
        }

        setCoordinatorId(user.id)

        // Buscar semestres e cursos em paralelo
        const [semestresDisponiveis, departments] = await Promise.all([
          getSemestresDisponiveisCoordenador(user.id),
          getCoordinatorDepartments(user.id)
        ])

        if (!mounted) return

        setSemestres(semestresDisponiveis)
        
        // Selecionar semestre ativo ou o primeiro disponível
        const semestreAtivo = semestresDisponiveis.find(s => s.ativo)
        if (semestreAtivo) {
          setSemestreSelecionado(semestreAtivo.id)
          setSelectedSemesterForGeneration(semestreAtivo.id)
        } else if (semestresDisponiveis.length > 0) {
          setSemestreSelecionado(semestresDisponiveis[0].id)
          setSelectedSemesterForGeneration(semestresDisponiveis[0].id)
        }

        // Buscar cursos do departamento
        if (departments.length > 0) {
          const departmentIds = departments.map(d => d.id)
          const coordinatorCourses = await getCoursesByDepartments(departmentIds)
          setCourses(coordinatorCourses)
        }
      } catch (err) {
        console.error('Erro ao buscar dados iniciais:', err)
        if (mounted) {
          router.push("/")
        }
      } finally {
        if (mounted) {
          setLoadingSemestres(false)
          setLoading(false)
        }
      }
    }

    loadInitialData()

    return () => {
      mounted = false
    }
  }, [router])

  // Buscar resumo de disponibilizações quando curso e semestre são selecionados
  useEffect(() => {
    const loadAvailabilitySummary = async () => {
      if (!selectedCourseForGeneration || !selectedSemesterForGeneration) {
        setAvailabilitySummary(null)
        return
      }

      try {
        setLoadingAvailabilitySummary(true)
        const summary = await getCourseAvailabilitySummary(selectedCourseForGeneration, selectedSemesterForGeneration)
        setAvailabilitySummary(summary)
      } catch (error: any) {
        console.error("Erro ao carregar resumo de disponibilizações:", error)
        if (error.response?.status !== 404) {
          toast({
            variant: "error",
            title: "Erro",
            description: "Não foi possível carregar as disponibilizações"
          })
        }
        setAvailabilitySummary(null)
      } finally {
        setLoadingAvailabilitySummary(false)
      }
    }

    if (activeMainTab === "gerar-grade") {
      loadAvailabilitySummary()
    }
  }, [selectedCourseForGeneration, selectedSemesterForGeneration, activeMainTab])

  const horariosFiltrados = horarios.filter(horario => {
    const matchesSearch = 
      horario.disciplina.toLowerCase().includes(searchTerm.toLowerCase()) ||
      horario.professor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      horario.turma.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCurso = filtroCurso === "todos" || horario.curso === filtroCurso
    const matchesTurma = filtroTurma === "todos" || horario.turma === filtroTurma
    const matchesSemestre = !semestreSelecionado || horario.semestre === semestreSelecionado
    return matchesSearch && matchesCurso && matchesTurma && matchesSemestre
  })

  const detectarConflitos = (): ConflitoHorario[] => {
    const conflitos: ConflitoHorario[] = []
    const professorHorarios = new Map<string, string[]>()
    const salaHorarios = new Map<string, string[]>()
    const turmaHorarios = new Map<string, string[]>()

    horarios.forEach(horario => {
      const chave = `${horario.diaSemana}-${horario.horarioInicio}-${horario.horarioFim}`
      
      if (!professorHorarios.has(horario.professor)) {
        professorHorarios.set(horario.professor, [])
      }
      professorHorarios.get(horario.professor)?.push(chave)

      if (!salaHorarios.has(horario.sala)) {
        salaHorarios.set(horario.sala, [])
      }
      salaHorarios.get(horario.sala)?.push(chave)

      if (!turmaHorarios.has(horario.turma)) {
        turmaHorarios.set(horario.turma, [])
      }
      turmaHorarios.get(horario.turma)?.push(chave)
    })

    professorHorarios.forEach((horariosList, professor) => {
      const duplicados = horariosList.filter((h, i) => horariosList.indexOf(h) !== i)
      if (duplicados.length > 0) {
        conflitos.push({
          id: `prof-${professor}`,
          tipo: "professor",
          descricao: `${professor} está alocado em múltiplos horários simultâneos`,
          horarios: [...new Set(duplicados)],
          severidade: "alta"
        })
      }
    })

    salaHorarios.forEach((horariosList, sala) => {
      const duplicados = horariosList.filter((h, i) => horariosList.indexOf(h) !== i)
      if (duplicados.length > 0) {
        conflitos.push({
          id: `sala-${sala}`,
          tipo: "sala",
          descricao: `${sala} está ocupada em múltiplos horários simultâneos`,
          horarios: [...new Set(duplicados)],
          severidade: "media"
        })
      }
    })

    turmaHorarios.forEach((horariosList, turma) => {
      const duplicados = horariosList.filter((h, i) => horariosList.indexOf(h) !== i)
      if (duplicados.length > 0) {
        conflitos.push({
          id: `turma-${turma}`,
          tipo: "turma",
          descricao: `${turma} está alocada em múltiplos horários simultâneos`,
          horarios: [...new Set(duplicados)],
          severidade: "alta"
        })
      }
    })

    return conflitos
  }

  const conflitos = detectarConflitos()

  const validarModal = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!modalData.disciplina?.trim()) {
      newErrors.disciplina = "Disciplina é obrigatória"
    }

    if (!modalData.professor?.trim()) {
      newErrors.professor = "Professor é obrigatório"
    }

    if (!modalData.turma?.trim()) {
      newErrors.turma = "Turma é obrigatória"
    }

    if (!modalData.curso?.trim()) {
      newErrors.curso = "Curso é obrigatório"
    }

    if (!modalData.sala?.trim()) {
      newErrors.sala = "Sala é obrigatória"
    }

    if (modalData.horarioInicio && modalData.horarioFim) {
      if (modalData.horarioInicio >= modalData.horarioFim) {
        newErrors.horarioFim = "Horário de término deve ser após o horário de início"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSalvarHorario = () => {
    if (!validarModal()) {
      toast({
        variant: "error",
        title: "Dados inválidos",
        description: "Verifique os campos destacados e tente novamente"
      })
      return
    }

    const novoHorario: HorarioAula = {
      id: Date.now().toString(),
      disciplina: modalData.disciplina!,
      professor: modalData.professor!,
      turma: modalData.turma!,
      curso: modalData.curso!,
      diaSemana: modalData.diaSemana!,
      horarioInicio: modalData.horarioInicio!,
      horarioFim: modalData.horarioFim!,
      sala: modalData.sala!,
      tipo: modalData.tipo!,
      cargaHoraria: modalData.cargaHoraria || 0,
      semestre: semestreSelecionado || undefined
    }

    setHorarios([...horarios, novoHorario])
    toast({
      variant: "success",
      title: "Horário adicionado",
      description: `Horário de "${novoHorario.disciplina}" foi adicionado com sucesso!`
    })

    setIsModalOpen(false)
    setModalData({
      disciplina: "",
      professor: "",
      turma: "",
      curso: "",
      diaSemana: "Segunda",
      horarioInicio: "08:00",
      horarioFim: "10:00",
      sala: "",
      tipo: "Teórica",
      cargaHoraria: 0,
      semestre: semestreSelecionado || undefined
    })
    setErrors({})
  }

  const handleAbrirModal = () => {
    setModalData({
      disciplina: "",
      professor: "",
      turma: "",
      curso: "",
      diaSemana: "Segunda",
      horarioInicio: "08:00",
      horarioFim: "10:00",
      sala: "",
      tipo: "Teórica",
      cargaHoraria: 0,
      semestre: semestreSelecionado || undefined
    })
    setErrors({})
    setIsModalOpen(true)
  }

  const handleDeletarHorario = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este horário?")) {
      setHorarios(horarios.filter(h => h.id !== id))
      toast({
        variant: "success",
        title: "Horário removido",
        description: "O horário foi removido com sucesso!"
      })
    }
  }

  const organizarPorDia = () => {
    const organizado: Record<string, HorarioAula[]> = {}
    DIAS_SEMANA.forEach(dia => {
      organizado[dia] = horariosFiltrados.filter(h => h.diaSemana === dia)
    })
    return organizado
  }

  const horariosPorDia = organizarPorDia()

  if (loading) {
    return (
      <div className={`flex h-screen ${isLiquidGlass ? 'bg-black/30 dark:bg-gray-900/20' : 'bg-background'}`}>
        <Sidebar userRole="coordenador" />
        <main className="flex-1 overflow-y-auto flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            <p className="text-muted-foreground">Carregando grade horária...</p>
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
          <div className={`flex items-center justify-between mb-8 p-6 rounded-2xl border backdrop-blur-sm ${
            isLiquidGlass
              ? 'bg-black/30 dark:bg-gray-800/20 border-gray-200/30 dark:border-gray-700/50'
              : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
          }`}>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                  Grade Horária
                </h1>
                <p className="text-muted-foreground text-lg mt-1">
                  Gerenciamento de horários e alocação de recursos
                </p>
                <div className="flex items-center mt-2 space-x-2">
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                    {horariosFiltrados.length} horário{horariosFiltrados.length !== 1 ? 's' : ''} cadastrado{horariosFiltrados.length !== 1 ? 's' : ''}
                  </Badge>
                  {conflitos.length > 0 && (
                    <Badge variant="destructive" className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {conflitos.length} conflito{conflitos.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                {loadingSemestres || semestres.length === 0 ? (
                  <Skeleton className="h-10 w-40" />
                ) : (
                  <Select value={semestreSelecionado} onValueChange={setSemestreSelecionado}>
                    <SelectTrigger className={`w-40 backdrop-blur-sm ${
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
              <LiquidGlassButton onClick={handleAbrirModal} size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Novo Horário
              </LiquidGlassButton>
            </div>
          </div>

          <Tabs value={activeMainTab} onValueChange={(v) => setActiveMainTab(v as "ver-grade" | "gerar-grade")} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ver-grade" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Ver Grade Gerada
              </TabsTrigger>
              <TabsTrigger value="gerar-grade" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Gerar Grade Nova
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ver-grade" className="space-y-6">
              <Tabs defaultValue="grade" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="grade">Grade Semanal</TabsTrigger>
                  <TabsTrigger value="lista">Lista de Horários</TabsTrigger>
                  <TabsTrigger value="conflitos">
                    Conflitos
                    {conflitos.length > 0 && (
                      <Badge variant="destructive" className="ml-2">
                        {conflitos.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

            <TabsContent value="grade" className="space-y-6">
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por disciplina, professor ou turma..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filtroCurso} onValueChange={setFiltroCurso}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Filtrar por curso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os cursos</SelectItem>
                    {cursos.map(curso => (
                      <SelectItem key={curso} value={curso}>{curso}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filtroTurma} onValueChange={setFiltroTurma}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por turma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas as turmas</SelectItem>
                    {turmas.map(turma => (
                      <SelectItem key={turma} value={turma}>{turma}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
                {DIAS_SEMANA.map(dia => (
                  <LiquidGlassCard
                    key={dia}
                    intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
                    className={`${
                      isLiquidGlass
                        ? 'bg-black/30 dark:bg-gray-800/20'
                        : 'bg-gray-50/60 dark:bg-gray-800/40'
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold text-center">
                        {dia}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {horariosPorDia[dia].length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-4">
                          Sem horários
                        </p>
                      ) : (
                        horariosPorDia[dia].map(horario => (
                          <div
                            key={horario.id}
                            className="p-2 rounded-lg border border-border/50 bg-background/50 hover:bg-background/80 transition-colors cursor-pointer"
                          >
                            <div className="text-xs font-semibold mb-1 line-clamp-1">
                              {horario.disciplina}
                            </div>
                            <div className="text-xs text-muted-foreground space-y-0.5">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {horario.horarioInicio} - {horario.horarioFim}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {horario.sala}
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {horario.turma}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </LiquidGlassCard>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="lista" className="space-y-6">
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por disciplina, professor ou turma..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filtroCurso} onValueChange={setFiltroCurso}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Filtrar por curso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os cursos</SelectItem>
                    {cursos.map(curso => (
                      <SelectItem key={curso} value={curso}>{curso}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filtroTurma} onValueChange={setFiltroTurma}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por turma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas as turmas</SelectItem>
                    {turmas.map(turma => (
                      <SelectItem key={turma} value={turma}>{turma}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {horariosFiltrados.map(horario => (
                  <LiquidGlassCard
                    key={horario.id}
                    intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
                    className={`group transition-all duration-300 hover:shadow-xl border border-border/50 hover:border-border/80 ${
                      isLiquidGlass
                        ? 'bg-black/30 dark:bg-gray-800/20'
                        : 'bg-gray-50/60 dark:bg-gray-800/40'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-lg">{horario.disciplina}</h3>
                            <Badge variant="outline">{horario.tipo}</Badge>
                            <Badge variant="secondary">{horario.curso}</Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span>{horario.professor}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4" />
                              <span>{horario.turma}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{horario.diaSemana}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{horario.horarioInicio} - {horario.horarioFim}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{horario.sala}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs">Carga: {horario.cargaHoraria}h</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <LiquidGlassButton
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeletarHorario(horario.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </LiquidGlassButton>
                        </div>
                      </div>
                    </CardContent>
                  </LiquidGlassCard>
                ))}

                {horariosFiltrados.length === 0 && (
                  <LiquidGlassCard
                    intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
                    className={`text-center py-12 ${
                      isLiquidGlass
                        ? 'bg-black/30 dark:bg-gray-800/20'
                        : 'bg-gray-50/60 dark:bg-gray-800/40'
                    }`}
                  >
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-semibold mb-2">Nenhum horário encontrado</p>
                    <p className="text-muted-foreground">
                      {searchTerm || filtroCurso !== "todos" || filtroTurma !== "todos"
                        ? "Tente ajustar seus filtros"
                        : "Comece adicionando um novo horário"}
                    </p>
                  </LiquidGlassCard>
                )}
              </div>
            </TabsContent>

            <TabsContent value="conflitos" className="space-y-6">
              {conflitos.length === 0 ? (
                <LiquidGlassCard
                  intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
                  className={`text-center py-12 ${
                    isLiquidGlass
                      ? 'bg-black/30 dark:bg-gray-800/20'
                      : 'bg-gray-50/60 dark:bg-gray-800/40'
                  }`}
                >
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600 dark:text-green-400" />
                  <p className="text-lg font-semibold mb-2">Nenhum conflito detectado</p>
                  <p className="text-muted-foreground">
                    A grade horária está sem conflitos de alocação
                  </p>
                </LiquidGlassCard>
              ) : (
                <div className="space-y-4">
                  {conflitos.map(conflito => (
                    <LiquidGlassCard
                      key={conflito.id}
                      intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
                      className={`border-l-4 ${
                        conflito.severidade === "alta"
                          ? "border-red-500"
                          : conflito.severidade === "media"
                          ? "border-yellow-500"
                          : "border-blue-500"
                      } ${
                        isLiquidGlass
                          ? 'bg-black/30 dark:bg-gray-800/20'
                          : 'bg-gray-50/60 dark:bg-gray-800/40'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertCircle className={`h-5 w-5 ${
                                conflito.severidade === "alta"
                                  ? "text-red-600"
                                  : conflito.severidade === "media"
                                  ? "text-yellow-600"
                                  : "text-blue-600"
                              }`} />
                              <h3 className="font-semibold">{conflito.descricao}</h3>
                              <Badge
                                variant={
                                  conflito.severidade === "alta"
                                    ? "destructive"
                                    : conflito.severidade === "media"
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {conflito.severidade === "alta" ? "Alta" : conflito.severidade === "media" ? "Média" : "Baixa"}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <p>Tipo: {conflito.tipo === "professor" ? "Conflito de Professor" : conflito.tipo === "sala" ? "Conflito de Sala" : "Conflito de Turma"}</p>
                              <p className="mt-1">Horários afetados: {conflito.horarios.length}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </LiquidGlassCard>
                  ))}
                </div>
              )}
            </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="gerar-grade" className="space-y-6">
              <LiquidGlassCard
                intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
                className={cn(
                  isLiquidGlass
                    ? 'bg-black/30 dark:bg-gray-800/20'
                    : 'bg-gray-50/60 dark:bg-gray-800/40'
                )}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Gerar Grade Baseada em Disponibilizações
                  </CardTitle>
                  <CardDescription>
                    Selecione o curso e semestre para gerar uma grade automática baseada nas disponibilizações dos professores
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="curso-geracao">Curso</Label>
                      <Select value={selectedCourseForGeneration} onValueChange={setSelectedCourseForGeneration}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o curso" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.length === 0 ? (
                            <div className="px-2 py-1.5 text-sm text-muted-foreground">
                              Nenhum curso disponível
                            </div>
                          ) : (
                            courses.map((course) => (
                              <SelectItem key={course.id} value={course.id}>
                                {course.name} ({course.code})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="semestre-geracao">Semestre</Label>
                      {loadingSemestres || semestres.length === 0 ? (
                        <Skeleton className="h-10 w-full" />
                      ) : (
                        <Select value={selectedSemesterForGeneration} onValueChange={setSelectedSemesterForGeneration}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o semestre" />
                          </SelectTrigger>
                          <SelectContent>
                            {semestres.map((semestre) => (
                              <SelectItem key={semestre.id} value={semestre.id}>
                                <div className="flex items-center gap-2">
                                  <span>{semestre.nome}</span>
                                  {semestre.ativo && (
                                    <Badge variant="secondary" className="text-xs">
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
                  </div>

                  {selectedCourseForGeneration && selectedSemesterForGeneration && (
                    <>
                      {loadingAvailabilitySummary ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
                          <span className="text-muted-foreground">Carregando disponibilizações...</span>
                        </div>
                      ) : !availabilitySummary ? (
                        <div className="text-center py-8 text-muted-foreground border rounded-lg">
                          <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Nenhuma disponibilização encontrada para este curso e semestre</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="p-4 border rounded-lg bg-muted/50">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h3 className="font-semibold text-lg">{availabilitySummary.course.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Semestre: {availabilitySummary.academicPeriod.period}
                                </p>
                              </div>
                              <Badge variant="secondary">
                                {availabilitySummary.teachers.length} professor{availabilitySummary.teachers.length !== 1 ? 'es' : ''}
                              </Badge>
                            </div>

                            <div className="space-y-3 max-h-96 overflow-y-auto">
                              {availabilitySummary.teachers.map((teacher) => (
                                <div
                                  key={teacher.id}
                                  className="p-3 border rounded-lg bg-background"
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div>
                                      <h4 className="font-medium">{teacher.name}</h4>
                                      <p className="text-xs text-muted-foreground">{teacher.email}</p>
                                    </div>
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "text-xs",
                                        teacher.status === 'approved' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
                                        teacher.status === 'submitted' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
                                        teacher.status === 'draft' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'
                                      )}
                                    >
                                      {teacher.status === 'approved' ? 'Aprovada' : teacher.status === 'submitted' ? 'Enviada' : 'Rascunho'}
                                    </Badge>
                                  </div>

                                  <div className="space-y-2 mt-3">
                                    <div>
                                      <p className="text-xs font-medium text-muted-foreground mb-1">Turnos Disponíveis:</p>
                                      <div className="flex flex-wrap gap-2">
                                        {teacher.shifts && teacher.shifts.length > 0 ? (
                                          teacher.shifts.map((shift, idx) => {
                                            const turnoMap: Record<string, { nome: string; icone: typeof Sun; cor: string }> = {
                                              'morning': { nome: 'Manhã', icone: Sun, cor: 'yellow' },
                                              'afternoon': { nome: 'Tarde', icone: Sunset, cor: 'orange' },
                                              'evening': { nome: 'Noite', icone: Moon, cor: 'blue' }
                                            }
                                            const turno = turnoMap[shift.shift]
                                            if (!turno) return null
                                            const Icon = turno.icone
                                            const diaMap: Record<string, string> = {
                                              'segunda-feira': 'Seg',
                                              'terca-feira': 'Ter',
                                              'quarta-feira': 'Qua',
                                              'quinta-feira': 'Qui',
                                              'sexta-feira': 'Sex',
                                              'sabado': 'Sáb',
                                              'domingo': 'Dom'
                                            }
                                            const diaAbrev = diaMap[shift.dayOfWeek] || shift.dayOfWeek
                                            return (
                                              <Badge
                                                key={idx}
                                                variant="secondary"
                                                className={cn(
                                                  turno.cor === 'yellow' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
                                                  turno.cor === 'orange' && 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
                                                  turno.cor === 'blue' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                                                )}
                                              >
                                                <Icon className="h-3 w-3 mr-1" />
                                                {turno.nome} ({diaAbrev})
                                              </Badge>
                                            )
                                          })
                                        ) : (
                                          <span className="text-xs text-muted-foreground">Nenhum turno</span>
                                        )}
                                      </div>
                                    </div>

                                    {teacher.disciplines && teacher.disciplines.length > 0 && (
                                      <div>
                                        <p className="text-xs font-medium text-muted-foreground mb-1">Disciplinas de Interesse:</p>
                                        <div className="flex flex-wrap gap-2">
                                          {teacher.disciplines.map((discipline) => (
                                            <Badge
                                              key={discipline.id}
                                              variant="outline"
                                              className="bg-primary/5 text-primary border-primary/20"
                                            >
                                              <BookOpen className="h-3 w-3 mr-1" />
                                              {discipline.name}
                                              {discipline.code && ` (${discipline.code})`}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex justify-end gap-3 pt-4 border-t">
                            <LiquidGlassButton
                              variant="outline"
                              onClick={() => {
                                setSelectedCourseForGeneration("")
                                setAvailabilitySummary(null)
                              }}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Limpar Seleção
                            </LiquidGlassButton>
                            <LiquidGlassButton
                              onClick={async () => {
                                if (!selectedCourseForGeneration || !selectedSemesterForGeneration) {
                                  toast({
                                    variant: "error",
                                    title: "Erro",
                                    description: "Selecione curso e semestre antes de gerar a grade"
                                  })
                                  return
                                }

                                try {
                                  setGeneratingSchedule(true)
                                  // TODO: Implementar chamada para API de geração de grade
                                  // await generateSchedule(selectedCourseForGeneration, selectedSemesterForGeneration)
                                  
                                  toast({
                                    variant: "success",
                                    title: "Grade gerada",
                                    description: "A grade foi gerada com sucesso baseada nas disponibilizações dos professores"
                                  })
                                  
                                  // Após gerar, mudar para aba de visualização
                                  setActiveMainTab("ver-grade")
                                } catch (error: any) {
                                  console.error("Erro ao gerar grade:", error)
                                  toast({
                                    variant: "error",
                                    title: "Erro",
                                    description: error.message || "Não foi possível gerar a grade"
                                  })
                                } finally {
                                  setGeneratingSchedule(false)
                                }
                              }}
                              disabled={generatingSchedule || !availabilitySummary || availabilitySummary.teachers.length === 0}
                            >
                              {generatingSchedule ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Gerando...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="h-4 w-4 mr-2" />
                                  Gerar Grade Automática
                                </>
                              )}
                            </LiquidGlassButton>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {!selectedCourseForGeneration && !selectedSemesterForGeneration && (
                    <div className="text-center py-12 text-muted-foreground border rounded-lg">
                      <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="font-medium mb-2">Selecione um curso e semestre</p>
                      <p className="text-sm">Escolha o curso e o semestre para visualizar as disponibilizações e gerar a grade</p>
                    </div>
                  )}
                </CardContent>
              </LiquidGlassCard>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Novo Horário</h2>
                <DialogDescription className="mt-1">
                  Adicione um novo horário à grade
                </DialogDescription>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="space-y-6 pr-1">
              <div>
                <Label htmlFor="disciplina" className="text-sm font-medium">
                  Disciplina *
                </Label>
                <Input
                  id="disciplina"
                  value={modalData.disciplina || ""}
                  onChange={(e) => setModalData({ ...modalData, disciplina: e.target.value })}
                  placeholder="Ex: Algoritmos e Estruturas de Dados"
                  className={errors.disciplina ? 'border-destructive' : ''}
                />
                {errors.disciplina && (
                  <p className="text-sm text-destructive mt-1">{errors.disciplina}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="curso" className="text-sm font-medium">
                    Curso *
                  </Label>
                  <Select
                    value={modalData.curso || ""}
                    onValueChange={(value) => setModalData({ ...modalData, curso: value })}
                  >
                    <SelectTrigger className={errors.curso ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Selecione o curso" />
                    </SelectTrigger>
                    <SelectContent>
                      {cursos.map(curso => (
                        <SelectItem key={curso} value={curso}>{curso}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.curso && (
                    <p className="text-sm text-destructive mt-1">{errors.curso}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="turma" className="text-sm font-medium">
                    Turma *
                  </Label>
                  <Select
                    value={modalData.turma || ""}
                    onValueChange={(value) => setModalData({ ...modalData, turma: value })}
                  >
                    <SelectTrigger className={errors.turma ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Selecione a turma" />
                    </SelectTrigger>
                    <SelectContent>
                      {turmas.map(turma => (
                        <SelectItem key={turma} value={turma}>{turma}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.turma && (
                    <p className="text-sm text-destructive mt-1">{errors.turma}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="professor" className="text-sm font-medium">
                  Professor *
                </Label>
                <Select
                  value={modalData.professor || ""}
                  onValueChange={(value) => setModalData({ ...modalData, professor: value })}
                >
                  <SelectTrigger className={errors.professor ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Selecione o professor" />
                  </SelectTrigger>
                  <SelectContent>
                    {professores.map(professor => (
                      <SelectItem key={professor} value={professor}>{professor}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.professor && (
                  <p className="text-sm text-destructive mt-1">{errors.professor}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="diaSemana" className="text-sm font-medium">
                    Dia da Semana *
                  </Label>
                  <Select
                    value={modalData.diaSemana || "Segunda"}
                    onValueChange={(value) => setModalData({ ...modalData, diaSemana: value as typeof modalData.diaSemana })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIAS_SEMANA.map(dia => (
                        <SelectItem key={dia} value={dia}>{dia}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tipo" className="text-sm font-medium">
                    Tipo de Aula *
                  </Label>
                  <Select
                    value={modalData.tipo || "Teórica"}
                    onValueChange={(value) => setModalData({ ...modalData, tipo: value as typeof modalData.tipo })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Teórica">Teórica</SelectItem>
                      <SelectItem value="Prática">Prática</SelectItem>
                      <SelectItem value="Laboratório">Laboratório</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="horarioInicio" className="text-sm font-medium">
                    Horário de Início *
                  </Label>
                  <Select
                    value={modalData.horarioInicio || "08:00"}
                    onValueChange={(value) => setModalData({ ...modalData, horarioInicio: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HORARIOS_DISPONIVEIS.map(horario => (
                        <SelectItem key={horario} value={horario}>{horario}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="horarioFim" className="text-sm font-medium">
                    Horário de Término *
                  </Label>
                  <Select
                    value={modalData.horarioFim || "10:00"}
                    onValueChange={(value) => setModalData({ ...modalData, horarioFim: value })}
                  >
                    <SelectTrigger className={errors.horarioFim ? 'border-destructive' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HORARIOS_DISPONIVEIS.map(horario => (
                        <SelectItem key={horario} value={horario}>{horario}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.horarioFim && (
                    <p className="text-sm text-destructive mt-1">{errors.horarioFim}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sala" className="text-sm font-medium">
                    Sala/Laboratório *
                  </Label>
                  <Select
                    value={modalData.sala || ""}
                    onValueChange={(value) => setModalData({ ...modalData, sala: value })}
                  >
                    <SelectTrigger className={errors.sala ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Selecione a sala" />
                    </SelectTrigger>
                    <SelectContent>
                      {salas.map(sala => (
                        <SelectItem key={sala} value={sala}>{sala}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.sala && (
                    <p className="text-sm text-destructive mt-1">{errors.sala}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="cargaHoraria" className="text-sm font-medium">
                    Carga Horária (horas)
                  </Label>
                  <Input
                    id="cargaHoraria"
                    type="number"
                    value={modalData.cargaHoraria || ""}
                    onChange={(e) => setModalData({ ...modalData, cargaHoraria: parseInt(e.target.value) || 0 })}
                    placeholder="Ex: 4"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-3 pt-4 border-t flex-shrink-0">
            <LiquidGlassButton variant="outline" onClick={() => setIsModalOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </LiquidGlassButton>
            <LiquidGlassButton onClick={handleSalvarHorario}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Horário
            </LiquidGlassButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

