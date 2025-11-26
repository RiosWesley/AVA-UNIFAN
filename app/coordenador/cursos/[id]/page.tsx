"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
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
import { BookOpen, ArrowLeft, Users, GraduationCap, Clock, Edit, Plus, Search, Loader2, PowerOff, Power, Eye, X } from "lucide-react"
import { toast } from "@/components/ui/toast"
import { ModalConfirmacao } from "@/components/modals/modal-confirmacao"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
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
  updateDisciplineType,
  type BackendClass,
  type BackendCourse,
  type BackendDiscipline,
  type BackendCourseStudent
} from "@/src/services/coursesService"
import { Combobox } from "@/components/ui/combobox"
import { getCurrentUser } from "@/src/services/professor-dashboard"
import { getDepartmentTeachers, type Teacher } from "@/src/services/departmentsService"
import { getAcademicPeriodByPeriod } from "@/src/services/academicPeriodsService"
import { createEnrollment, checkStudentDisciplineStatus, getEnrollmentsByClass, type EnrollmentDTO } from "@/src/services/enrollmentsService"
import { UserPlus } from "lucide-react"

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
  capacidade?: number
  status: "ativa" | "inativa"
  courseId?: string
  semestre?: string
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

const mapDiscipline = (d: BackendDiscipline): Disciplina => ({
  id: d.id,
  nome: d.name,
  codigo: d.code ?? "",
  cargaHoraria: d.workLoad ?? d.workload ?? d.workloadHours ?? 0,
  creditos: d.credits ?? 0,
  semestre: d.semester,
  tipo: d.type === "optional" ? "optativa" : "obrigatoria",
  status: d.status === "inactive" ? "inativa" : "ativa",
  courseId: d.courseId ?? d.course?.id
})

