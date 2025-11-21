"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { LiquidGlassCard, LiquidGlassButton } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { BookOpen, ArrowLeft, Users, GraduationCap, Clock, Edit, Plus, Search, Loader2, Power, PowerOff } from "lucide-react"
import { toast } from "@/components/ui/toast"
import { ModalConfirmacao } from "@/components/modals/modal-confirmacao"
import {
  getCourseById,
  getCourseClasses,
  getCourseDisciplines,
  getCourseStudents,
  createClass,
  createDiscipline,
  updateClass,
  updateDiscipline,
  toggleDisciplineStatus,
  getAllDisciplines,
  associateDisciplineToCourse,
  updateDisciplineSemester,
  type BackendClass,
  type BackendCourse,
  type BackendDiscipline,
  type BackendCourseStudent
} from "@/src/services/coursesService"
import { Combobox } from "@/components/ui/combobox"

type Disciplina = {
  id: string
  nome: string
  codigo: string
  cargaHoraria: number
  creditos: number
  semestre?: number
  tipo: "obrigatoria" | "optativa"
  professor?: string
  status: "ativa" | "inativa"
  courseId?: string
}

type Turma = {
  id: string
  codigo: string
  disciplina: string
  professor: string
  periodo: string
  horario: string
  sala: string
  alunos: number
  capacidade: number
  status: "ativa" | "inativa"
  courseId?: string
}

type Aluno = {
  id: string
  nome: string
  email?: string
  matricula?: string
  status?: string
}

type Curso = {
  id: string
  nome: string
  codigo: string
  departamento: string
  cargaHoraria: number
  duracao: number
  status: "ativo" | "inativo"
  alunos: number
  professores: number
  turmas: number
  descricao?: string
}

const mapCourse = (data: BackendCourse): Curso => ({
  id: data.id,
  nome: data.name,
  codigo: data.code,
  departamento: data.department?.name ?? "Departamento",
  cargaHoraria: data.totalHours,
  duracao: data.durationSemesters,
  status: data.status === "inactive" ? "inativo" : "ativo",
  alunos: data.studentsCount ?? 0,
  professores: data.disciplinesCount ?? 0,
  turmas: data.classesCount ?? 0,
  descricao: data.description
})

const mapDiscipline = (d: BackendDiscipline, fallbackCourseId?: string): Disciplina => ({
  id: d.id,
  nome: d.name ?? "Disciplina",
  codigo: d.code ?? d.id.slice(0, 6).toUpperCase(),
  cargaHoraria: d.workLoad ?? d.workload ?? d.workloadHours ?? 0,
  creditos: d.credits ?? 0,
  semestre: d.semester,
  tipo: d.type === "optional" ? "optativa" : "obrigatoria",
  professor: d.teacher?.name,
  status: d.status === "inactive" ? "inativa" : "ativa",
  courseId: d.courseId ?? d.course?.id ?? fallbackCourseId
})

const mapClass = (c: BackendClass, fallbackCourseId?: string): Turma => {
  const periodoBase = c.semester ?? c.period ?? "";
  const periodo = periodoBase && c.year ? `${periodoBase}/${c.year}` : (periodoBase || "Semestre nao informado");

  return {
    id: c.id,
    codigo: c.code,
    disciplina: c.discipline?.name ?? "Sem disciplina",
    professor: c.teacher?.name ?? "Sem professor",
    periodo,
    horario: c.schedule ?? "Horario nao informado",
    sala: c.room ?? "Sala nao informada",
    alunos: c.studentsCount ?? 0,
    capacidade: c.capacity ?? c.studentsCount ?? 0,
    status: c.status === "inactive" ? "inativa" : "ativa",
    courseId: c.courseId ?? c.course?.id ?? fallbackCourseId
  }
}

const mapStudent = (s: BackendCourseStudent): Aluno => ({
  id: s.id,
  nome: s.name,
  email: s.email,
  matricula: s.enrollment,
  status: s.status
})

