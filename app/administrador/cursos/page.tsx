"use client"

import { useMemo, useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BookOpen, Plus, Search, Edit, Trash2, Eye, GraduationCap, Users, Building2 } from "lucide-react"

type Curso = {
  id: number
  nome: string
  codigo: string
  departamento: string
  cargaHoraria: number
  duracao: number
  status: "Ativo" | "Inativo"
  alunos: number
  professores: number
  turmas: number
  descricao?: string
}

const MOCK_CURSOS: Curso[] = [
  {
    id: 1,
    nome: "Sistemas de Informação",
    codigo: "SI",
    departamento: "Sistemas de Informação",
    cargaHoraria: 3200,
    duracao: 8,
    status: "Ativo",
    alunos: 120,
    professores: 15,
    turmas: 8,
    descricao: "Curso de graduação em Sistemas de Informação"
  },
  {
    id: 2,
    nome: "Análise e Desenvolvimento de Sistemas",
    codigo: "ADS",
    departamento: "Sistemas de Informação",
    cargaHoraria: 2400,
    duracao: 6,
    status: "Ativo",
    alunos: 95,
    professores: 12,
    turmas: 6,
    descricao: "Curso tecnológico em Análise e Desenvolvimento de Sistemas"
  },
  {
    id: 3,
    nome: "Engenharia de Software",
    codigo: "ES",
    departamento: "Sistemas de Informação",
    cargaHoraria: 3600,
    duracao: 10,
    status: "Ativo",
    alunos: 80,
    professores: 10,
    turmas: 5,
    descricao: "Curso de graduação em Engenharia de Software"
  },
  {
    id: 4,
    nome: "Administração",
    codigo: "ADM",
    departamento: "Ciências Administrativas",
    cargaHoraria: 3000,
    duracao: 8,
    status: "Ativo",
    alunos: 200,
    professores: 20,
    turmas: 12,
    descricao: "Curso de graduação em Administração"
  },
  {
    id: 5,
    nome: "Direito",
    codigo: "DIR",
    departamento: "Ciências Jurídicas",
    cargaHoraria: 4000,
    duracao: 10,
    status: "Ativo",
    alunos: 300,
    professores: 25,
    turmas: 15,
    descricao: "Curso de graduação em Direito"
  },
  {
    id: 6,
    nome: "Enfermagem",
    codigo: "ENF",
    departamento: "Ciências da Saúde",
    cargaHoraria: 3500,
    duracao: 8,
    status: "Inativo",
    alunos: 0,
    professores: 0,
    turmas: 0,
    descricao: "Curso de graduação em Enfermagem"
  }
]

const DEPARTAMENTOS = [
  "Sistemas de Informação",
  "Ciências Administrativas",
  "Ciências Jurídicas",
  "Ciências da Saúde",
  "Educação",
  "Engenharia"
]

