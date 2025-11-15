"use client"

import { useMemo, useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Search, Edit, Trash2, Mail, GraduationCap, Loader2 } from "lucide-react"
import { getDepartments, getDepartmentTeachers, removeTeacherFromDepartment, addTeachersToDepartment, type Department, type Teacher } from "@/src/services/departmentsService"
import { usuariosService } from "@/src/services/usuariosService"
import { toastError, toastSuccess } from "@/components/ui/toast"

type Professor = {
  id: string
  nome: string
  email: string
  usuario?: string
  telefone?: string
  cpf?: string
  status: "Ativo" | "Inativo"
}

// ID mockado do coordenador para buscar os departamentos
const MOCK_COORDINATOR_ID = "5f634e5c-d028-434d-af46-cc9ea23eb77b"

export default function ProfessoresCoordenadorPage() {
  const [professores, setProfessores] = useState<Professor[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"todos" | "Ativo" | "Inativo">("todos")
  const [activeTab, setActiveTab] = useState<"lista" | "cadastro">("lista")

  const [form, setForm] = useState<{
    nome: string
    email: string
    usuario: string
    telefone: string
    cpf: string
    senha: string
    confirmarSenha: string
    status: "Ativo" | "Inativo"
  }>({
    nome: "",
    email: "",
    usuario: "",
    telefone: "",
    cpf: "",
    senha: "",
    confirmarSenha: "",
    status: "Ativo",
  })

  // Máscara e validação de CPF (mesmas regras da página de usuários do admin)
  const [cpfError, setCpfError] = useState<string | null>(null)
  function formatarCPF(value: string): string {
    const cpf = value.replace(/\D/g, "")
    if (cpf.length <= 3) return cpf
    if (cpf.length <= 6) return `${cpf.slice(0, 3)}.${cpf.slice(3)}`
    if (cpf.length <= 9) return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6)}`
    return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9, 11)}`
  }
  function validarCPF(cpf: string): boolean {
    const cpfLimpo = cpf.replace(/\D/g, "")
    if (cpfLimpo.length !== 11) return false
    if (/^(\d)\1{10}$/.test(cpfLimpo)) return false
    let soma = 0
    let resto
    for (let i = 1; i <= 9; i++) {
      soma += parseInt(cpfLimpo.substring(i - 1, i)) * (11 - i)
    }
    resto = (soma * 10) % 11
    if (resto === 10 || resto === 11) resto = 0
    if (resto !== parseInt(cpfLimpo.substring(9, 10))) return false
    soma = 0
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(cpfLimpo.substring(i - 1, i)) * (12 - i)
    }
    resto = (soma * 10) % 11
    if (resto === 10 || resto === 11) resto = 0
    if (resto !== parseInt(cpfLimpo.substring(10, 11))) return false
    return true
  }
  function handleCpfChange(value: string) {
    const formatted = formatarCPF(value)
    setForm({ ...form, cpf: formatted })

    const digits = formatted.replace(/\D/g, "")
    if (digits.length === 0) {
      setCpfError(null)
      return
    }
    if (digits.length < 11) {
      setCpfError("CPF deve conter 11 dígitos")
      return
    }
    if (!validarCPF(formatted)) {
      setCpfError("CPF inválido")
      return
    }
    setCpfError(null)
  }

  // Carregar departamentos do coordenador (usando ID mockado)
  useEffect(() => {
    async function loadDepartments() {
      try {
        setIsLoading(true)
        // Usar ID mockado do coordenador para buscar o departamento onde ele é coordenador
        const depts = await getDepartments(MOCK_COORDINATOR_ID)
        
        console.log("Departamentos retornados:", depts)
        
        if (depts.length === 0) {
          toastError("Aviso", "Nenhum departamento encontrado para este coordenador")
          return
        }

        // Usar o primeiro departamento (deve haver apenas um, já que um coordenador só pode ter um departamento)
        const department = depts[0]
        setDepartments([department])
        setSelectedDepartmentId(department.id)
        
        console.log("Departamento selecionado:", department.id, department.name)
      } catch (error: any) {
        console.error("Erro ao carregar departamentos:", error)
        toastError("Erro", error.message || "Não foi possível carregar os departamentos")
      } finally {
        setIsLoading(false)
      }
    }

    loadDepartments()
  }, [])

  // Carregar professores quando o departamento mudar
  useEffect(() => {
    async function loadTeachers() {
      if (!selectedDepartmentId) return

      try {
        setIsLoadingTeachers(true)
        const teachers = await getDepartmentTeachers(selectedDepartmentId)
        const professoresMapeados: Professor[] = teachers.map((t) => ({
          id: t.id,
          nome: t.name,
          email: t.email,
          usuario: t.usuario,
          telefone: t.telefone,
          cpf: t.cpf,
          status: "Ativo" as const, // Por enquanto sempre ativo, pois não há campo isActive no backend
        }))
        setProfessores(professoresMapeados)
      } catch (error: any) {
        console.error("Erro ao carregar professores:", error)
        toastError("Erro", error.message || "Não foi possível carregar os professores")
        setProfessores([])
      } finally {
        setIsLoadingTeachers(false)
      }
    }

    loadTeachers()
  }, [selectedDepartmentId])

  const filtrados = useMemo(() => {
    return professores.filter((p) => {
      const hitsStatus = statusFilter === "todos" ? true : p.status === statusFilter
      const q = search.toLowerCase().trim()
      const hitsSearch = q
        ? p.nome.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
        : true
      return hitsStatus && hitsSearch
    })
  }, [professores, statusFilter, search])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome.trim() || !form.email.trim()) {
      toastError("Erro", "Nome e email são obrigatórios")
      return
    }

    if (!selectedDepartmentId) {
      toastError("Erro", "Selecione um departamento")
      return
    }

    // Validar CPF se preenchido (mesma regra da página de usuários do admin)
    const cpfDigits = form.cpf.replace(/\D/g, "")
    if (form.cpf) {
      if (cpfDigits.length !== 11) {
        setCpfError("CPF deve conter 11 dígitos")
        return
      }
      if (!validarCPF(form.cpf)) {
        setCpfError("CPF inválido")
        return
      }
    }

    if (form.senha !== form.confirmarSenha) {
      toastError("Erro", "As senhas não coincidem")
      return
    }

    if (form.senha && form.senha.length < 6) {
      toastError("Erro", "A senha deve ter pelo menos 6 caracteres")
      return
    }

    try {
      setIsLoading(true)
      // Criar usuário
      const novoUsuario = await usuariosService.criar({
        nome: form.nome.trim(),
        email: form.email.trim(),
        usuario: form.usuario.trim() || undefined,
        telefone: form.telefone.trim() || undefined,
        cpf: cpfDigits || undefined,
        senha: form.senha,
        confirmarSenha: form.confirmarSenha,
        role: "professor",
        status: form.status,
      })

      // Vincular ao departamento
      await addTeachersToDepartment(selectedDepartmentId, [novoUsuario.id])

      toastSuccess("Sucesso", "Professor cadastrado e vinculado ao departamento com sucesso!")

      setForm({
        nome: "",
        email: "",
        usuario: "",
        telefone: "",
        cpf: "",
        senha: "",
        confirmarSenha: "",
        status: "Ativo",
      })
      setActiveTab("lista")

      // Recarregar professores
      const teachers = await getDepartmentTeachers(selectedDepartmentId)
      const professoresMapeados: Professor[] = teachers.map((t) => ({
        id: t.id,
        nome: t.name,
        email: t.email,
        usuario: t.usuario,
        telefone: t.telefone,
        cpf: t.cpf,
        status: "Ativo" as const,
      }))
      setProfessores(professoresMapeados)
    } catch (error: any) {
      console.error("Erro ao criar professor:", error)
      toastError("Erro", error.message || "Não foi possível criar o professor")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja remover este professor do departamento?")) {
      return
    }

    if (!selectedDepartmentId) {
      toastError("Erro", "Departamento não selecionado")
      return
    }

    try {
      setIsLoadingTeachers(true)
      await removeTeacherFromDepartment(selectedDepartmentId, id)
      toastSuccess("Sucesso", "Professor removido do departamento com sucesso!")

      // Recarregar lista
      const teachers = await getDepartmentTeachers(selectedDepartmentId)
      const professoresMapeados: Professor[] = teachers.map((t) => ({
        id: t.id,
        nome: t.name,
        email: t.email,
        usuario: t.usuario,
        telefone: t.telefone,
        cpf: t.cpf,
        status: "Ativo" as const,
      }))
      setProfessores(professoresMapeados)
    } catch (error: any) {
      console.error("Erro ao remover professor:", error)
      toastError("Erro", error.message || "Não foi possível remover o professor")
    } finally {
      setIsLoadingTeachers(false)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="coordenador" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Gestão de Professores</h1>
              <p className="text-muted-foreground">Cadastrar, listar e gerenciar professores</p>
            </div>
            <Button onClick={() => setActiveTab("cadastro")}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Professor
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "lista" | "cadastro")} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="lista">Lista</TabsTrigger>
              <TabsTrigger value="cadastro">Cadastro</TabsTrigger>
            </TabsList>

            <TabsContent value="lista" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Professores
                  </CardTitle>
                  <CardDescription>Gerencie os professores do sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    {departments.length > 0 && (
                      <div className="text-sm text-muted-foreground flex items-center">
                        <span className="font-semibold ml-1">{departments[0]?.name}</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <Input
                        placeholder="Pesquisar por nome ou email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "todos" | "Ativo" | "Inativo")}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filtrar por status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="Ativo">Ativo</SelectItem>
                        <SelectItem value="Inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {isLoadingTeachers ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-sm text-muted-foreground">Carregando professores...</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filtrados.map((p) => (
                        <Card key={p.id} className="border-l-4 border-l-green-500">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                  <h3 className="font-semibold text-lg">{p.nome}</h3>
                                  <Badge variant="outline">Professor</Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Mail className="w-3.5 h-3.5" />
                                    {p.email}
                                  </span>
                                  {p.telefone && <span>Tel: {p.telefone}</span>}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={p.status === "Ativo" ? "default" : "secondary"}>{p.status}</Badge>
                                <Button variant="outline" size="sm" className="bg-transparent">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-transparent"
                                  onClick={() => handleDelete(p.id)}
                                  disabled={isLoadingTeachers}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {filtrados.length === 0 && !isLoadingTeachers && (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          {selectedDepartmentId ? "Nenhum professor encontrado neste departamento." : "Selecione um departamento para visualizar os professores."}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cadastro" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Novo Professor</CardTitle>
                  <CardDescription>Preencha os dados para cadastrar um novo professor</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome</Label>
                      <Input
                        id="nome"
                        value={form.nome}
                        onChange={(e) => setForm({ ...form, nome: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="usuario">Usuário (login)</Label>
                      <Input
                        id="usuario"
                        value={form.usuario}
                        onChange={(e) => setForm({ ...form, usuario: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        value={form.telefone}
                        onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF</Label>
                      <Input
                        id="cpf"
                        value={form.cpf}
                        onChange={(e) => handleCpfChange(e.target.value)}
                        placeholder="000.000.000-00"
                        maxLength={14}
                        className={cpfError ? "border-red-500" : ""}
                      />
                      {cpfError && <p className="text-sm text-red-500">{cpfError}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as "Ativo" | "Inativo" })}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ativo">Ativo</SelectItem>
                          <SelectItem value="Inativo">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="senha">Senha</Label>
                      <Input
                        id="senha"
                        type="password"
                        value={form.senha}
                        onChange={(e) => setForm({ ...form, senha: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
                      <Input
                        id="confirmarSenha"
                        type="password"
                        value={form.confirmarSenha}
                        onChange={(e) => setForm({ ...form, confirmarSenha: e.target.value })}
                        required
                      />
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-2">
                      <Button
                        type="reset"
                        variant="outline"
                        onClick={() =>
                          setForm({
                            nome: "",
                            email: "",
                            usuario: "",
                            telefone: "",
                            cpf: "",
                            senha: "",
                            confirmarSenha: "",
                            status: "Ativo",
                          })
                        }
                      >
                        Limpar
                      </Button>
                      <Button type="submit">
                        <Plus className="w-4 h-4 mr-2" /> Cadastrar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