export default function CursoDetalhePage() {
  const params = useParams()
  const router = useRouter()
  const cursoId = params.id as string

  const [isLiquidGlass, setIsLiquidGlass] = useState(false)
  const [curso, setCurso] = useState<Curso | null>(null)
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [searchDisciplinas, setSearchDisciplinas] = useState("")
  const [searchTurmas, setSearchTurmas] = useState("")
  const [searchAlunos, setSearchAlunos] = useState("")
  const [filtroTipoDisciplina, setFiltroTipoDisciplina] = useState<"todas" | "obrigatoria" | "optativa">("todas")
  const [filtroStatusDisciplina, setFiltroStatusDisciplina] = useState<"todas" | "ativa" | "inativa">("todas")
  const [filtroStatusTurma, setFiltroStatusTurma] = useState<"todas" | "ativa" | "inativa">("todas")
  const [isDisciplinaModalOpen, setIsDisciplinaModalOpen] = useState(false)
  const [isTurmaModalOpen, setIsTurmaModalOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [disciplinaParaToggle, setDisciplinaParaToggle] = useState<Disciplina | null>(null)
  const [isSavingDisciplina, setIsSavingDisciplina] = useState(false)
  const [isSavingTurma, setIsSavingTurma] = useState(false)
  const [disciplinaEditandoId, setDisciplinaEditandoId] = useState<string | null>(null)
  const [turmaEditandoId, setTurmaEditandoId] = useState<string | null>(null)
  const [novaDisciplina, setNovaDisciplina] = useState({
    nome: "",
    creditos: "",
    cargaHoraria: "",
    semestre: ""
  })
  const [disciplinaSelecionadaId, setDisciplinaSelecionadaId] = useState<string | null>(null)
  const [disciplinasOptions, setDisciplinasOptions] = useState<{ id: string; label: string }[]>([])
  const [isLoadingDisciplines, setIsLoadingDisciplines] = useState(false)
  const [novaTurma, setNovaTurma] = useState({
    codigo: "",
    semestre: "",
    ano: new Date().getFullYear().toString(),
    disciplinaId: ""
  })

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

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      const [courseData, disciplinesData, classesData, studentsData] = await Promise.all([
        getCourseById(cursoId),
        getCourseDisciplines(cursoId),
        getCourseClasses(cursoId),
        getCourseStudents(cursoId)
      ])

      const mappedStudents = studentsData.map(mapStudent)
      const mappedClasses = classesData
        .map((classe) => mapClass(classe, cursoId))
        .filter((t) => t.status === "ativa")
      const mappedDisciplines = disciplinesData
        .map((disciplina) => mapDiscipline(disciplina, cursoId))

      setCurso({
        ...mapCourse(courseData),
        alunos: mappedStudents.length,
        turmas: mappedClasses.length,
      })
      setDisciplinas(mappedDisciplines)
      setTurmas(mappedClasses)
      setAlunos(mappedStudents)
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Nao foi possivel carregar o curso"
      toast({
        variant: "error",
        title: "Erro ao carregar",
        description: Array.isArray(message) ? message.join(", ") : message
      })
    } finally {
      setIsLoading(false)
    }
  }, [cursoId])

  const loadDisciplines = useCallback(async () => {
    try {
      const disciplinesData = await getCourseDisciplines(cursoId)
      const mappedDisciplines = disciplinesData.map((disciplina) => mapDiscipline(disciplina, cursoId))
      setDisciplinas(mappedDisciplines)
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Nao foi possivel carregar as disciplinas"
      toast({
        variant: "error",
        title: "Erro ao carregar disciplinas",
        description: Array.isArray(message) ? message.join(", ") : message
      })
    }
  }, [cursoId])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (!novaTurma.disciplinaId && disciplinas.length > 0) {
      setNovaTurma((prev) => ({
        ...prev,
        disciplinaId: prev.disciplinaId || disciplinas[0].id
      }))
    }
  }, [disciplinas, novaTurma.disciplinaId])

  const disciplinasFiltradas = useMemo(() => {
    return disciplinas.filter((d) => {
      const matchesSearch =
        d.nome.toLowerCase().includes(searchDisciplinas.toLowerCase()) ||
        d.codigo.toLowerCase().includes(searchDisciplinas.toLowerCase())
      const matchesTipo = filtroTipoDisciplina === "todas" || d.tipo === filtroTipoDisciplina
      const matchesStatus = filtroStatusDisciplina === "todas" || d.status === filtroStatusDisciplina
      return matchesSearch && matchesTipo && matchesStatus
    })
  }, [disciplinas, searchDisciplinas, filtroTipoDisciplina, filtroStatusDisciplina])

  const turmasFiltradas = useMemo(() => {
    return turmas.filter((t) => {
      const term = searchTurmas.toLowerCase()
      const matchesSearch =
        t.disciplina.toLowerCase().includes(term) ||
        t.codigo.toLowerCase().includes(term) ||
        t.professor.toLowerCase().includes(term)
      const matchesStatus = filtroStatusTurma === "todas" || t.status === filtroStatusTurma
      return matchesSearch && matchesStatus
    })
  }, [turmas, searchTurmas, filtroStatusTurma])

  const alunosFiltrados = useMemo(() => {
    const term = searchAlunos.toLowerCase()
    return alunos.filter((a) => {
      const matchesSearch =
        a.nome.toLowerCase().includes(term) ||
        (a.email?.toLowerCase().includes(term) ?? false) ||
        (a.matricula?.toLowerCase().includes(term) ?? false)
      return matchesSearch
    })
  }, [alunos, searchAlunos])

  const resetDisciplinaForm = () => {
    setDisciplinaEditandoId(null)
    setDisciplinaSelecionadaId(null)
    setNovaDisciplina({
      nome: "",
      creditos: "",
      cargaHoraria: "",
      semestre: "",
    })
    setDisciplinasOptions([])
  }

  const handleSearchDisciplines = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setDisciplinasOptions([])
        return
      }

      try {
        setIsLoadingDisciplines(true)
        const allDisciplines = await getAllDisciplines()
        const filtered = allDisciplines
          .filter((d) => d.name.toLowerCase().includes(query.toLowerCase()))
          .map((d) => ({
            id: d.id,
            label: d.name,
          }))
        setDisciplinasOptions(filtered)
      } catch (error) {
        console.error("Erro ao buscar disciplinas:", error)
        setDisciplinasOptions([])
      } finally {
        setIsLoadingDisciplines(false)
      }
    },
    []
  )

  const resetTurmaForm = () => {
    setTurmaEditandoId(null)
    setNovaTurma({
      codigo: "",
      semestre: "",
      ano: new Date().getFullYear().toString(),
      disciplinaId: disciplinas[0]?.id ?? "",
    })
  }

  const handleCreateDisciplina = async () => {
    if (!novaDisciplina.nome.trim()) {
      toast({
        variant: "error",
        title: "Dados incompletos",
        description: "Preencha o nome da disciplina.",
      })
      return
    }

    try {
      setIsSavingDisciplina(true)
      if (disciplinaEditandoId) {
        // Modo edição - atualizar disciplina existente
        if (!novaDisciplina.creditos || !novaDisciplina.cargaHoraria) {
          toast({
            variant: "error",
            title: "Dados incompletos",
            description: "Preencha creditos e carga horaria para atualizar a disciplina.",
          })
          return
        }
        const updated = await updateDiscipline(disciplinaEditandoId, {
          name: novaDisciplina.nome.trim(),
          credits: Number(novaDisciplina.creditos),
          workload: Number(novaDisciplina.cargaHoraria),
        })
        // Atualizar semestre da relação CourseDiscipline
        const semester = novaDisciplina.semestre ? Number(novaDisciplina.semestre) : undefined
        if (semester !== undefined) {
          await updateDisciplineSemester(cursoId, disciplinaEditandoId, semester)
        }
        // Recarregar disciplinas para obter dados atualizados
        await loadDisciplines()
        toast({
          variant: "success",
          title: "Disciplina atualizada",
          description: `"${novaDisciplina.nome}" atualizada com sucesso.`,
        })
      } else {
        // Modo criação
        const semester = novaDisciplina.semestre ? Number(novaDisciplina.semestre) : undefined
        
        if (disciplinaSelecionadaId) {
          // Disciplina existente selecionada - apenas associar ao curso
          await associateDisciplineToCourse(cursoId, disciplinaSelecionadaId, semester)
          await loadDisciplines()
          toast({
            variant: "success",
            title: "Disciplina vinculada",
            description: `"${novaDisciplina.nome}" vinculada ao curso com sucesso.`,
          })
        } else {
          // Nova disciplina - criar e associar
          if (!novaDisciplina.creditos || !novaDisciplina.cargaHoraria) {
            toast({
              variant: "error",
              title: "Dados incompletos",
              description: "Preencha creditos e carga horaria para criar a disciplina.",
            })
            return
          }
          const created = await createDiscipline({
            name: novaDisciplina.nome.trim(),
            credits: Number(novaDisciplina.creditos),
            workload: Number(novaDisciplina.cargaHoraria),
            courseId: cursoId,
          })
          // Se houver semestre, atualizar a relação CourseDiscipline
          if (semester) {
            await updateDisciplineSemester(cursoId, created.id, semester)
          }
          await loadDisciplines()
          toast({
            variant: "success",
            title: "Disciplina criada",
            description: `"${novaDisciplina.nome}" criada e vinculada ao curso.`,
          })
        }
      }
      resetDisciplinaForm()
      setDisciplinaEditandoId(null)
      setIsDisciplinaModalOpen(false)
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Nao foi possivel criar a disciplina"
      toast({
        variant: "error",
        title: "Erro ao salvar disciplina",
        description: Array.isArray(message) ? message.join(", ") : message,
      })
    } finally {
      setIsSavingDisciplina(false)
    }
  }

  const handleCreateTurma = async () => {
    if (!novaTurma.codigo.trim() || !novaTurma.disciplinaId) {
      toast({
        variant: "error",
        title: "Dados incompletos",
        description: "Informe o codigo da turma e selecione uma disciplina.",
      })
      return
    }

    try {
      setIsSavingTurma(true)
      if (turmaEditandoId) {
        const updated = await updateClass(turmaEditandoId, {
          code: novaTurma.codigo.trim(),
          semester: novaTurma.semestre.trim() || `${new Date().getFullYear()}-1`,
          year: Number(novaTurma.ano || new Date().getFullYear()),
          disciplineId: novaTurma.disciplinaId,
        })
        const mapped = mapClass(updated, cursoId)
        setTurmas((prev) => prev.map((t) => (t.id === turmaEditandoId ? mapped : t)))
      toast({
        variant: "success",
        title: "Turma atualizada",
        description: "Turma atualizada com sucesso.",
      })
      } else {
        const created = await createClass({
          code: novaTurma.codigo.trim(),
          semester: novaTurma.semestre.trim() || `${new Date().getFullYear()}-1`,
          year: Number(novaTurma.ano || new Date().getFullYear()),
          disciplineId: novaTurma.disciplinaId,
        })

        const mapped = mapClass(created, cursoId)
        setTurmas((prev) => {
          const updated = [...prev, mapped]
          setCurso((current) => (current ? { ...current, turmas: updated.length } : current))
          return updated
        })

        toast({
          variant: "success",
          title: "Turma criada",
          description: "Turma vinculada ao curso com sucesso.",
        })
      }
      resetTurmaForm()
      setTurmaEditandoId(null)
      setIsTurmaModalOpen(false)
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Nao foi possivel criar a turma"
      toast({
        variant: "error",
        title: "Erro ao criar turma",
        description: Array.isArray(message) ? message.join(", ") : message,
      })
    } finally {
      setIsSavingTurma(false)
    }
  }

  const handleEditarDisciplina = (disciplina: Disciplina) => {
    setDisciplinaEditandoId(disciplina.id)
    setNovaDisciplina({
      nome: disciplina.nome,
      creditos: String(disciplina.creditos || ""),
      cargaHoraria: String(disciplina.cargaHoraria || ""),
      semestre: String(disciplina.semestre || ""),
    })
    setIsDisciplinaModalOpen(true)
  }

  const handleToggleDisciplineStatusClick = (disciplina: Disciplina) => {
    setDisciplinaParaToggle(disciplina)
    setIsConfirmModalOpen(true)
  }

  const handleToggleDisciplineStatus = async () => {
    if (!cursoId || !disciplinaParaToggle?.id) return

    const novoStatus = disciplinaParaToggle.status === "ativa" ? "inactive" : "active"
    
    try {
      await toggleDisciplineStatus(cursoId, disciplinaParaToggle.id, novoStatus)
      // Atualizar apenas o status da disciplina na lista
      setDisciplinas((prev) =>
        prev.map((d) =>
          d.id === disciplinaParaToggle.id
            ? { ...d, status: novoStatus === "active" ? "ativa" : "inativa" }
            : d
        )
      )
      toast({
        variant: "success",
        title: "Status atualizado",
        description: `Disciplina "${disciplinaParaToggle.nome}" ${novoStatus === "active" ? "ativada" : "inativada"} com sucesso.`,
      })
      setIsConfirmModalOpen(false)
      setDisciplinaParaToggle(null)
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Nao foi possivel atualizar o status"
      toast({
        variant: "error",
        title: "Erro ao atualizar status",
        description: Array.isArray(message) ? message.join(", ") : message,
      })
    }
  }

  const handleEditarTurma = (turma: Turma) => {
    const [semestreParte, anoParte] = (turma.periodo || "").split("/") as [string, string?]
    setTurmaEditandoId(turma.id)
    setNovaTurma({
      codigo: turma.codigo,
      semestre: semestreParte || "",
      ano: anoParte || new Date().getFullYear().toString(),
      disciplinaId: disciplinas.find((d) => d.nome === turma.disciplina)?.id ?? disciplinas[0]?.id ?? "",
    })
    setIsTurmaModalOpen(true)
  }

  const isEmpty = !isLoading && !curso

  return (
    <div className={`flex h-screen ${isLiquidGlass ? "bg-black/30 dark:bg-gray-900/20" : "bg-background"}`}>
      <Sidebar userRole="coordenador" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Carregando curso...</span>
            </div>
          )}

          {isEmpty && (
            <LiquidGlassCard
              intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
              className={`text-center py-12 ${
                isLiquidGlass ? "bg-black/30 dark:bg-gray-800/20" : "bg-gray-50/60 dark:bg-gray-800/40"
              }`}
            >
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-semibold mb-2">Curso nao encontrado</p>
              <LiquidGlassButton
                variant="outline"
                onClick={() => router.push("/coordenador/cursos")}
                className="mt-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Cursos
              </LiquidGlassButton>
            </LiquidGlassCard>
          )}

          {!isLoading && curso && (
            <>
              <div
                className={`flex items-center justify-between mb-8 p-6 rounded-2xl border backdrop-blur-sm ${
                  isLiquidGlass
                    ? "bg-black/30 dark:bg-gray-800/20 border-gray-200/30 dark:border-gray-700/50"
                    : "bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <LiquidGlassButton variant="outline" size="sm" onClick={() => router.push("/coordenador/cursos")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                  </LiquidGlassButton>
                  <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">{curso.nome}</h1>
                    <p className="text-muted-foreground text-lg mt-1">
                      {curso.codigo} • {curso.departamento}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant={curso.status === "ativo" ? "default" : "secondary"}>
                        {curso.status === "ativo" ? "Ativo" : "Inativo"}
                      </Badge>
                      <Badge variant="outline">{curso.cargaHoraria}h</Badge>
                      <Badge variant="outline">{curso.duracao} semestres</Badge>
                    </div>
                    {turmas.length > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Turmas vinculadas: {turmas.map((turma) => turma.codigo).join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {curso.descricao && (
                <LiquidGlassCard
                  intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
                  className={`mb-6 ${
                    isLiquidGlass ? "bg-black/30 dark:bg-gray-800/20" : "bg-gray-50/60 dark:bg-gray-800/40"
                  }`}
                >
                  <CardHeader>
                    <CardTitle>Sobre o curso</CardTitle>
                    <CardDescription>Descricao geral</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{curso.descricao}</p>
                  </CardContent>
                </LiquidGlassCard>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Alunos</CardTitle>
                    <Users className="h-4 w-4 text-emerald-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{curso.alunos}</div>
                  </CardContent>
                </LiquidGlassCard>

                <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Disciplinas</CardTitle>
                    <GraduationCap className="h-4 w-4 text-purple-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {disciplinas.length}
                    </div>
                  </CardContent>
                </LiquidGlassCard>

                <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Turmas</CardTitle>
                    <Clock className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{turmas.length}</div>
                  </CardContent>
                </LiquidGlassCard>
              </div>

              <Tabs defaultValue="disciplinas" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="disciplinas">Disciplinas</TabsTrigger>
                  <TabsTrigger value="turmas">Turmas</TabsTrigger>
                  <TabsTrigger value="alunos">Alunos</TabsTrigger>
                </TabsList>

                <TabsContent value="disciplinas" className="space-y-6">
                  <LiquidGlassCard
                    intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
                    className={`${
                      isLiquidGlass ? "bg-black/30 dark:bg-gray-800/20" : "bg-gray-50/60 dark:bg-gray-800/40"
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Disciplinas</CardTitle>
                          <CardDescription>
                            {disciplinasFiltradas.length} disciplina
                            {disciplinasFiltradas.length !== 1 ? "s" : ""} encontrada
                            {disciplinasFiltradas.length !== 1 ? "s" : ""}
                          </CardDescription>
                        </div>
                        <LiquidGlassButton
                          size="sm"
                          onClick={() => {
                            resetDisciplinaForm()
                            setIsDisciplinaModalOpen(true)
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Nova disciplina
                        </LiquidGlassButton>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-4">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            placeholder="Buscar disciplinas..."
                            value={searchDisciplinas}
                            onChange={(e) => setSearchDisciplinas(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        <select
                          value={filtroTipoDisciplina}
                          onChange={(e) => setFiltroTipoDisciplina(e.target.value as typeof filtroTipoDisciplina)}
                          className="px-3 py-2 border rounded-md bg-background"
                        >
                          <option value="todas">Todas</option>
                          <option value="obrigatoria">Obrigatorias</option>
                          <option value="optativa">Optativas</option>
                        </select>
                        <select
                          value={filtroStatusDisciplina}
                          onChange={(e) => setFiltroStatusDisciplina(e.target.value as typeof filtroStatusDisciplina)}
                          className="px-3 py-2 border rounded-md bg-background"
                        >
                          <option value="todas">Todas</option>
                          <option value="ativa">Ativas</option>
                          <option value="inativa">Inativas</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        {disciplinasFiltradas.map((disciplina) => (
                          <div
                            key={disciplina.id}
                            className={`p-4 border rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors ${
                              disciplina.status === "inativa" ? "opacity-60" : ""
                            } ${
                              isLiquidGlass
                                ? "border-gray-200/30 dark:border-gray-700/50"
                                : "border-gray-200 dark:border-gray-700"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold">{disciplina.nome}</h4>
                                  <Badge variant="outline" className="font-mono text-xs">
                                    {disciplina.codigo}
                                  </Badge>
                                  <Badge variant={disciplina.tipo === "obrigatoria" ? "default" : "secondary"}>
                                    {disciplina.tipo === "obrigatoria" ? "Obrigatoria" : "Optativa"}
                                  </Badge>
                                  <Badge variant={disciplina.status === "ativa" ? "default" : "secondary"}>
                                    {disciplina.status === "ativa" ? "Ativa" : "Inativa"}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-4 gap-4 text-sm text-muted-foreground">
                                  <div>
                                    <span className="font-semibold">Semestre:</span> {disciplina.semestre ?? "-"}
                                  </div>
                                  <div>
                                    <span className="font-semibold">CH:</span> {disciplina.cargaHoraria}h
                                  </div>
                                  <div>
                                    <span className="font-semibold">Creditos:</span> {disciplina.creditos}
                                  </div>
                                  <div>
                                    <span className="font-semibold">Professor:</span>{" "}
                                    {disciplina.professor ?? "Sem professor"}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleEditarDisciplina(disciplina)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant={disciplina.status === "ativa" ? "destructive" : "default"}
                                  size="sm"
                                  onClick={() => handleToggleDisciplineStatusClick(disciplina)}
                                  title={disciplina.status === "ativa" ? "Inativar disciplina" : "Ativar disciplina"}
                                >
                                  {disciplina.status === "ativa" ? (
                                    <PowerOff className="h-4 w-4" />
                                  ) : (
                                    <Power className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {disciplinasFiltradas.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">Nenhuma disciplina encontrada</div>
                      )}
                    </CardContent>
                  </LiquidGlassCard>
                </TabsContent>

                <TabsContent value="turmas" className="space-y-6">
                  <LiquidGlassCard
                    intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
                    className={`${
                      isLiquidGlass ? "bg-black/30 dark:bg-gray-800/20" : "bg-gray-50/60 dark:bg-gray-800/40"
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Turmas</CardTitle>
                          <CardDescription>
                            {turmasFiltradas.length} turma
                            {turmasFiltradas.length !== 1 ? "s" : ""} encontrada
                            {turmasFiltradas.length !== 1 ? "s" : ""}
                          </CardDescription>
                        </div>
                        <LiquidGlassButton
                          size="sm"
                          disabled={disciplinas.length === 0}
                          onClick={() => {
                            resetTurmaForm()
                            setIsTurmaModalOpen(true)
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Nova turma
                        </LiquidGlassButton>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-4">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            placeholder="Buscar turmas..."
                            value={searchTurmas}
                            onChange={(e) => setSearchTurmas(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        <select
                          value={filtroStatusTurma}
                          onChange={(e) => setFiltroStatusTurma(e.target.value as typeof filtroStatusTurma)}
                          className="px-3 py-2 border rounded-md bg-background"
                        >
                          <option value="todas">Todas</option>
                          <option value="ativa">Ativas</option>
                          <option value="inativa">Inativas</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        {turmasFiltradas.map((turma) => (
                          <div
                            key={turma.id}
                            className={`p-4 border rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors ${
                              isLiquidGlass
                                ? "border-gray-200/30 dark:border-gray-700/50"
                                : "border-gray-200 dark:border-gray-700"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold">{turma.disciplina}</h4>
                                  <Badge variant="outline" className="font-mono text-xs">
                                    {turma.codigo}
                                  </Badge>
                                  <Badge variant={turma.status === "ativa" ? "default" : "secondary"}>
                                    {turma.status === "ativa" ? "Ativa" : "Inativa"}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                                  <div>
                                    <span className="font-semibold">Professor:</span> {turma.professor}
                                  </div>
                                  <div>
                                    <span className="font-semibold">Periodo:</span> {turma.periodo}
                                  </div>
                                  <div>
                                    <span className="font-semibold">Horario:</span> {turma.horario}
                                  </div>
                                  <div>
                                    <span className="font-semibold">Sala:</span> {turma.sala}
                                  </div>
                                </div>
                                <div className="mt-2 flex items-center gap-2 text-sm">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                  <span>
                                    {turma.alunos} / {turma.capacidade} alunos
                                  </span>
                                  <div className="flex-1 max-w-xs">
                                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-emerald-600"
                                        style={{
                                          width: `${Math.min(100, (turma.alunos / (turma.capacidade || 1)) * 100)}%`
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleEditarTurma(turma)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {turmasFiltradas.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">Nenhuma turma encontrada</div>
                      )}
                    </CardContent>
                  </LiquidGlassCard>
                </TabsContent>

                <TabsContent value="alunos" className="space-y-6">
                  <LiquidGlassCard
                    intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
                    className={`${
                      isLiquidGlass ? "bg-black/30 dark:bg-gray-800/20" : "bg-gray-50/60 dark:bg-gray-800/40"
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Alunos</CardTitle>
                          <CardDescription>
                            {alunosFiltrados.length} aluno{alunosFiltrados.length !== 1 ? "s" : ""} encontrado
                            {alunosFiltrados.length !== 1 ? "s" : ""}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          placeholder="Buscar alunos por nome, email ou matrícula..."
                          value={searchAlunos}
                          onChange={(e) => setSearchAlunos(e.target.value)}
                          className="pl-10"
                        />
                      </div>

                      <div className="space-y-2">
                        {alunosFiltrados.map((aluno) => (
                          <div
                            key={aluno.id}
                            className={`p-4 border rounded-xl ${
                              isLiquidGlass
                                ? "border-gray-200/30 dark:border-gray-700/50"
                                : "border-gray-200 dark:border-gray-700"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold">{aluno.nome}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {aluno.email ?? "Email nao informado"} • {aluno.matricula ?? "Matricula nao informada"}
                                </p>
                              </div>
                              {aluno.status && (
                                <Badge variant={aluno.status.toLowerCase() === "active" ? "default" : "secondary"}>
                                  {aluno.status}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {alunosFiltrados.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">Nenhum aluno encontrado</div>
                      )}
                    </CardContent>
                  </LiquidGlassCard>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>

      <Dialog
        open={isDisciplinaModalOpen}
        onOpenChange={(open) => {
          setIsDisciplinaModalOpen(open)
          if (!open) {
            resetDisciplinaForm()
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{disciplinaEditandoId ? "Editar disciplina" : "Nova disciplina"}</DialogTitle>
            <DialogDescription>
              {disciplinaEditandoId ? "Atualize os dados da disciplina vinculada ao curso." : "Vincule uma disciplina a este curso."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="nome-disciplina">Nome</Label>
              {disciplinaEditandoId ? (
                <Input
                  id="nome-disciplina"
                  value={novaDisciplina.nome}
                  onChange={(e) => setNovaDisciplina({ ...novaDisciplina, nome: e.target.value })}
                  placeholder="Ex: Algoritmos"
                />
              ) : (
                <Combobox
                  placeholder="Digite para buscar ou criar nova disciplina..."
                  options={disciplinasOptions}
                  value={disciplinaSelecionadaId}
                  onChange={async (selectedId) => {
                    setDisciplinaSelecionadaId(selectedId)
                    if (selectedId) {
                      // Carregar dados da disciplina selecionada
                      try {
                        const allDisciplines = await getAllDisciplines()
                        const selected = allDisciplines.find((d) => d.id === selectedId)
                        if (selected) {
                          setNovaDisciplina({
                            nome: selected.name,
                            creditos: String(selected.credits ?? ""),
                            cargaHoraria: String(selected.workLoad ?? selected.workload ?? ""),
                            semestre: "",
                          })
                        }
                      } catch (error) {
                        console.error("Erro ao carregar disciplina:", error)
                      }
                    }
                  }}
                  onSearch={(query) => {
                    // Atualizar nome quando usuário digita (modo custom input)
                    if (!disciplinaSelecionadaId) {
                      setNovaDisciplina((prev) => ({
                        ...prev,
                        nome: query,
                      }))
                    }
                    handleSearchDisciplines(query)
                  }}
                  allowCustomInput={true}
                />
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="creditos-disciplina">Creditos</Label>
                <Input
                  id="creditos-disciplina"
                  type="number"
                  value={novaDisciplina.creditos}
                  onChange={(e) => setNovaDisciplina({ ...novaDisciplina, creditos: e.target.value })}
                  min="0"
                  placeholder="Ex: 4"
                />
              </div>
              <div>
                <Label htmlFor="carga-disciplina">Carga horaria (h)</Label>
                <Input
                  id="carga-disciplina"
                  type="number"
                  value={novaDisciplina.cargaHoraria}
                  onChange={(e) => setNovaDisciplina({ ...novaDisciplina, cargaHoraria: e.target.value })}
                  min="0"
                  placeholder="Ex: 60"
                />
              </div>
              <div>
                <Label htmlFor="semestre-disciplina">Semestre</Label>
                <Input
                  id="semestre-disciplina"
                  type="number"
                  value={novaDisciplina.semestre}
                  onChange={(e) => setNovaDisciplina({ ...novaDisciplina, semestre: e.target.value })}
                  min="1"
                  max="20"
                  placeholder="Ex: 1"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                resetDisciplinaForm()
                setIsDisciplinaModalOpen(false)
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateDisciplina} disabled={isSavingDisciplina}>
              {isSavingDisciplina && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {disciplinaEditandoId ? "Salvar alterações" : "Salvar disciplina"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isTurmaModalOpen}
        onOpenChange={(open) => {
          setIsTurmaModalOpen(open)
          if (!open) {
            resetTurmaForm()
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{turmaEditandoId ? "Editar turma" : "Nova turma"}</DialogTitle>
            <DialogDescription>Cadastre ou edite uma turma vinculada a uma disciplina deste curso.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="codigo-turma">Codigo da turma</Label>
              <Input
                id="codigo-turma"
                value={novaTurma.codigo}
                onChange={(e) => setNovaTurma({ ...novaTurma, codigo: e.target.value })}
                placeholder="Ex: TURMA-01"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="semestre-turma">Semestre</Label>
                <Input
                  id="semestre-turma"
                  value={novaTurma.semestre}
                  onChange={(e) => setNovaTurma({ ...novaTurma, semestre: e.target.value })}
                  placeholder="Ex: 2025-1"
                />
              </div>
              <div>
                <Label htmlFor="ano-turma">Ano</Label>
                <Input
                  id="ano-turma"
                  type="number"
                  value={novaTurma.ano}
                  onChange={(e) => setNovaTurma({ ...novaTurma, ano: e.target.value })}
                  placeholder={new Date().getFullYear().toString()}
                  min="2000"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="disciplina-turma">Disciplina</Label>
              <select
                id="disciplina-turma"
                className="w-full border rounded-md px-3 py-2 bg-background"
                value={novaTurma.disciplinaId}
                onChange={(e) => setNovaTurma({ ...novaTurma, disciplinaId: e.target.value })}
                disabled={disciplinas.length === 0}
              >
                {disciplinas.map((disciplina) => (
                  <option key={disciplina.id} value={disciplina.id}>
                    {disciplina.nome}
                  </option>
                ))}
                {disciplinas.length === 0 && <option value="">Cadastre uma disciplina primeiro</option>}
              </select>
              {disciplinas.length === 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  Cadastre uma disciplina antes de criar turmas para este curso.
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                resetTurmaForm()
                setIsTurmaModalOpen(false)
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateTurma} disabled={isSavingTurma || disciplinas.length === 0}>
              {isSavingTurma && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {turmaEditandoId ? "Salvar alterações" : "Criar turma"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ModalConfirmacao
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false)
          setDisciplinaParaToggle(null)
        }}
        onConfirm={handleToggleDisciplineStatus}
        title={disciplinaParaToggle?.status === "ativa" ? "Inativar disciplina" : "Ativar disciplina"}
        description={
          disciplinaParaToggle
            ? `Tem certeza que deseja ${disciplinaParaToggle.status === "ativa" ? "inativar" : "ativar"} a disciplina "${disciplinaParaToggle.nome}"?`
            : ""
        }
        confirmLabel={disciplinaParaToggle?.status === "ativa" ? "Inativar" : "Ativar"}
        cancelLabel="Cancelar"
      />
    </div>
  )
}
