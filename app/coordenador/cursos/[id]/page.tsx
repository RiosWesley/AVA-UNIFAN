"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { LiquidGlassCard, LiquidGlassButton } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { BookOpen, ArrowLeft, Users, GraduationCap, Clock, Edit, Plus, Search, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/toast"
import {
  getCourseById,
  getCourseClasses,
  getCourseDisciplines,
  getCourseStudents,
  type BackendClass,
  type BackendCourse,
  type BackendDiscipline,
  type BackendCourseStudent
} from "@/src/services/coursesService"

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

const mapDiscipline = (d: BackendDiscipline): Disciplina => ({
  id: d.id,
  nome: d.name,
  codigo: d.code,
  cargaHoraria: d.workloadHours ?? 0,
  creditos: d.credits ?? 0,
  semestre: d.semester,
  tipo: d.type === "optional" ? "optativa" : "obrigatoria",
  professor: d.teacher?.name,
  status: d.status === "inactive" ? "inativa" : "ativa",
  courseId: d.courseId ?? d.course?.id
})

const mapClass = (c: BackendClass): Turma => ({
  id: c.id,
  codigo: c.code,
  disciplina: c.discipline?.name ?? "Sem disciplina",
  professor: c.teacher?.name ?? "Sem professor",
  periodo: c.period ?? "Periodo nao informado",
  horario: c.schedule ?? "Horario nao informado",
  sala: c.room ?? "Sala nao informada",
  alunos: c.studentsCount ?? 0,
  capacidade: c.capacity ?? c.studentsCount ?? 0,
  status: c.status === "inactive" ? "inativa" : "ativa",
  courseId: c.courseId ?? c.course?.id
})

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
  const [filtroStatusTurma, setFiltroStatusTurma] = useState<"todas" | "ativa" | "inativa">("todas")

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
    async function loadData() {
      try {
        setIsLoading(true)
        const [courseData, disciplinesData, classesData, studentsData] = await Promise.all([
          getCourseById(cursoId),
          getCourseDisciplines(cursoId),
          getCourseClasses(cursoId),
          getCourseStudents(cursoId)
        ])
        const mappedStudents = studentsData.map(mapStudent)
        setCurso({
          ...mapCourse(courseData),
          alunos: mappedStudents.length, // garante que o card usa a mesma contagem exibida na aba
        })
        setDisciplinas(
          disciplinesData
            .map(mapDiscipline)
            .filter((d) => d.status === "ativa")
            .filter((d) => !d.courseId || d.courseId === cursoId) // garante pertencer ao curso quando informado
        )
        setTurmas(
          classesData
            .map(mapClass)
            .filter((t) => t.status === "ativa")
            .filter((t) => !t.courseId || t.courseId === cursoId)
        )
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
    }
    loadData()
  }, [cursoId])

  const disciplinasFiltradas = useMemo(() => {
    return disciplinas.filter((d) => {
      const matchesSearch =
        d.nome.toLowerCase().includes(searchDisciplinas.toLowerCase()) ||
        d.codigo.toLowerCase().includes(searchDisciplinas.toLowerCase())
      const matchesTipo = filtroTipoDisciplina === "todas" || d.tipo === filtroTipoDisciplina
      return matchesSearch && matchesTipo
    })
  }, [disciplinas, searchDisciplinas, filtroTipoDisciplina])

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
                        <LiquidGlassButton size="sm">
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
                      </div>

                      <div className="space-y-2">
                        {disciplinasFiltradas.map((disciplina) => (
                          <div
                            key={disciplina.id}
                            className={`p-4 border rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors ${
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
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4" />
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
                        <LiquidGlassButton size="sm">
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
                                <Button variant="outline" size="sm">
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
    </div>
  )
}
