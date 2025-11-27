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
import { Calendar, Clock, MapPin, Users, BookOpen, Plus, Search, Trash2, AlertCircle, CheckCircle, X, GraduationCap, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/toast"
import { getSemestresDisponiveisCoordenador } from "@/src/services/coordenador-dashboard"
import { getCurrentUser } from "@/src/services/professor-dashboard"
import { Skeleton } from "@/components/ui/skeleton"

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

  // Buscar semestres disponíveis
  useEffect(() => {
    let mounted = true

    async function loadSemestres() {
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

        const semestresDisponiveis = await getSemestresDisponiveisCoordenador(user.id)
        if (!mounted) return

        setSemestres(semestresDisponiveis)
        
        // Selecionar semestre ativo ou o primeiro disponível
        const semestreAtivo = semestresDisponiveis.find(s => s.ativo)
        if (semestreAtivo) {
          setSemestreSelecionado(semestreAtivo.id)
        } else if (semestresDisponiveis.length > 0) {
          setSemestreSelecionado(semestresDisponiveis[0].id)
        }
      } catch (err) {
        console.error('Erro ao buscar semestres:', err)
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

    loadSemestres()

    return () => {
      mounted = false
    }
  }, [router])

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
        <div className="p-4 sm:p-6 lg:p-8">
          <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8 p-4 sm:p-6 rounded-2xl border backdrop-blur-sm ${
            isLiquidGlass
              ? 'bg-black/30 dark:bg-gray-800/20 border-gray-200/30 dark:border-gray-700/50'
              : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
          }`}>
            <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                  Grade Horária
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base lg:text-lg mt-1">
                  Gerenciamento de horários e alocação de recursos
                </p>
                <div className="flex flex-wrap items-center mt-2 gap-2">
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 text-xs">
                    {horariosFiltrados.length} horário{horariosFiltrados.length !== 1 ? 's' : ''} cadastrado{horariosFiltrados.length !== 1 ? 's' : ''}
                  </Badge>
                  {conflitos.length > 0 && (
                    <Badge variant="destructive" className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 text-xs">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {conflitos.length} conflito{conflitos.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                {loadingSemestres || semestres.length === 0 ? (
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
              <LiquidGlassButton onClick={handleAbrirModal} size="lg" className="w-full sm:w-auto">
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Novo Horário
              </LiquidGlassButton>
            </div>
          </div>

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
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6">
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
                  <SelectTrigger className="w-full sm:w-64">
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
                  <SelectTrigger className="w-full sm:w-48">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4 overflow-x-auto">
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
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6">
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
                  <SelectTrigger className="w-full sm:w-64">
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
                  <SelectTrigger className="w-full sm:w-48">
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
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{horario.professor}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{horario.turma}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 flex-shrink-0" />
                              <span>{horario.diaSemana}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 flex-shrink-0" />
                              <span>{horario.horarioInicio} - {horario.horarioFim}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{horario.sala}</span>
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
        </div>
      </main>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg lg:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
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
            <div className="space-y-4 sm:space-y-6 pr-1 p-1 sm:p-0">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