const mapClass = (c: BackendClass): Turma => {
  // Extrair semestre de academicPeriod.period ou period
  let semestre: string | undefined
  if (c.academicPeriod?.period) {
    semestre = c.academicPeriod.period
  } else if (c.period) {
    const periodParts = c.period.split('/')
    if (periodParts.length > 0) {
      semestre = periodParts[0].replace('-', '.')
    } else {
      semestre = c.period.replace('-', '.')
    }
  }

  return {
    id: c.id,
    codigo: c.code,
    disciplina: c.discipline?.name ?? "Sem disciplina",
    professor: c.teacher?.name ?? "Sem professor",
    periodo: c.period ?? "Periodo nao informado",
    horario: (() => {
      const scheduleFromArray = c.schedules?.[0]
      if (scheduleFromArray) {
        return `${scheduleFromArray.dayOfWeek} ${scheduleFromArray.startTime}-${scheduleFromArray.endTime}`
      }
      return c.schedule ?? "Horario nao informado"
    })(),
    sala: (() => {
      const scheduleFromArray = c.schedules?.[0]
      if (scheduleFromArray?.room) return scheduleFromArray.room
      if (c.room) return c.room
      return "Sala nao informada"
    })(),
    alunos: c.studentsCount ?? 0,
    capacidade: c.capacity ?? undefined,
    status: c.status === "inactive" ? "inativa" : "ativa",
    courseId: c.courseId ?? c.course?.id,
    semestre
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
  const [turmasBackend, setTurmasBackend] = useState<BackendClass[]>([])
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [professores, setProfessores] = useState<Teacher[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [searchDisciplinas, setSearchDisciplinas] = useState("")
  const [searchTurmas, setSearchTurmas] = useState("")
  const [searchAlunos, setSearchAlunos] = useState("")
  const [filtroTipoDisciplina, setFiltroTipoDisciplina] = useState<"todas" | "obrigatoria" | "optativa">("todas")
  const [filtroStatusDisciplina, setFiltroStatusDisciplina] = useState<"todas" | "ativa" | "inativa">("todas")
  const [filtroStatusTurma, setFiltroStatusTurma] = useState<"todas" | "ativa" | "inativa">("todas")
  const [semestreSelecionado, setSemestreSelecionado] = useState<string>("")
  const [semestres, setSemestres] = useState<Array<{ id: string; nome: string; ativo: boolean }>>([])
  const [isDisciplinaModalOpen, setIsDisciplinaModalOpen] = useState(false)
  const [isTurmaModalOpen, setIsTurmaModalOpen] = useState(false)
  const [isSavingDisciplina, setIsSavingDisciplina] = useState(false)
  const [isSavingTurma, setIsSavingTurma] = useState(false)
  const [disciplinaEditandoId, setDisciplinaEditandoId] = useState<string | null>(null)
  const [turmaEditandoId, setTurmaEditandoId] = useState<string | null>(null)
  const [novaDisciplina, setNovaDisciplina] = useState({
    nome: "",
    creditos: "",
    cargaHoraria: "",
    semestre: "",
    tipo: "obrigatoria" as "obrigatoria" | "optativa"
  })
  const [novaTurma, setNovaTurma] = useState({
    codigo: "",
    semestre: "",
    ano: new Date().getFullYear().toString(),
    disciplinaId: "",
    teacherId: "",
    dayOfWeek: "",
    startTime: "",
    endTime: "",
    room: ""
  })
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false)
  const [turmaSelecionadaParaMatricula, setTurmaSelecionadaParaMatricula] = useState<Turma | null>(null)
  const [alunoSelecionadoParaMatricula, setAlunoSelecionadoParaMatricula] = useState<string>("")
  const [alunosSelecionadosParaMatricula, setAlunosSelecionadosParaMatricula] = useState<string[]>([])
  const [alunosMatriculadosNaTurma, setAlunosMatriculadosNaTurma] = useState<EnrollmentDTO[]>([])
  const [isLoadingEnrolledForFilter, setIsLoadingEnrolledForFilter] = useState(false)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [enrollmentValidationError, setEnrollmentValidationError] = useState<string | null>(null)
  const [isEnrolledStudentsModalOpen, setIsEnrolledStudentsModalOpen] = useState(false)
  const [turmaParaListarAlunos, setTurmaParaListarAlunos] = useState<Turma | null>(null)
  const [enrolledStudents, setEnrolledStudents] = useState<EnrollmentDTO[]>([])
  const [isLoadingEnrolledStudents, setIsLoadingEnrolledStudents] = useState(false)
  const [searchEnrolledStudents, setSearchEnrolledStudents] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [allDisciplines, setAllDisciplines] = useState<BackendDiscipline[]>([])
  const [selectedDisciplineId, setSelectedDisciplineId] = useState<string | null>(null)
  const [isLoadingDisciplines, setIsLoadingDisciplines] = useState(false)

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

  // Verificar autenticação
  useEffect(() => {
    const init = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("ava:token") : null
        if (!token) {
          router.push("/")
          return
        }
        const user = await getCurrentUser()
        if (!user?.id) {
          router.push("/")
        }
      } catch (error) {
        console.error("Erro ao buscar usuário:", error)
        router.push("/")
      }
    }
    init()
  }, [router])

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
        .map((classe) => mapClass(classe))
        .filter((t) => t.status === "ativa")
      const mappedDisciplines = disciplinesData
        .map((disciplina) => mapDiscipline(disciplina))
        .filter((d) => d.status === "ativa")

      const cursoMapeado = mapCourse(courseData)
      setCurso({
        ...cursoMapeado,
        alunos: mappedStudents.length,
        turmas: mappedClasses.length,
      })
      setDisciplinas(mappedDisciplines)
      setTurmas(mappedClasses)
      setTurmasBackend(classesData)
      setAlunos(mappedStudents)

      // Buscar enrollments reais de cada turma para atualizar contagem de alunos
      try {
        const enrollmentsCounts = await Promise.all(
          mappedClasses.map(async (turma) => {
            try {
              const enrollments = await getEnrollmentsByClass(turma.id)
              return { turmaId: turma.id, count: enrollments.length }
            } catch (error) {
              console.error(`Erro ao buscar enrollments da turma ${turma.id}:`, error)
              return { turmaId: turma.id, count: turma.alunos } // Usar contagem do backend em caso de erro
            }
          })
        )

        // Atualizar contagem de alunos baseada nos enrollments reais
        setTurmas((prev) =>
          prev.map((t) => {
            const enrollmentCount = enrollmentsCounts.find((ec) => ec.turmaId === t.id)
            return enrollmentCount ? { ...t, alunos: enrollmentCount.count } : t
          })
        )
      } catch (error) {
        console.error("Erro ao buscar enrollments das turmas:", error)
        // Em caso de erro, manter contagem do backend
      }

      // Buscar professores do departamento do curso
      if (courseData.department?.id) {
        try {
          const teachers = await getDepartmentTeachers(courseData.department.id)
          setProfessores(teachers)
        } catch (error) {
          console.error("Erro ao buscar professores:", error)
          setProfessores([])
        }
      }
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

  useEffect(() => {
    loadData()
  }, [loadData])

  // Buscar semestres disponíveis baseados nas turmas do curso
  useEffect(() => {
    if (isLoading) return

    const semestresMap = new Map<string, { id: string; nome: string; ativo: boolean }>()
    
    // Buscar semestres das turmas
    turmas.forEach(turma => {
      if (turma.semestre) {
        if (!semestresMap.has(turma.semestre)) {
          semestresMap.set(turma.semestre, {
            id: turma.semestre,
            nome: turma.semestre,
            ativo: false
          })
        }
      }
    })

    // Também buscar semestres diretamente das turmasBackend (caso o mapClass não tenha capturado)
    turmasBackend.forEach(turma => {
      if (turma.academicPeriod?.period) {
        const period = turma.academicPeriod.period
        if (!semestresMap.has(period)) {
          semestresMap.set(period, {
            id: period,
            nome: period,
            ativo: false
          })
        }
      }
    })

    const semestresArray = Array.from(semestresMap.values()).sort((a, b) => {
      const [yearA, semA] = a.id.split('.').map(Number)
      const [yearB, semB] = b.id.split('.').map(Number)
      if (yearA !== yearB) return yearB - yearA
      return semB - semA
    })

    if (semestresArray.length > 0) {
      semestresArray[0].ativo = true
      setSemestres(semestresArray)
      
      // Selecionar semestre ativo ou o primeiro disponível
      const semestreAtivo = semestresArray.find(s => s.ativo)
      if (semestreAtivo && !semestreSelecionado) {
        setSemestreSelecionado(semestreAtivo.id)
      } else if (semestresArray.length > 0 && !semestreSelecionado) {
        setSemestreSelecionado(semestresArray[0].id)
      }
    } else {
      // Garantir que a lista de semestres seja limpa se não houver nenhum
      setSemestres([])
    }
  }, [turmas, turmasBackend, isLoading])

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
      const matchesSemestre = !semestreSelecionado || t.semestre === semestreSelecionado
      return matchesSearch && matchesStatus && matchesSemestre
    })
  }, [turmas, searchTurmas, filtroStatusTurma, semestreSelecionado])

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
    setSelectedDisciplineId(null)
    setNovaDisciplina({
      nome: "",
      creditos: "",
      cargaHoraria: "",
      semestre: "",
      tipo: "obrigatoria",
    })
  }

  const loadAllDisciplines = useCallback(async () => {
    try {
      setIsLoadingDisciplines(true)
      const disciplines = await getAllDisciplines()
      setAllDisciplines(disciplines)
    } catch (error: any) {
      console.error("Erro ao buscar disciplinas:", error)
      toast({
        variant: "error",
        title: "Erro ao carregar disciplinas",
        description: "Não foi possível carregar a lista de disciplinas disponíveis.",
      })
      setAllDisciplines([])
    } finally {
      setIsLoadingDisciplines(false)
    }
  }, [])

  // Carregar todas as disciplinas quando o modal de disciplina abrir
  useEffect(() => {
    if (isDisciplinaModalOpen && !disciplinaEditandoId) {
      loadAllDisciplines()
    } else if (!isDisciplinaModalOpen) {
      // Limpar seleção quando o modal fecha
      setSelectedDisciplineId(null)
    }
  }, [isDisciplinaModalOpen, disciplinaEditandoId, loadAllDisciplines])

  // Mapear disciplinas para opções do Combobox
  const disciplineOptions = useMemo(() => {
    return allDisciplines.map((d) => ({
      id: d.id,
      label: `${d.name} (${d.credits || 0} créditos, ${d.workload || d.workLoad || 0}h)`,
    }))
  }, [allDisciplines])

  const resetTurmaForm = () => {
    setTurmaEditandoId(null)
    setNovaTurma({
      codigo: "",
      semestre: "",
      ano: new Date().getFullYear().toString(),
      disciplinaId: disciplinas[0]?.id ?? "",
      teacherId: "",
      dayOfWeek: "",
      startTime: "",
      endTime: "",
      room: ""
    })
  }

  const handleCreateDisciplina = async () => {
    // Se uma disciplina existente está selecionada, apenas associar ao curso
    if (selectedDisciplineId) {
      try {
        setIsSavingDisciplina(true)
        const semester = novaDisciplina.semestre ? Number(novaDisciplina.semestre) : undefined
        const type = novaDisciplina.tipo === "obrigatoria" ? "required" : "optional"
        await associateDisciplineToCourse(cursoId, selectedDisciplineId, semester, type)
        
        // Recarregar disciplinas do curso
        const disciplinesData = await getCourseDisciplines(cursoId)
        const mappedDisciplines = disciplinesData
          .map((disciplina) => mapDiscipline(disciplina))
          .filter((d) => d.status === "ativa")
        setDisciplinas(mappedDisciplines)
        
        toast({
          variant: "success",
          title: "Disciplina vinculada",
          description: "Disciplina existente vinculada ao curso com sucesso.",
        })
        resetDisciplinaForm()
        setDisciplinaEditandoId(null)
        setIsDisciplinaModalOpen(false)
      } catch (error: any) {
        const message = error?.response?.data?.message || error?.message || "Não foi possível vincular a disciplina"
        toast({
          variant: "error",
          title: "Erro ao vincular disciplina",
          description: Array.isArray(message) ? message.join(", ") : message,
        })
      } finally {
        setIsSavingDisciplina(false)
      }
      return
    }

    // Validação para criar nova disciplina
    if (!novaDisciplina.nome.trim() || !novaDisciplina.creditos || !novaDisciplina.cargaHoraria) {
      toast({
        variant: "error",
        title: "Dados incompletos",
        description: "Preencha nome, creditos e carga horaria para salvar a disciplina.",
      })
      return
    }

    try {
      setIsSavingDisciplina(true)
      if (disciplinaEditandoId) {
        const updated = await updateDiscipline(disciplinaEditandoId, {
          name: novaDisciplina.nome.trim(),
          credits: Number(novaDisciplina.creditos),
          workload: Number(novaDisciplina.cargaHoraria),
        })
        
        // Atualizar semestre se fornecido
        if (novaDisciplina.semestre) {
          try {
            await updateDisciplineSemester(cursoId, disciplinaEditandoId, Number(novaDisciplina.semestre))
          } catch (error) {
            console.error("Erro ao atualizar semestre da disciplina:", error)
            // Não falhar a atualização se o semestre não puder ser atualizado
          }
        } else {
          // Se semestre vazio, definir como null
          try {
            await updateDisciplineSemester(cursoId, disciplinaEditandoId, undefined)
          } catch (error) {
            console.error("Erro ao remover semestre da disciplina:", error)
          }
        }

        // Atualizar tipo
        try {
          const type = novaDisciplina.tipo === "obrigatoria" ? "required" : "optional"
          await updateDisciplineType(cursoId, disciplinaEditandoId, type)
        } catch (error) {
          console.error("Erro ao atualizar tipo da disciplina:", error)
          // Não falhar a atualização se o tipo não puder ser atualizado
        }

        // Recarregar disciplinas para obter o semestre atualizado
        const disciplinesData = await getCourseDisciplines(cursoId)
        const mappedDisciplines = disciplinesData
          .map((disciplina) => mapDiscipline(disciplina))
          .filter((d) => d.status === "ativa")
        setDisciplinas(mappedDisciplines)

        toast({
          variant: "success",
          title: "Disciplina atualizada",
          description: `"${novaDisciplina.nome}" atualizada com sucesso.`,
        })
      } else {
        const created = await createDiscipline({
          name: novaDisciplina.nome.trim(),
          credits: Number(novaDisciplina.creditos),
          workload: Number(novaDisciplina.cargaHoraria),
          courseId: cursoId,
        })

        // Atualizar semestre se fornecido
        if (novaDisciplina.semestre) {
          try {
            await updateDisciplineSemester(cursoId, created.id, Number(novaDisciplina.semestre))
          } catch (error) {
            console.error("Erro ao atualizar semestre da disciplina:", error)
            // Não falhar a criação se o semestre não puder ser atualizado
          }
        }

        // Atualizar tipo se fornecido
        try {
          const type = novaDisciplina.tipo === "obrigatoria" ? "required" : "optional"
          await updateDisciplineType(cursoId, created.id, type)
        } catch (error) {
          console.error("Erro ao atualizar tipo da disciplina:", error)
          // Não falhar a criação se o tipo não puder ser atualizado
        }

        // Recarregar disciplinas para obter o semestre atualizado
        const disciplinesData = await getCourseDisciplines(cursoId)
        const mappedDisciplines = disciplinesData
          .map((disciplina) => mapDiscipline(disciplina))
          .filter((d) => d.status === "ativa")
        setDisciplinas(mappedDisciplines)

        toast({
          variant: "success",
          title: "Disciplina adicionada",
          description: `"${novaDisciplina.nome}" vinculada ao curso.`,
        })
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

    // Validar semestre apenas para criação de nova turma
    if (!turmaEditandoId && !semestreSelecionado) {
      toast({
        variant: "error",
        title: "Semestre não selecionado",
        description: "Selecione um semestre na aba de turmas antes de criar uma nova turma.",
      })
      return
    }

    try {
      setIsSavingTurma(true)
      if (turmaEditandoId) {
        // Converter formato "YYYY.S" para "YYYY-S" para o backend (usar semestre da turma editada se disponível)
        // Buscar academicPeriodId da turma sendo editada
        const turmaBackendParaEdicao = turmasBackend.find((t) => t.id === turmaEditandoId)
        const academicPeriodIdParaEdicao = turmaBackendParaEdicao?.academicPeriod?.id

        if (!academicPeriodIdParaEdicao) {
          toast({
            variant: "error",
            title: "Período letivo não encontrado",
            description: "Não foi possível determinar o período letivo da turma.",
          })
          setIsSavingTurma(false)
          return
        }

        // Extrair ano do semestre da turma ou usar o ano atual
        const semestreFromTurma = novaTurma.semestre || turmaBackendParaEdicao?.academicPeriod?.period || ''
        const [yearFromSemester] = semestreFromTurma.split(/[.-]/).map(Number)

        const updatePayload: any = {
          code: novaTurma.codigo.trim(),
          academicPeriodId: academicPeriodIdParaEdicao,
          year: yearFromSemester || Number(novaTurma.ano || new Date().getFullYear()),
          disciplineId: novaTurma.disciplinaId,
        }

        if (novaTurma.teacherId) {
          updatePayload.teacherId = novaTurma.teacherId
        }


        const hasScheduleFields = [novaTurma.dayOfWeek, novaTurma.startTime, novaTurma.endTime, novaTurma.room]
          .some((value) => (value ?? '').toString().trim() !== '')

        if (hasScheduleFields) {
          if (novaTurma.dayOfWeek) {
            updatePayload.dayOfWeek = novaTurma.dayOfWeek
          }
          if (novaTurma.startTime) {
            updatePayload.startTime = novaTurma.startTime
          }
          if (novaTurma.endTime) {
            updatePayload.endTime = novaTurma.endTime
          }
          if (novaTurma.room) {
            updatePayload.room = novaTurma.room.trim()
          }
        }

        const updated = await updateClass(turmaEditandoId, updatePayload)
        const mapped = mapClass(updated)
        setTurmas((prev) => prev.map((t) => (t.id === turmaEditandoId ? mapped : t)))
        // Atualizar também turmasBackend para manter sincronizado
        setTurmasBackend((prev) => prev.map((t) => (t.id === turmaEditandoId ? updated : t)))
      toast({
        variant: "success",
        title: "Turma atualizada",
        description: "Turma atualizada com sucesso.",
      })
      } else {
        // Buscar academicPeriodId baseado no semestre selecionado
        const normalizedPeriod = semestreSelecionado.replace('-', '.')
        const academicPeriod = await getAcademicPeriodByPeriod(normalizedPeriod)
        
        if (!academicPeriod) {
          toast({
            variant: "error",
            title: "Período letivo não encontrado",
            description: `O período letivo "${semestreSelecionado}" não foi encontrado.`,
          })
          setIsSavingTurma(false)
          return
        }

        // Extrair ano do semestre (formato: "YYYY.S")
        const [yearFromSemester] = semestreSelecionado.split('.').map(Number)

        const payload: any = {
          code: novaTurma.codigo.trim(),
          academicPeriodId: academicPeriod.id,
          year: yearFromSemester || new Date().getFullYear(),
          disciplineId: novaTurma.disciplinaId,
        }

        // Incluir teacherId se selecionado
        if (novaTurma.teacherId) {
          payload.teacherId = novaTurma.teacherId
        }

        // Incluir campos de schedule se preenchidos
        if (novaTurma.dayOfWeek && novaTurma.startTime && novaTurma.endTime) {
          payload.dayOfWeek = novaTurma.dayOfWeek
          payload.startTime = novaTurma.startTime
          payload.endTime = novaTurma.endTime
          if (novaTurma.room) {
            payload.room = novaTurma.room.trim()
          }
        }

        const created = await createClass(payload)

        const mapped = mapClass(created)
        setTurmas((prev) => {
          const updated = [...prev, mapped]
          setCurso((current) => (current ? { ...current, turmas: updated.length } : current))
          return updated
        })
        // Atualizar também turmasBackend para manter sincronizado
        setTurmasBackend((prev) => [...prev, created])

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
    setSelectedDisciplineId(null)
    setNovaDisciplina({
      nome: disciplina.nome,
      creditos: String(disciplina.creditos || ""),
      cargaHoraria: String(disciplina.cargaHoraria || ""),
      semestre: String(disciplina.semestre || ""),
      tipo: disciplina.tipo || "obrigatoria",
    })
    setIsDisciplinaModalOpen(true)
  }

  const handleDisciplineSelect = (disciplineId: string | null) => {
    setSelectedDisciplineId(disciplineId)
    
    if (disciplineId) {
      // Carregar dados da disciplina selecionada
      const selectedDiscipline = allDisciplines.find((d) => d.id === disciplineId)
      if (selectedDiscipline) {
        setNovaDisciplina({
          nome: selectedDiscipline.name,
          creditos: String(selectedDiscipline.credits || ""),
          cargaHoraria: String(selectedDiscipline.workload || selectedDiscipline.workLoad || ""),
          semestre: "",
          tipo: "obrigatoria",
        })
      }
    }
    // Se disciplineId é null, manter o nome digitado (será capturado via onSearch)
  }

  const handleDisciplineSearch = (query: string) => {
    // Quando o usuário digita e não há seleção, atualizar o nome
    if (!selectedDisciplineId) {
      setNovaDisciplina((prev) => ({
        ...prev,
        nome: query,
      }))
    }
  }

  const handleClearDisciplineSelection = () => {
    setSelectedDisciplineId(null)
    setNovaDisciplina({
      nome: "",
      creditos: "",
      cargaHoraria: "",
      semestre: "",
      tipo: "obrigatoria",
    })
  }

  const handleToggleDisciplineStatusClick = async (disciplina: Disciplina) => {
    const newStatus = disciplina.status === "ativa" ? "inactive" : "active"
    const statusLabel = newStatus === "active" ? "ativar" : "inativar"

    try {
      await toggleDisciplineStatus(cursoId, disciplina.id, newStatus)
      
      // Atualizar a lista de disciplinas
      setDisciplinas((prev) =>
        prev.map((d) =>
          d.id === disciplina.id
            ? { ...d, status: newStatus === "active" ? "ativa" : "inativa" }
            : d
        )
      )

      toast({
        variant: "success",
        title: "Status atualizado",
        description: `Disciplina "${disciplina.nome}" ${statusLabel}da com sucesso.`,
      })
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || `Não foi possível ${statusLabel} a disciplina`
      toast({
        variant: "error",
        title: "Erro ao atualizar status",
        description: Array.isArray(message) ? message.join(", ") : message,
      })
    }
  }

  const handleEditarTurma = (turma: Turma) => {
    setTurmaEditandoId(turma.id)
    // Usar o semestre diretamente da turma (formato: "2025.1")
    const semestreFromTurma = turma.semestre || ""
    // Buscar professor da turma (se houver) no mapeamento BackendClass
    const turmaBackend = turmasBackend.find((t) => t.id === turma.id)
    const teacherId = turmaBackend?.teacher?.id || ""
    const roomFromBackend = (turmaBackend as any)?.room as string | undefined
    const normalizedRoom = roomFromBackend || (turma.sala !== "Sala nao informada" ? turma.sala : "") || ""
    setNovaTurma({
      codigo: turma.codigo,
      semestre: semestreFromTurma,
      ano: semestreFromTurma ? semestreFromTurma.split('.')[0] : new Date().getFullYear().toString(),
      disciplinaId: disciplinas.find((d) => d.nome === turma.disciplina)?.id ?? disciplinas[0]?.id ?? "",
      teacherId: teacherId,
      dayOfWeek: "",
      startTime: "",
      endTime: "",
      room: normalizedRoom
    })
    setIsTurmaModalOpen(true)
  }

  // Função auxiliar para atualizar contagem de alunos de uma turma baseada em enrollments reais
  const updateTurmaStudentCount = async (turmaId: string) => {
    try {
      const enrollments = await getEnrollmentsByClass(turmaId)
      const realCount = enrollments.length
      
      setTurmas((prev) =>
        prev.map((t) => (t.id === turmaId ? { ...t, alunos: realCount } : t))
      )
      
      return realCount
    } catch (error) {
      console.error(`Erro ao atualizar contagem de alunos da turma ${turmaId}:`, error)
      return null
    }
  }

  const handleOpenEnrollmentModal = async (turma?: Turma) => {
    setTurmaSelecionadaParaMatricula(turma || null)
    setAlunoSelecionadoParaMatricula("")
    setAlunosSelecionadosParaMatricula([])
    setEnrollmentValidationError(null)
    setIsEnrollmentModalOpen(true)
    
    // Se uma turma foi selecionada, buscar alunos já matriculados para filtro
    if (turma) {
      try {
        setIsLoadingEnrolledForFilter(true)
        const enrollments = await getEnrollmentsByClass(turma.id)
        setAlunosMatriculadosNaTurma(enrollments)
      } catch (error) {
        console.error("Erro ao buscar alunos matriculados:", error)
        setAlunosMatriculadosNaTurma([])
      } finally {
        setIsLoadingEnrolledForFilter(false)
      }
    } else {
      setAlunosMatriculadosNaTurma([])
    }
  }

  // Buscar alunos matriculados quando turma é selecionada no modal
  useEffect(() => {
    if (isEnrollmentModalOpen && turmaSelecionadaParaMatricula) {
      const loadEnrolledForFilter = async () => {
        try {
          setIsLoadingEnrolledForFilter(true)
          const enrollments = await getEnrollmentsByClass(turmaSelecionadaParaMatricula!.id)
          setAlunosMatriculadosNaTurma(enrollments)
        } catch (error) {
          console.error("Erro ao buscar alunos matriculados:", error)
          setAlunosMatriculadosNaTurma([])
        } finally {
          setIsLoadingEnrolledForFilter(false)
        }
      }
      loadEnrolledForFilter()
    } else if (!turmaSelecionadaParaMatricula) {
      setAlunosMatriculadosNaTurma([])
    }
  }, [turmaSelecionadaParaMatricula?.id, isEnrollmentModalOpen])

  // Função para obter alunos disponíveis para seleção
  const alunosDisponiveis = useMemo(() => {
    if (!turmaSelecionadaParaMatricula) return alunos
    
    // IDs de alunos já matriculados na turma
    const idsMatriculados = new Set(alunosMatriculadosNaTurma.map(e => e.student.id))
    // IDs de alunos já selecionados no modal
    const idsSelecionados = new Set(alunosSelecionadosParaMatricula)
    
    // Filtrar alunos: excluir matriculados e já selecionados
    return alunos.filter(aluno => 
      !idsMatriculados.has(aluno.id) && !idsSelecionados.has(aluno.id)
    )
  }, [alunos, alunosMatriculadosNaTurma, alunosSelecionadosParaMatricula, turmaSelecionadaParaMatricula])

  const handleEnrollStudent = async () => {
    if (!turmaSelecionadaParaMatricula) {
      toast({
        variant: "error",
        title: "Turma não selecionada",
        description: "Selecione uma turma para matricular os alunos.",
      })
      return
    }

    if (alunosSelecionadosParaMatricula.length === 0) {
      toast({
        variant: "error",
        title: "Nenhum aluno selecionado",
        description: "Selecione pelo menos um aluno para matricular na turma.",
      })
      return
    }

    // Buscar disciplina da turma
    const turmaBackend = turmasBackend.find((t) => t.id === turmaSelecionadaParaMatricula.id)
    const disciplineId = turmaBackend?.discipline?.id

    if (!disciplineId) {
      toast({
        variant: "error",
        title: "Erro",
        description: "Não foi possível identificar a disciplina da turma.",
      })
      return
    }

    try {
      setIsEnrolling(true)
      setEnrollmentValidationError(null)

      // Validar todos os alunos antes de processar
      const alunosParaValidar = alunosSelecionadosParaMatricula
        .map((alunoId) => {
          const aluno = alunos.find((a) => a.id === alunoId)
          return aluno ? { id: alunoId, aluno } : null
        })
        .filter((item): item is { id: string; aluno: Aluno } => item !== null)

      // Verificar se todos estão vinculados ao curso
      const alunosInvalidos = alunosParaValidar.filter((item) => !item.aluno)
      if (alunosInvalidos.length > 0) {
        setEnrollmentValidationError("Alguns alunos selecionados não estão vinculados ao curso.")
        setIsEnrolling(false)
        return
      }

      // Verificar se algum aluno já concluiu a disciplina
      const validacoesDisciplina = await Promise.all(
        alunosParaValidar.map(async (item) => {
          const hasCompleted = await checkStudentDisciplineStatus(item.id, disciplineId)
          return { alunoId: item.id, aluno: item.aluno, hasCompleted }
        })
      )

      const alunosComDisciplinaConcluida = validacoesDisciplina.filter((v) => v.hasCompleted)
      if (alunosComDisciplinaConcluida.length > 0) {
        const nomes = alunosComDisciplinaConcluida.map((v) => v.aluno.nome).join(", ")
        setEnrollmentValidationError(
          `Os seguintes alunos já concluíram esta disciplina e não podem ser matriculados: ${nomes}`
        )
        setIsEnrolling(false)
        return
      }

      // Processar matrículas em lote
      const resultados = await Promise.allSettled(
        alunosParaValidar.map((item) =>
          createEnrollment(item.id, turmaSelecionadaParaMatricula.id)
        )
      )

      // Contar sucessos e falhas
      const sucessos = resultados.filter((r) => r.status === "fulfilled").length
      const falhas = resultados.filter((r) => r.status === "rejected").length

      // Atualizar contador de alunos da turma baseado em enrollments reais
      if (sucessos > 0) {
        await updateTurmaStudentCount(turmaSelecionadaParaMatricula.id)
      }

      // Exibir toast com resumo
      if (falhas === 0) {
        toast({
          variant: "success",
          title: "Alunos matriculados",
          description: `${sucessos} aluno${sucessos !== 1 ? "s" : ""} matriculado${sucessos !== 1 ? "s" : ""} com sucesso na turma "${turmaSelecionadaParaMatricula.codigo}".`,
        })
      } else {
        toast({
          variant: "warning",
          title: "Matrícula parcial",
          description: `${sucessos} aluno${sucessos !== 1 ? "s" : ""} matriculado${sucessos !== 1 ? "s" : ""} com sucesso, ${falhas} falha${falhas !== 1 ? "ram" : "ram"}.`,
        })
      }

      // Atualizar lista de alunos matriculados no filtro se houve sucessos
      if (sucessos > 0 && turmaSelecionadaParaMatricula) {
        try {
          const updatedEnrollments = await getEnrollmentsByClass(turmaSelecionadaParaMatricula.id)
          setAlunosMatriculadosNaTurma(updatedEnrollments)
        } catch (error) {
          console.error("Erro ao atualizar lista de alunos matriculados:", error)
        }
      }

      // Fechar modal e resetar estados se tudo foi bem-sucedido
      if (falhas === 0) {
        setIsEnrollmentModalOpen(false)
        setTurmaSelecionadaParaMatricula(null)
        setAlunoSelecionadoParaMatricula("")
        setAlunosSelecionadosParaMatricula([])
        setEnrollmentValidationError(null)
        setAlunosMatriculadosNaTurma([])
      } else {
        // Se houve falhas, manter modal aberto mas limpar apenas os que foram bem-sucedidos
        // Por enquanto, vamos limpar tudo e deixar o usuário tentar novamente
        setAlunosSelecionadosParaMatricula([])
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Não foi possível matricular os alunos"
      toast({
        variant: "error",
        title: "Erro ao matricular alunos",
        description: Array.isArray(message) ? message.join(", ") : message,
      })
    } finally {
      setIsEnrolling(false)
    }
  }

  const loadEnrolledStudents = async (classId: string) => {
    try {
      setIsLoadingEnrolledStudents(true)
      const enrollments = await getEnrollmentsByClass(classId)
      setEnrolledStudents(enrollments)
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Não foi possível carregar os alunos matriculados"
      toast({
        variant: "error",
        title: "Erro ao carregar alunos",
        description: Array.isArray(message) ? message.join(", ") : message,
      })
      setEnrolledStudents([])
    } finally {
      setIsLoadingEnrolledStudents(false)
    }
  }

  const handleOpenEnrolledStudentsModal = async (turma: Turma) => {
    setTurmaParaListarAlunos(turma)
    setSearchEnrolledStudents("")
    setCurrentPage(1)
    setIsEnrolledStudentsModalOpen(true)
    await loadEnrolledStudents(turma.id)
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
                        <LiquidGlassButton size="sm" onClick={() => setIsDisciplinaModalOpen(true)}>
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
                                <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                                  <div>
                                    <span className="font-semibold">Semestre:</span> {disciplina.semestre ?? "-"}
                                  </div>
                                  <div>
                                    <span className="font-semibold">CH:</span> {disciplina.cargaHoraria}h
                                  </div>
                                  <div>
                                    <span className="font-semibold">Creditos:</span> {disciplina.creditos}
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
                        <div className="flex gap-2">
                          <LiquidGlassButton size="sm" onClick={() => handleOpenEnrollmentModal()}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Matricular Aluno
                          </LiquidGlassButton>
                          <LiquidGlassButton size="sm" onClick={() => setIsTurmaModalOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Nova turma
                          </LiquidGlassButton>
                        </div>
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
                        {isLoading ? (
                          <Skeleton className="h-10 w-40" />
                        ) : semestres.length === 0 ? (
                          <div className="px-3 py-2 border rounded-md bg-muted text-muted-foreground text-sm">
                            Nenhum semestre
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <GraduationCap className="h-5 w-5 text-muted-foreground" />
                            <Select value={semestreSelecionado} onValueChange={setSemestreSelecionado}>
                              <SelectTrigger className="w-40">
                                <SelectValue placeholder="Selecionar semestre" />
                              </SelectTrigger>
                              <SelectContent>
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
                          </div>
                        )}
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
                                    {turma.alunos} {turma.capacidade && turma.capacidade > 0 ? `/ ${turma.capacidade}` : ""} aluno{turma.alunos !== 1 ? "s" : ""}
                                  </span>
                                  {turma.capacidade && turma.capacidade > 0 && (
                                    <div className="flex-1 max-w-xs">
                                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                          className="h-full bg-emerald-600"
                                          style={{
                                            width: `${Math.min(100, (turma.alunos / turma.capacidade) * 100)}%`
                                          }}
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleOpenEnrolledStudentsModal(turma)} title="Ver alunos matriculados">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleOpenEnrollmentModal(turma)} title="Matricular aluno">
                                  <UserPlus className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleEditarTurma(turma)} title="Editar turma">
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
              {disciplinaEditandoId 
                ? "Atualize os dados da disciplina vinculada ao curso." 
                : selectedDisciplineId
                ? "Disciplina existente selecionada. Para modificar dados, crie uma nova disciplina."
                : "Busque uma disciplina existente ou crie uma nova disciplina para vincular ao curso."}
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
                    <>
                      {isLoadingDisciplines ? (
                        <div className="flex items-center gap-2 py-2">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <span className="text-sm text-muted-foreground">Carregando disciplinas...</span>
                        </div>
                      ) : (
                        <Combobox
                          options={disciplineOptions}
                          value={selectedDisciplineId}
                          onChange={handleDisciplineSelect}
                          onSearch={handleDisciplineSearch}
                          placeholder="Buscar disciplina existente ou digite para criar nova..."
                          allowCustomInput={true}
                        />
                      )}
                  {selectedDisciplineId && (
                    <div className="mt-2 p-3 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-900 dark:text-blue-200">
                        Disciplina existente selecionada. Para modificar dados, crie uma nova disciplina.
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearDisciplineSelection}
                        className="mt-2 text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100"
                      >
                        Criar nova disciplina
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="creditos-disciplina">Creditos</Label>
                <Input
                  id="creditos-disciplina"
                  type="number"
                  value={novaDisciplina.creditos}
                  onChange={(e) => setNovaDisciplina({ ...novaDisciplina, creditos: e.target.value })}
                  min="0"
                  placeholder="Ex: 4"
                  disabled={!!selectedDisciplineId && !disciplinaEditandoId}
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
                  disabled={!!selectedDisciplineId && !disciplinaEditandoId}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="semestre-disciplina">Semestre no curso (opcional)</Label>
              <Input
                id="semestre-disciplina"
                type="number"
                value={novaDisciplina.semestre}
                onChange={(e) => setNovaDisciplina({ ...novaDisciplina, semestre: e.target.value })}
                min="1"
                max="20"
                placeholder="Ex: 1, 2, 3..."
              />
              <p className="text-sm text-muted-foreground mt-1">
                Informe em qual semestre do curso esta disciplina é oferecida.
              </p>
            </div>
            <div>
              <Label htmlFor="tipo-disciplina">Tipo</Label>
              <Select
                value={novaDisciplina.tipo}
                onValueChange={(value: "obrigatoria" | "optativa") => 
                  setNovaDisciplina({ ...novaDisciplina, tipo: value })
                }
              >
                <SelectTrigger id="tipo-disciplina">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="obrigatoria">Obrigatória</SelectItem>
                  <SelectItem value="optativa">Optativa</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                Selecione se a disciplina é obrigatória ou optativa no curso.
              </p>
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
            <Button 
              onClick={handleCreateDisciplina} 
              disabled={
                isSavingDisciplina || 
                (disciplinaEditandoId 
                  ? false 
                  : selectedDisciplineId 
                    ? false 
                    : !novaDisciplina.nome.trim() || !novaDisciplina.creditos || !novaDisciplina.cargaHoraria)
              }
            >
              {isSavingDisciplina && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {disciplinaEditandoId 
                ? "Salvar alterações" 
                : selectedDisciplineId 
                  ? "Vincular disciplina" 
                  : "Salvar disciplina"}
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
            <div>
              <Label htmlFor="semestre-turma">Semestre</Label>
              {turmaEditandoId ? (
                // Em modo de edição, mostrar o semestre da turma sendo editada
                <Input
                  id="semestre-turma"
                  value={novaTurma.semestre ? novaTurma.semestre.replace('.', '-') : novaTurma.semestre || ''}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
              ) : semestreSelecionado ? (
                // Em modo de criação, usar o semestre selecionado no filtro
                <Input
                  id="semestre-turma"
                  value={semestreSelecionado.replace('.', '-')}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
              ) : (
                <div className="px-3 py-2 border rounded-md bg-muted text-muted-foreground text-sm">
                  Nenhum semestre disponível. Selecione um semestre na aba de turmas primeiro.
                </div>
              )}
              {!turmaEditandoId && !semestreSelecionado && (
                <p className="text-sm text-muted-foreground mt-1">
                  Nenhum semestre selecionado. É necessário ter turmas no curso ou selecionar um semestre.
                </p>
              )}
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
            <div>
              <Label htmlFor="professor-turma">Professor (opcional)</Label>
              <select
                id="professor-turma"
                className="w-full border rounded-md px-3 py-2 bg-background"
                value={novaTurma.teacherId}
                onChange={(e) => setNovaTurma({ ...novaTurma, teacherId: e.target.value })}
              >
                <option value="">Sem professor</option>
                {professores.map((professor) => (
                  <option key={professor.id} value={professor.id}>
                    {professor.name}
                  </option>
                ))}
              </select>
              {professores.length === 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  Nenhum professor cadastrado no departamento deste curso.
                </p>
              )}
            </div>
            <div className="border-t pt-4 mt-4">
              <p className="text-sm font-medium mb-3 text-muted-foreground">Horário da aula (opcional)</p>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="dia-semana-turma">Dia da semana</Label>
                  <select
                    id="dia-semana-turma"
                    className="w-full border rounded-md px-3 py-2 bg-background"
                    value={novaTurma.dayOfWeek}
                    onChange={(e) => setNovaTurma({ ...novaTurma, dayOfWeek: e.target.value })}
                  >
                    <option value="">Selecione o dia</option>
                    <option value="segunda-feira">Segunda-feira</option>
                    <option value="terca-feira">Terça-feira</option>
                    <option value="quarta-feira">Quarta-feira</option>
                    <option value="quinta-feira">Quinta-feira</option>
                    <option value="sexta-feira">Sexta-feira</option>
                    <option value="sabado">Sábado</option>
                    <option value="domingo">Domingo</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="horario-inicio-turma">Horário de início</Label>
                    <Input
                      id="horario-inicio-turma"
                      type="time"
                      value={novaTurma.startTime}
                      onChange={(e) => setNovaTurma({ ...novaTurma, startTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="horario-fim-turma">Horário de fim</Label>
                    <Input
                      id="horario-fim-turma"
                      type="time"
                      value={novaTurma.endTime}
                      onChange={(e) => setNovaTurma({ ...novaTurma, endTime: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="sala-turma">Sala</Label>
                  <Input
                    id="sala-turma"
                    value={novaTurma.room}
                    onChange={(e) => setNovaTurma({ ...novaTurma, room: e.target.value })}
                    placeholder="Ex: Lab 101"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Se preenchido, será criado automaticamente um horário e planos de aula para todas as semanas do semestre.
                </p>
              </div>
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
            <Button 
              onClick={handleCreateTurma} 
              disabled={isSavingTurma || disciplinas.length === 0 || (!turmaEditandoId && !semestreSelecionado)}
            >
              {isSavingTurma && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {turmaEditandoId ? "Salvar alterações" : "Criar turma"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEnrollmentModalOpen}
        onOpenChange={(open) => {
          setIsEnrollmentModalOpen(open)
          if (!open) {
            setTurmaSelecionadaParaMatricula(null)
            setAlunoSelecionadoParaMatricula("")
            setAlunosSelecionadosParaMatricula([])
            setEnrollmentValidationError(null)
            setAlunosMatriculadosNaTurma([])
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Matricular Alunos em Turma</DialogTitle>
            <DialogDescription>
              Selecione a turma e adicione um ou mais alunos para realizar a matrícula. Os alunos devem estar vinculados ao curso e não podem ter concluído a disciplina. Alunos já matriculados não aparecerão na lista.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="turma-matricula">Turma</Label>
              {turmaSelecionadaParaMatricula ? (
                <Input
                  id="turma-matricula"
                  value={`${turmaSelecionadaParaMatricula.codigo} - ${turmaSelecionadaParaMatricula.disciplina}`}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
              ) : (
                <Combobox
                  options={turmas.map((t) => {
                    const turma: Turma = t
                    return {
                      id: turma.id,
                      label: `${turma.codigo} - ${turma.disciplina}`,
                    }
                  })}
                  value={null}
                  onChange={(value) => {
                    if (value) {
                      const turma = turmas.find((t) => t.id === value)
                      setTurmaSelecionadaParaMatricula(turma || null)
                      setEnrollmentValidationError(null)
                    }
                  }}
                  placeholder="Selecione uma turma..."
                />
              )}
            </div>

            <div>
              <Label htmlFor="aluno-matricula">Adicionar Aluno</Label>
              {isLoadingEnrolledForFilter ? (
                <div className="flex items-center gap-2 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Carregando alunos disponíveis...</span>
                </div>
              ) : (
                <Combobox
                  options={alunosDisponiveis.map((a) => ({
                    id: a.id,
                    label: `${a.nome}${a.matricula ? ` (${a.matricula})` : ""}`,
                  }))}
                  value={null}
                  onChange={(value) => {
                    if (value && !alunosSelecionadosParaMatricula.includes(value)) {
                      setAlunosSelecionadosParaMatricula([...alunosSelecionadosParaMatricula, value])
                      setEnrollmentValidationError(null)
                    }
                  }}
                  placeholder="Selecione um aluno para adicionar..."
                />
              )}
              {alunosDisponiveis.length === 0 && alunos.length > 0 && turmaSelecionadaParaMatricula && (
                <p className="text-sm text-muted-foreground mt-1">
                  Todos os alunos disponíveis já estão matriculados nesta turma ou já foram selecionados.
                </p>
              )}
              {alunos.length === 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  Nenhum aluno vinculado ao curso. Vincule alunos ao curso primeiro.
                </p>
              )}
            </div>

            {alunosSelecionadosParaMatricula.length > 0 && (
              <div>
                <Label>Alunos Selecionados ({alunosSelecionadosParaMatricula.length})</Label>
                <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                  {alunosSelecionadosParaMatricula.map((alunoId) => {
                    const aluno = alunos.find((a) => a.id === alunoId)
                    if (!aluno) return null
                    return (
                      <div
                        key={alunoId}
                        className="flex items-center justify-between p-2 bg-muted rounded-md"
                      >
                        <div>
                          <span className="font-medium">{aluno.nome}</span>
                          {aluno.matricula && (
                            <span className="text-sm text-muted-foreground ml-2">({aluno.matricula})</span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setAlunosSelecionadosParaMatricula(
                              alunosSelecionadosParaMatricula.filter((id) => id !== alunoId)
                            )
                          }}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          title="Remover aluno"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {enrollmentValidationError && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{enrollmentValidationError}</p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsEnrollmentModalOpen(false)
                setTurmaSelecionadaParaMatricula(null)
                setAlunoSelecionadoParaMatricula("")
                setAlunosSelecionadosParaMatricula([])
                setEnrollmentValidationError(null)
                setAlunosMatriculadosNaTurma([])
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEnrollStudent}
              disabled={
                isEnrolling ||
                !turmaSelecionadaParaMatricula ||
                alunosSelecionadosParaMatricula.length === 0 ||
                alunos.length === 0
              }
            >
              {isEnrolling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Matricular {alunosSelecionadosParaMatricula.length > 0 ? `(${alunosSelecionadosParaMatricula.length})` : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEnrolledStudentsModalOpen}
        onOpenChange={(open) => {
          setIsEnrolledStudentsModalOpen(open)
          if (!open) {
            setTurmaParaListarAlunos(null)
            setEnrolledStudents([])
            setSearchEnrolledStudents("")
            setCurrentPage(1)
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Alunos Matriculados
              {turmaParaListarAlunos && (
                <span className="text-base font-normal text-muted-foreground ml-2">
                  - {turmaParaListarAlunos.codigo} - {turmaParaListarAlunos.disciplina}
                </span>
              )}
            </DialogTitle>
            <DialogDescription>
              {isLoadingEnrolledStudents
                ? "Carregando alunos..."
                : `${enrolledStudents.length} aluno${enrolledStudents.length !== 1 ? "s" : ""} matriculado${enrolledStudents.length !== 1 ? "s" : ""}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou matrícula..."
                value={searchEnrolledStudents}
                onChange={(e) => {
                  setSearchEnrolledStudents(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10"
              />
            </div>

            {isLoadingEnrolledStudents ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Carregando alunos...</span>
              </div>
            ) : (
              <>
                {(() => {
                  // Filtrar alunos baseado na busca
                  const filteredStudents = enrolledStudents.filter((enrollment) => {
                    const term = searchEnrolledStudents.toLowerCase()
                    const name = enrollment.student.name.toLowerCase()
                    const email = enrollment.student.email?.toLowerCase() || ""
                    const enrollmentNumber = enrollment.student.usuario?.toLowerCase() || ""
                    return name.includes(term) || email.includes(term) || enrollmentNumber.includes(term)
                  })

                  // Calcular paginação
                  const studentsPerPage = 5
                  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage)
                  const startIndex = (currentPage - 1) * studentsPerPage
                  const endIndex = startIndex + studentsPerPage
                  const paginatedStudents = filteredStudents.slice(startIndex, endIndex)

                  return (
                    <>
                      <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
                        {paginatedStudents.length === 0 ? (
                          <div className="text-center py-12 text-muted-foreground">
                            {searchEnrolledStudents
                              ? "Nenhum aluno encontrado com os critérios de busca"
                              : "Nenhum aluno matriculado nesta turma"}
                          </div>
                        ) : (
                          paginatedStudents.map((enrollment) => {
                            const enrollmentDate = new Date(enrollment.enrolledAt)
                            const formattedDate = enrollmentDate.toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })

                            return (
                              <div
                                key={enrollment.id}
                                className={`p-4 border rounded-xl ${
                                  isLiquidGlass
                                    ? "border-gray-200/30 dark:border-gray-700/50"
                                    : "border-gray-200 dark:border-gray-700"
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-semibold">{enrollment.student.name}</h4>
                                    <div className="mt-1 space-y-1 text-sm text-muted-foreground">
                                      {enrollment.student.email && (
                                        <div>
                                          <span className="font-semibold">Email:</span> {enrollment.student.email}
                                        </div>
                                      )}
                                      {enrollment.student.usuario && (
                                        <div>
                                          <span className="font-semibold">Matrícula:</span> {enrollment.student.usuario}
                                        </div>
                                      )}
                                      <div>
                                        <span className="font-semibold">Data de matrícula:</span> {formattedDate}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>

                      {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="text-sm text-muted-foreground">
                            Página {currentPage} de {totalPages} ({filteredStudents.length} aluno{filteredStudents.length !== 1 ? "s" : ""})
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                              disabled={currentPage === 1}
                            >
                              Anterior
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                              disabled={currentPage === totalPages}
                            >
                              Próxima
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )
                })()}
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEnrolledStudentsModalOpen(false)
                setTurmaParaListarAlunos(null)
                setEnrolledStudents([])
                setSearchEnrolledStudents("")
                setCurrentPage(1)
              }}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


