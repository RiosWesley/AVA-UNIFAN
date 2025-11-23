"use client"

import { useEffect, useMemo, useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent} from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BookOpen, Plus, Edit, Trash2, Eye, Users, Building2 } from "lucide-react"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { BackendCourse, createCourse, CreateCoursePayload, deleteCourse, getCourses, getDepartments, updateCourse, UpdateCoursePayload } from "@/src/services/coursesService"
import { PageSpinner } from "@/components/ui/page-spinner"
import { getCurrentUser } from "@/src/services/professor-dashboard"
import { useRouter } from "next/navigation"

type FormStatus = 'Ativo' | 'Inativo';

const statusApiMap: Record<FormStatus, 'active' | 'inactive'> = {
  'Ativo': 'active',
  'Inativo': 'inactive',
};

const statusDisplayMap: Record<'active' | 'inactive', FormStatus> = {
  'active': 'Ativo',
  'inactive': 'Inativo',
};

export default function CursosAdministradorPage() {
  const router = useRouter()
  const queryClient = useQueryClient();

  // Estados da UI
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [departamentoFilter, setDepartamentoFilter] = useState<string>("todos");
  const [statusFilter, setStatusFilter] = useState<"todos" | "Ativo" | "Inativo">("todos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCurso, setSelectedCurso] = useState<BackendCourse | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [form, setForm] = useState({
    name: "", code: "", departmentId: "", totalHours: "", durationSemesters: "", status: 'active' as 'active' | 'inactive', description: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Verificar autenticação e role
  useEffect(() => {
    const init = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("ava:token") : null
        if (!token) {
          router.push("/")
          return
        }
        const user = await getCurrentUser()
        if (!user?.id || !user?.roles?.includes("admin")) {
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
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const { data: cursos = [], isLoading: isLoadingCursos } = useQuery({
    queryKey: ['cursos', debouncedSearch, departamentoFilter, statusFilter],
    queryFn: () => getCourses({ 
      search: debouncedSearch, 
      departmentId: departamentoFilter,
      status: statusFilter === 'todos' ? 'todos' : statusApiMap[statusFilter]
    }),
    placeholderData: keepPreviousData,
  });

  const { data: departamentos = [] } = useQuery({
    queryKey: ['departamentos'],
    queryFn: getDepartments,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateCoursePayload) => createCourse(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cursos'] });
      handleCloseModal();
    },
  });
   const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: UpdateCoursePayload }) => updateCourse(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cursos'] });
      handleCloseModal();
    },
  });
  const deleteMutation = useMutation({ mutationFn: (id: string) => deleteCourse(id), /* ... */ });

  // --- ESTATÍSTICAS ---
  const estatisticas = useMemo(() => ({
    total: cursos.length,
    ativos: cursos.filter(c => c.status === "active").length,
    inativos: cursos.filter(c => c.status === "inactive").length,
    totalAlunos: cursos.reduce((acc, c) => acc + (c.studentsCount || 0), 0),
    totalTurmas: cursos.reduce((acc, c) => acc + (c.classesCount || 0), 0),
    departamentos: new Set(cursos.map(c => c.department?.name).filter(Boolean)).size,
  }), [cursos]);

  // --- HANDLERS ---
  function validarForm(): boolean {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Nome do curso é obrigatório";
    if (!form.code.trim()) newErrors.code = "Código do curso é obrigatório";
    if (!form.departmentId) newErrors.departmentId = "Departamento é obrigatório";
    const cargaHoraria = parseInt(form.totalHours);
    if (!form.totalHours || isNaN(cargaHoraria) || cargaHoraria <= 0) newErrors.totalHours = "Carga horária deve ser maior que zero";
    const duracao = parseInt(form.durationSemesters);
    if (!form.durationSemesters || isNaN(duracao) || duracao <= 0) newErrors.durationSemesters = "Duração deve ser maior que zero";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validarForm()) return;

    const payload = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      departmentId: form.departmentId,
      totalHours: parseInt(form.totalHours),
      durationSemesters: parseInt(form.durationSemesters),
      status: form.status,
      description: form.description.trim() || undefined,
    };

    if (isEditMode && selectedCurso) {
      updateMutation.mutate({ id: selectedCurso.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEdit = (curso: BackendCourse) => {
    setSelectedCurso(curso);
    setForm({
      name: curso.name,
      code: curso.code,
      departmentId: curso.department?.id || "",
      totalHours: String(curso.totalHours),
      durationSemesters: String(curso.durationSemesters),
      status: curso.status,
      description: curso.description || ""
    });
    setIsEditMode(true);
    setIsModalOpen(true);
    setErrors({});
  };

  const handleDelete = (curso: BackendCourse) => {
    if (confirm(`Tem certeza que deseja excluir o curso "${curso.name}"?`)) {
      deleteMutation.mutate(curso.id);
    }
  };
  
  const handleView = (curso: BackendCourse) => {
    setSelectedCurso(curso);
    setIsViewModalOpen(true);
  };

  function resetForm() {
    setForm({
      name: "",
      code: "",
      departmentId: "",
      totalHours: "",
      durationSemesters: "",
      status: "active",
      description: ""
    })
    setErrors({})
    setIsEditMode(false)
    setSelectedCurso(null)
  }

  function handleOpenModal() {
    resetForm()
    setIsModalOpen(true)
  }

  function handleCloseModal() {
    setIsModalOpen(false)
    resetForm()
  }

  if (isLoadingCursos) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar userRole="administrador" />
        <main className="flex-1 overflow-y-auto">
          <PageSpinner />
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="administrador" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Gestão de Cursos</h1>
              <p className="text-muted-foreground">Cadastrar, listar, buscar e gerenciar cursos</p>
            </div>
            <Button onClick={handleOpenModal}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Curso
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Cursos</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estatisticas.total}</div>
                <p className="text-xs text-muted-foreground">
                  {estatisticas.ativos} ativos, {estatisticas.inativos} inativos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estatisticas.totalAlunos}</div>
                <p className="text-xs text-muted-foreground">Em todos os cursos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Departamentos</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estatisticas.departamentos}</div>
                <p className="text-xs text-muted-foreground">Departamentos ativos</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="lista" className="space-y-6">
            <TabsContent value="lista" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Cursos
                  </CardTitle>
                  <CardDescription>Gerencie os cursos do sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <Input
                        placeholder="Pesquisar por nome, código ou departamento..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                    <Select value={departamentoFilter} onValueChange={setDepartamentoFilter}>
                      <SelectTrigger className="w-54">
                        <SelectValue placeholder="Filtrar por departamento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os departamentos</SelectItem>
                        {departamentos.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filtrar por status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os status</SelectItem>
                        <SelectItem value="Ativo">Ativo</SelectItem>
                        <SelectItem value="Inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    {cursos.map((curso) => (
                      <Card key={curso.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-lg">{curso.name}</h3>
                                <Badge variant="outline" className="font-mono">{curso.code}</Badge>
                                <Badge variant={curso.status === "active" ? "default" : "secondary"}>
                                  {statusDisplayMap[curso.status]}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Building2 className="w-3.5 h-3.5" />
                                  {curso.department?.name}
                                </span>
                                <span>{curso.totalHours}h • {curso.durationSemesters} semestres</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleView(curso)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleEdit(curso)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleDelete(curso)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {cursos.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Nenhum curso encontrado.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Editar Curso" : "Novo Curso"}</DialogTitle>
            <DialogDescription>
              {isEditMode ? "Atualize as informações do curso" : "Preencha os dados para cadastrar um novo curso"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Curso *</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={errors.name ? "border-destructive" : ""} />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Código *</Label>
                <Input id="code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className={errors.code ? "border-destructive" : ""} />
                {errors.code && <p className="text-sm text-destructive">{errors.code}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="departmentId">Departamento *</Label>
                <Select value={form.departmentId} onValueChange={(v) => setForm({ ...form, departmentId: v })}>
                  <SelectTrigger className={errors.departmentId ? "border-destructive" : "w-full"}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {departamentos.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.departmentId && <p className="text-sm text-destructive">{errors.departmentId}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalHours">Carga Horária (horas)*</Label>
                <Input id="totalHours" type="number" value={form.totalHours} onChange={(e) => setForm({ ...form, totalHours: e.target.value })} className={errors.totalHours ? "border-destructive" : ""} />
                {errors.totalHours && <p className="text-sm text-destructive">{errors.totalHours}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="durationSemesters">Semestres *</Label>
                  <Input id="durationSemesters" type="number" value={form.durationSemesters} onChange={(e) => setForm({ ...form, durationSemesters: e.target.value })} className={errors.durationSemesters ? "border-destructive" : ""} />
                  {errors.durationSemesters && <p className="text-sm text-destructive">{errors.durationSemesters}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as "active" | "inactive" })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseModal}>Cancelar</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {isEditMode ? "Salvar Alterações" : "Cadastrar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedCurso?.name}</DialogTitle>
            <DialogDescription>Detalhes do curso</DialogDescription>
          </DialogHeader>
          {selectedCurso && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Código</Label>
                  <p className="font-semibold font-mono">{selectedCurso.code}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div>
                    <Badge variant={selectedCurso.status === "active" ? "default" : "secondary"}>
                      {selectedCurso.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Departamento</Label>
                  <p className="font-semibold">{selectedCurso.department?.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Carga Horária</Label>
                  <p className="font-semibold">{selectedCurso.totalHours}h</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Duração</Label>
                  <p className="font-semibold">{selectedCurso.durationSemesters} semestres</p>
                </div>
              </div>
              {selectedCurso.description && (
                <div>
                  <Label className="text-muted-foreground">Descrição</Label>
                  <p className="text-sm">{selectedCurso.description}</p>
                </div>
              )}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Alunos</p>
                  <p className="font-semibold">{estatisticas.totalAlunos}</p>
                </div>
                <div className="text-center">
                  <BookOpen className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Turmas</p>
                  <p className="font-semibold">{estatisticas.totalTurmas}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Fechar
            </Button>
            {selectedCurso && (
              <Button onClick={() => {
                setIsViewModalOpen(false)
                handleEdit(selectedCurso)
              }}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

