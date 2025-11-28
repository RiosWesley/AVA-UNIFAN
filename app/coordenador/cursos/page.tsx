"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { LiquidGlassCard, LiquidGlassButton } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { BookOpen, Plus, Search, Users, Eye, X, Loader2, GraduationCap, Clock } from "lucide-react"
import { toast } from "@/components/ui/toast"
import { getDepartments, type Department } from "@/src/services/departmentsService"
import { createCourse, getCourses, getCourseClasses, type BackendCourse } from "@/src/services/coursesService"
import { getCurrentUser } from "@/src/services/professor-dashboard"

type FormStatus = 'Ativo' | 'Inativo';

const statusApiMap: Record<FormStatus, 'active' | 'inactive'> = {
  'Ativo': 'active',
  'Inativo': 'inactive',
};

type Curso = {
  id: string
  nome: string
  codigo: string
  departamento: string
  cargaHoraria: number
  duracao: number
  status: "ativo" | "inativo"
  alunos: number
  disciplinas: number
  turmas: number
  descricao?: string
}

type ModalCursoData = {
  nome: string
  codigo: string
  cargaHoraria: string
  duracao: string
  descricao: string
}

export default function CoordenadorCursosPage() {
  const router = useRouter()
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [departamentoFilter, setDepartamentoFilter] = useState<string>("todos");
  const [statusFilter, setStatusFilter] = useState<"todos" | "Ativo" | "Inativo">("todos");
  const [isLiquidGlass, setIsLiquidGlass] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalData, setModalData] = useState<ModalCursoData>({
    nome: "",
    codigo: "",
    cargaHoraria: "",
    duracao: "",
    descricao: ""
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [department, setDepartment] = useState<Department | null>(null)
  const coordenadorDepartamento = department?.name ?? ""

  const [cursos, setCursos] = useState<Curso[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [coordinatorId, setCoordinatorId] = useState<string | null>(null)

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

  const cursosFiltrados = cursos.filter(curso => {
    const matchesSearch = curso.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      curso.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const validarModal = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!modalData.nome.trim()) {
      newErrors.nome = "Nome do curso é obrigatório"
    }

    if (!modalData.codigo.trim()) {
      newErrors.codigo = "Código do curso é obrigatório"
    }

    if (!modalData.cargaHoraria || parseInt(modalData.cargaHoraria) <= 0) {
      newErrors.cargaHoraria = "Carga horária deve ser maior que zero"
    }

    if (!modalData.duracao || parseInt(modalData.duracao) <= 0) {
      newErrors.duracao = "Duração deve ser maior que zero"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSalvarCurso = async () => {
    if (!validarModal()) {
      toast({
        variant: "error",
        title: "Dados inválidos",
        description: "Verifique os campos destacados e tente novamente"
      })
      return
    }

    if (!department?.id) {
      toast({
        variant: "error",
        title: "Departamento não encontrado",
        description: "Não foi possível identificar o departamento do coordenador"
      })
      return
    }

    try {
      const created = await createCourse({
        name: modalData.nome.trim(),
        code: modalData.codigo.trim().toUpperCase(),
        totalHours: parseInt(modalData.cargaHoraria),
        durationSemesters: parseInt(modalData.duracao),
        description: modalData.descricao.trim() || undefined,
        departmentId: department.id,
        status: "active",
      })

      toast({
        variant: "success",
        title: "Curso criado",
        description: `"${created.name}" foi criado com sucesso!`
      })

      await carregarCursos(department.id)

      setIsModalOpen(false)
      setModalData({
        nome: "",
        codigo: "",
        cargaHoraria: "",
        duracao: "",
        descricao: ""
      })
      setErrors({})
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Não foi possível criar o curso"
      toast({
        variant: "error",
        title: "Erro ao criar curso",
        description: Array.isArray(message) ? message.join(", ") : message
      })
    }
  }

  const handleAbrirModal = () => {
    setModalData({
      nome: "",
      codigo: "",
      cargaHoraria: "",
      duracao: "",
      descricao: ""
    })
    setErrors({})
    setIsModalOpen(true)
  }

  const handleFecharModal = () => {
    setIsModalOpen(false)
    setModalData({
      nome: "",
      codigo: "",
      cargaHoraria: "",
      duracao: "",
      descricao: ""
    })
    setErrors({})
  }

  const handleVisualizarCurso = (cursoId: string) => {
    router.push(`/coordenador/cursos/${cursoId}`)
  }

  const mapBackendToCurso = (c: BackendCourse, deptName: string): Curso => ({
    id: c.id,
    nome: c.name,
    codigo: c.code,
    departamento: deptName,
    cargaHoraria: c.totalHours,
    duracao: c.durationSemesters,
    status: c.status === "active" ? "ativo" : "inativo",
    alunos: c.studentsCount ?? 0,
    disciplinas: c.disciplinesCount ?? 0,
    turmas: c.classesCount ?? 0,
    descricao: c.description,
  })

  async function carregarCursos(departmentId: string) {
    try {
      setIsLoading(true)
      const backendCourses = await getCourses({ 
      search: debouncedSearch, 
      departmentId: departamentoFilter,
      status: statusFilter === 'todos' ? 'todos' : statusApiMap[statusFilter]
    })
      const deptName = department?.name ?? ""
      const mapped = backendCourses.map((c) => mapBackendToCurso(c, deptName))
      setCursos(mapped)

      const counts = await Promise.all(mapped.map(async (course) => {
        try {
          const classes = await getCourseClasses(course.id)
          return { id: course.id, count: classes.length }
        } catch {
          return { id: course.id, count: course.turmas }
        }
      }))

      setCursos((prev) =>
        prev.map((curso) => {
          const found = counts.find((c) => c.id === curso.id)
          return found ? { ...curso, turmas: found.count } : curso
        })
      )
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Não foi possível carregar os cursos"
      toast({
        variant: "error",
        title: "Erro ao carregar cursos",
        description: Array.isArray(message) ? message.join(", ") : message
      })
      setCursos([])
    } finally {
      setIsLoading(false)
    }
  }

  // Buscar usuário autenticado
  useEffect(() => {
    const init = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("ava:token") : null
        if (!token) {
          router.push("/")
          return
        }
        const user = await getCurrentUser()
        if (user?.id) {
          setCoordinatorId(user.id)
        } else {
          router.push("/")
        }
      } catch (error) {
        console.error("Erro ao buscar usuário:", error)
        router.push("/")
      }
    }
    init()
  }, [router])

  useEffect(() => {
    if (!coordinatorId) return

    async function bootstrap() {
      try {
        setIsLoading(true)
        const depts = await getDepartments(coordinatorId ?? undefined)
        if (!depts || depts.length === 0) {
          throw new Error("Nenhum departamento encontrado para este coordenador")
        }
        const dept = depts[0]
        setDepartment(dept)
        await carregarCursos(dept.id)
      } catch (error: any) {
        const message = error?.response?.data?.message || error?.message || "Falha ao inicializar a página"
        toast({
          variant: "error",
          title: "Erro",
          description: Array.isArray(message) ? message.join(", ") : message
        })
      } finally {
        setIsLoading(false)
      }
    }
    bootstrap()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coordinatorId])

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
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                  Cursos
                </h1>
                <p className="text-muted-foreground text-lg mt-1">
                  {department ? (
                    <>Gerenciamento de cursos do departamento {coordenadorDepartamento}</>
                  ) : (
                    <>Carregando departamento...</>
                  )}
                </p>
                <Badge variant="secondary" className="mt-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                  {cursosFiltrados.length} curso{cursosFiltrados.length !== 1 ? 's' : ''} encontrado{cursosFiltrados.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
            <LiquidGlassButton onClick={handleAbrirModal} size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Novo Curso
            </LiquidGlassButton>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar cursos por nome ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Carregando cursos...</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cursosFiltrados.map((curso) => (
                  <LiquidGlassCard
                    key={curso.id}
                    intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
                    className={`group transition-all duration-300 hover:shadow-xl border border-border/50 hover:border-border/80 ${
                      isLiquidGlass
                        ? 'bg-black/30 dark:bg-gray-800/20'
                        : 'bg-gray-50/60 dark:bg-gray-800/40'
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{curso.nome}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <span className="font-mono text-sm">{curso.codigo}</span>
                            <Badge variant={curso.status === "ativo" ? "default" : "secondary"}>
                              {curso.status === "ativo" ? "Ativo" : "Inativo"}
                            </Badge>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {curso.descricao && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {curso.descricao}
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Carga Horária</p>
                          <p className="font-semibold">{curso.cargaHoraria}h</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Duração</p>
                          <p className="font-semibold">{curso.duracao} semestres</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
                        <div className="text-center">
                          <Users className="h-5 w-5 mx-auto mb-1 text-emerald-600 dark:text-emerald-400" />
                          <p className="text-xs text-muted-foreground">Alunos</p>
                          <p className="font-semibold">{curso.alunos}</p>
                        </div>
                        <div className="text-center">
                          <GraduationCap className="h-5 w-5 mx-auto mb-1 text-purple-600 dark:text-purple-400" />
                          <p className="text-xs text-muted-foreground">Disciplinas</p>
                          <p className="font-semibold">{curso.disciplinas}</p>
                        </div>
                        <div className="text-center">
                          <BookOpen className="h-5 w-5 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
                          <p className="text-xs text-muted-foreground">Turmas</p>
                          <p className="font-semibold">{curso.turmas}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <LiquidGlassButton
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleVisualizarCurso(curso.id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Visualizar
                        </LiquidGlassButton>
                        <LiquidGlassButton
                          variant="outline"
                          className="flex-1"
                          onClick={() => router.push(`/coordenador/cursos/${curso.id}/disponibilizacoes`)}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Disponibilizações
                        </LiquidGlassButton>
                      </div>
                    </CardContent>
                  </LiquidGlassCard>
                ))}
              </div>

              {cursosFiltrados.length === 0 && (
                <LiquidGlassCard
                  intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
                  className={`text-center py-12 ${
                    isLiquidGlass
                      ? 'bg-black/30 dark:bg-gray-800/20'
                      : 'bg-gray-50/60 dark:bg-gray-800/40'
                  }`}
                >
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-semibold mb-2">Nenhum curso encontrado</p>
                  <p className="text-muted-foreground">
                    {searchTerm ? "Tente ajustar sua busca" : "Comece criando um novo curso"}
                  </p>
                </LiquidGlassCard>
              )}
            </>
          )}
        </div>
      </main>

      <Dialog open={isModalOpen} onOpenChange={handleFecharModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Novo Curso</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {department ? (
                    <>Adicione um novo curso ao departamento {coordenadorDepartamento}</>
                  ) : (
                    <>Carregando departamento...</>
                  )}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="space-y-6 pr-1">
              <div>
                <Label htmlFor="nome" className="text-sm font-medium">
                  Nome do Curso *
                </Label>
                <Input
                  id="nome"
                  value={modalData.nome}
                  onChange={(e) => setModalData({ ...modalData, nome: e.target.value })}
                  placeholder="Ex: Sistemas de Informação"
                  className={errors.nome ? 'border-destructive' : ''}
                />
                {errors.nome && (
                  <p className="text-sm text-destructive mt-1">{errors.nome}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="codigo" className="text-sm font-medium">
                    Código *
                  </Label>
                  <Input
                    id="codigo"
                    value={modalData.codigo}
                    onChange={(e) => setModalData({ ...modalData, codigo: e.target.value.toUpperCase() })}
                    placeholder="Ex: SI"
                    className={errors.codigo ? 'border-destructive' : ''}
                    maxLength={10}
                  />
                  {errors.codigo && (
                    <p className="text-sm text-destructive mt-1">{errors.codigo}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="duracao" className="text-sm font-medium">
                    Duração (semestres) *
                  </Label>
                  <Input
                    id="duracao"
                    type="number"
                    value={modalData.duracao}
                    onChange={(e) => setModalData({ ...modalData, duracao: e.target.value })}
                    placeholder="Ex: 8"
                    className={errors.duracao ? 'border-destructive' : ''}
                    min="1"
                  />
                  {errors.duracao && (
                    <p className="text-sm text-destructive mt-1">{errors.duracao}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="cargaHoraria" className="text-sm font-medium">
                  Carga Horária Total (horas) *
                </Label>
                <Input
                  id="cargaHoraria"
                  type="number"
                  value={modalData.cargaHoraria}
                  onChange={(e) => setModalData({ ...modalData, cargaHoraria: e.target.value })}
                  placeholder="Ex: 3200"
                  className={errors.cargaHoraria ? 'border-destructive' : ''}
                  min="1"
                />
                {errors.cargaHoraria && (
                  <p className="text-sm text-destructive mt-1">{errors.cargaHoraria}</p>
                )}
              </div>

              <div>
                <Label htmlFor="descricao" className="text-sm font-medium">
                  Descrição
                </Label>
                <Textarea
                  id="descricao"
                  value={modalData.descricao}
                  onChange={(e) => setModalData({ ...modalData, descricao: e.target.value })}
                  placeholder="Descreva o curso..."
                  rows={4}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-3 pt-4 border-t flex-shrink-0">
            <LiquidGlassButton variant="outline" onClick={handleFecharModal}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </LiquidGlassButton>
            <LiquidGlassButton onClick={handleSalvarCurso}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Curso
            </LiquidGlassButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