export default function CursosAdministradorPage() {
  const [cursos, setCursos] = useState<Curso[]>(MOCK_CURSOS)
  const [search, setSearch] = useState("")
  const [departamentoFilter, setDepartamentoFilter] = useState<string>("todos")
  const [statusFilter, setStatusFilter] = useState<"todos" | "Ativo" | "Inativo">("todos")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedCurso, setSelectedCurso] = useState<Curso | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  const [form, setForm] = useState<{
    nome: string
    codigo: string
    departamento: string
    cargaHoraria: string
    duracao: string
    status: "Ativo" | "Inativo"
    descricao: string
  }>({
    nome: "",
    codigo: "",
    departamento: "",
    cargaHoraria: "",
    duracao: "",
    status: "Ativo",
    descricao: ""
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const filtrados = useMemo(() => {
    return cursos.filter((c) => {
      const hitsDepartamento = departamentoFilter === "todos" ? true : c.departamento === departamentoFilter
      const hitsStatus = statusFilter === "todos" ? true : c.status === statusFilter
      const q = search.toLowerCase().trim()
      const hitsSearch = q
        ? c.nome.toLowerCase().includes(q) || 
          c.codigo.toLowerCase().includes(q) ||
          c.departamento.toLowerCase().includes(q)
        : true
      return hitsDepartamento && hitsStatus && hitsSearch
    })
  }, [cursos, departamentoFilter, statusFilter, search])

  const estatisticas = useMemo(() => {
    return {
      total: cursos.length,
      ativos: cursos.filter(c => c.status === "Ativo").length,
      inativos: cursos.filter(c => c.status === "Inativo").length,
      totalAlunos: cursos.reduce((acc, c) => acc + c.alunos, 0),
      totalProfessores: cursos.reduce((acc, c) => acc + c.professores, 0),
      totalTurmas: cursos.reduce((acc, c) => acc + c.turmas, 0),
      departamentos: new Set(cursos.map(c => c.departamento)).size
    }
  }, [cursos])

  function validarForm(): boolean {
    const newErrors: Record<string, string> = {}

    if (!form.nome.trim()) {
      newErrors.nome = "Nome do curso é obrigatório"
    }

    if (!form.codigo.trim()) {
      newErrors.codigo = "Código do curso é obrigatório"
    }

    if (!form.departamento) {
      newErrors.departamento = "Departamento é obrigatório"
    }

    const cargaHoraria = parseInt(form.cargaHoraria)
    if (!form.cargaHoraria || isNaN(cargaHoraria) || cargaHoraria <= 0) {
      newErrors.cargaHoraria = "Carga horária deve ser maior que zero"
    }

    const duracao = parseInt(form.duracao)
    if (!form.duracao || isNaN(duracao) || duracao <= 0) {
      newErrors.duracao = "Duração deve ser maior que zero"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!validarForm()) return

    const novo: Curso = {
      id: Math.max(0, ...cursos.map((c) => c.id)) + 1,
      nome: form.nome.trim(),
      codigo: form.codigo.trim().toUpperCase(),
      departamento: form.departamento,
      cargaHoraria: parseInt(form.cargaHoraria),
      duracao: parseInt(form.duracao),
      status: form.status,
      alunos: 0,
      professores: 0,
      turmas: 0,
      descricao: form.descricao.trim() || undefined
    }

    setCursos((prev) => [novo, ...prev])
    resetForm()
  }

  function handleEdit(curso: Curso) {
    setSelectedCurso(curso)
    setForm({
      nome: curso.nome,
      codigo: curso.codigo,
      departamento: curso.departamento,
      cargaHoraria: curso.cargaHoraria.toString(),
      duracao: curso.duracao.toString(),
      status: curso.status,
      descricao: curso.descricao || ""
    })
    setIsEditMode(true)
    setIsModalOpen(true)
    setErrors({})
  }

  function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!validarForm() || !selectedCurso) return

    setCursos((prev) =>
      prev.map((c) =>
        c.id === selectedCurso.id
          ? {
              ...c,
              nome: form.nome.trim(),
              codigo: form.codigo.trim().toUpperCase(),
              departamento: form.departamento,
              cargaHoraria: parseInt(form.cargaHoraria),
              duracao: parseInt(form.duracao),
              status: form.status,
              descricao: form.descricao.trim() || undefined
            }
          : c
      )
    )

    resetForm()
    setIsModalOpen(false)
    setIsEditMode(false)
    setSelectedCurso(null)
  }

  function handleDelete(curso: Curso) {
    if (confirm(`Tem certeza que deseja excluir o curso "${curso.nome}"?`)) {
      setCursos((prev) => prev.filter((c) => c.id !== curso.id))
    }
  }

  function handleView(curso: Curso) {
    setSelectedCurso(curso)
    setIsViewModalOpen(true)
  }

  function resetForm() {
    setForm({
      nome: "",
      codigo: "",
      departamento: "",
      cargaHoraria: "",
      duracao: "",
      status: "Ativo",
      descricao: ""
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <CardTitle className="text-sm font-medium">Total de Professores</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estatisticas.totalProfessores}</div>
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
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="lista">Lista</TabsTrigger>
            </TabsList>

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
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filtrar por departamento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os departamentos</SelectItem>
                        {DEPARTAMENTOS.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
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
                    {filtrados.map((curso) => (
                      <Card key={curso.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-lg">{curso.nome}</h3>
                                <Badge variant="outline" className="font-mono">{curso.codigo}</Badge>
                                <Badge variant={curso.status === "Ativo" ? "default" : "secondary"}>
                                  {curso.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Building2 className="w-3.5 h-3.5" />
                                  {curso.departamento}
                                </span>
                                <span>{curso.cargaHoraria}h • {curso.duracao} semestres</span>
                              </div>
                              <div className="flex items-center gap-6 text-sm text-muted-foreground mt-2">
                                <span className="flex items-center gap-1">
                                  <Users className="w-3.5 h-3.5" />
                                  {curso.alunos} alunos
                                </span>
                                <span className="flex items-center gap-1">
                                  <GraduationCap className="w-3.5 h-3.5" />
                                  {curso.professores} professores
                                </span>
                                <span className="flex items-center gap-1">
                                  <BookOpen className="w-3.5 h-3.5" />
                                  {curso.turmas} turmas
                                </span>
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
                    {filtrados.length === 0 && (
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
          <form onSubmit={isEditMode ? handleUpdate : handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Curso *</Label>
              <Input
                id="nome"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Ex: Sistemas de Informação"
                className={errors.nome ? "border-destructive" : ""}
              />
              {errors.nome && <p className="text-sm text-destructive">{errors.nome}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código *</Label>
                <Input
                  id="codigo"
                  value={form.codigo}
                  onChange={(e) => setForm({ ...form, codigo: e.target.value.toUpperCase() })}
                  placeholder="Ex: SI"
                  maxLength={10}
                  className={errors.codigo ? "border-destructive" : ""}
                />
                {errors.codigo && <p className="text-sm text-destructive">{errors.codigo}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="departamento">Departamento *</Label>
                <Select value={form.departamento} onValueChange={(v) => setForm({ ...form, departamento: v })}>
                  <SelectTrigger className={errors.departamento ? "border-destructive" : ""}>
                    <SelectValue placeholder="Selecione o departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTAMENTOS.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.departamento && <p className="text-sm text-destructive">{errors.departamento}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cargaHoraria">Carga Horária (horas) *</Label>
                <Input
                  id="cargaHoraria"
                  type="number"
                  value={form.cargaHoraria}
                  onChange={(e) => setForm({ ...form, cargaHoraria: e.target.value })}
                  placeholder="Ex: 3200"
                  min="1"
                  className={errors.cargaHoraria ? "border-destructive" : ""}
                />
                {errors.cargaHoraria && <p className="text-sm text-destructive">{errors.cargaHoraria}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duracao">Duração (semestres) *</Label>
                  <Input
                    id="duracao"
                    type="number"
                    value={form.duracao}
                    onChange={(e) => setForm({ ...form, duracao: e.target.value })}
                    placeholder="Ex: 8"
                    min="1"
                    className={errors.duracao ? "border-destructive" : ""}
                  />
                  {errors.duracao && <p className="text-sm text-destructive">{errors.duracao}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as "Ativo" | "Inativo" })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                placeholder="Descreva o curso..."
                rows={4}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button type="submit">{isEditMode ? "Salvar Alterações" : "Cadastrar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedCurso?.nome}</DialogTitle>
            <DialogDescription>Detalhes do curso</DialogDescription>
          </DialogHeader>
          {selectedCurso && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Código</Label>
                  <p className="font-semibold font-mono">{selectedCurso.codigo}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div>
                    <Badge variant={selectedCurso.status === "Ativo" ? "default" : "secondary"}>
                      {selectedCurso.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Departamento</Label>
                  <p className="font-semibold">{selectedCurso.departamento}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Carga Horária</Label>
                  <p className="font-semibold">{selectedCurso.cargaHoraria}h</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Duração</Label>
                  <p className="font-semibold">{selectedCurso.duracao} semestres</p>
                </div>
              </div>
              {selectedCurso.descricao && (
                <div>
                  <Label className="text-muted-foreground">Descrição</Label>
                  <p className="text-sm">{selectedCurso.descricao}</p>
                </div>
              )}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Alunos</p>
                  <p className="font-semibold">{selectedCurso.alunos}</p>
                </div>
                <div className="text-center">
                  <GraduationCap className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Professores</p>
                  <p className="font-semibold">{selectedCurso.professores}</p>
                </div>
                <div className="text-center">
                  <BookOpen className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Turmas</p>
                  <p className="font-semibold">{selectedCurso.turmas}</p>
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

