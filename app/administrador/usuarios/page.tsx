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
import { Users, Plus, Search, Edit, Mail, Eye, EyeOff, Ban, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { ModalEditarUsuario, type Usuario as UsuarioType } from "@/components/modals/modal-editar-usuario"
import { ModalDetalhesUsuario, type UsuarioDetalhes } from "@/components/modals/modal-detalhes-usuario"
import { ModalConfirmacao } from "@/components/modals/modal-confirmacao"
import { usuariosService, type Usuario, type Role } from "@/src/services/usuariosService"
import { getDepartments, addTeachersToDepartment, setDepartmentCoordinator, type Department } from "@/src/services/departmentsService"
import { getCourses, type BackendCourse } from "@/src/services/coursesService"
import { linkStudentToCourses } from "@/src/services/studentCoursesService"
import { toast } from "@/components/ui/toast"
import { getCurrentUser } from "@/src/services/professor-dashboard"
import { useRouter } from "next/navigation"

export default function UsuariosAdministradorPage() {
  const router = useRouter()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<Role | "todos">("todos")
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null)
  const [usuarioDetalhes, setUsuarioDetalhes] = useState<UsuarioDetalhes | null>(null)
  const [usuarioInativando, setUsuarioInativando] = useState<Usuario | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  
  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Departamentos (para quando a role selecionada for professor)
  const [departments, setDepartments] = useState<Department[]>([])
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])
  const [selectedCoordinatorDept, setSelectedCoordinatorDept] = useState<string>("")

  // Cursos (para quando a role selecionada for aluno)
  const [courses, setCourses] = useState<BackendCourse[]>([])
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [entrySemester, setEntrySemester] = useState<string>("")
  const [entrySemesterError, setEntrySemesterError] = useState<string | null>(null)

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

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1)
  }, [roleFilter, search])

  // Carregar usuários ao montar o componente e quando a página, filtros ou busca mudarem
  useEffect(() => {
    carregarUsuarios()
  }, [currentPage, itemsPerPage, roleFilter, search])

  async function carregarUsuarios() {
    try {
      setLoading(true)
      setError(null)
      const response = await usuariosService.listar(currentPage, itemsPerPage, roleFilter, search)
      setUsuarios(response.data)
      setTotalPages(response.totalPages)
      setTotal(response.total)
    } catch (err: any) {
      setError(err.message || "Erro ao carregar usuários")
      console.error("Erro ao carregar usuários:", err)
    } finally {
      setLoading(false)
    }
  }

  const [form, setForm] = useState<{
    nome: string
    email: string
    usuario: string
    telefone: string
    cpf: string
    senha: string
    confirmarSenha: string
    role: Role
    status: "Ativo" | "Inativo"
  }>({
    nome: "",
    email: "",
    usuario: "",
    telefone: "",
    cpf: "",
    senha: "",
    confirmarSenha: "",
    role: "aluno",
    status: "Ativo",
  })

  // Carregar departamentos quando o papel requer vínculo com departamento
  useEffect(() => {
    async function loadDepartmentsIfNeeded() {
      if (form.role === "professor" || form.role === "coordenador") {
        try {
          const depts = await getDepartments() // admin pode ver todos
          setDepartments(depts)
          if (form.role === "professor") {
            setSelectedDepartments((prev) => (prev.length ? prev : [""]))
          }
        } catch (err) {
          console.error("Erro ao carregar departamentos:", err)
        }
      } else {
        setSelectedDepartments([])
        setSelectedCoordinatorDept("")
      }
    }
    loadDepartmentsIfNeeded()
  }, [form.role])

  // Carregar cursos e preparar estados quando papel for aluno
  useEffect(() => {
    async function loadCoursesIfNeeded() {
      if (form.role === "aluno") {
        try {
          const list = await getCourses({ status: "active" })
          setCourses(list)
          setSelectedCourses((prev) => (prev.length ? prev : [""]))
          // Definir semestre padrão YYYY-1|2 se não definido
          setEntrySemester((prev) => {
            if (prev) return prev
            const now = new Date()
            const semester = now.getMonth() < 6 ? 1 : 2
            return `${now.getFullYear()}-${semester}`
          })
        } catch (err) {
          console.error("Erro ao carregar cursos:", err)
        }
      } else {
        setSelectedCourses([])
        setCourses([])
        setEntrySemester("")
      }
    }
    loadCoursesIfNeeded()
  }, [form.role])

  // Usar os usuários diretamente, pois o filtro já é feito no backend
  const filtrados = usuarios

  // Funções de paginação
  function handlePageChange(newPage: number) {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  function handleItemsPerPageChange(newLimit: number) {
    setItemsPerPage(newLimit)
    setCurrentPage(1) // Resetar para primeira página
  }

  // Combobox dinâmicos de departamentos (para professores)
  function addDepartmentCombo() {
    setSelectedDepartments((prev) => [...prev, ""])
  }
  function removeDepartmentCombo(index: number) {
    setSelectedDepartments((prev) => prev.filter((_, i) => i !== index))
  }
  function editDepartmentCombo(index: number, departmentId: string) {
    setSelectedDepartments((prev) => {
      const next = [...prev]
      next[index] = departmentId
      return next
    })
  }

  // Combobox dinâmicos de cursos (para alunos)
  function addCourseCombo() {
    setSelectedCourses((prev) => [...prev, ""])
  }
  function removeCourseCombo(index: number) {
    setSelectedCourses((prev) => prev.filter((_, i) => i !== index))
  }
  function editCourseCombo(index: number, courseId: string) {
    setSelectedCourses((prev) => {
      const next = [...prev]
      next[index] = courseId
      return next
    })
  }

  function validarEntrySemester(value: string): boolean {
    return /^\d{4}-(1|2)$/.test(value)
  }

  // Função para formatar CPF
  function formatarCPF(value: string): string {
    const cpf = value.replace(/\D/g, "")
    if (cpf.length <= 3) return cpf
    if (cpf.length <= 6) return `${cpf.slice(0, 3)}.${cpf.slice(3)}`
    if (cpf.length <= 9) return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6)}`
    return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9, 11)}`
  }

  // Função para validar CPF
  function validarCPF(cpf: string): boolean {
    const cpfLimpo = cpf.replace(/\D/g, "")
    
    // Verificar se tem 11 dígitos
    if (cpfLimpo.length !== 11) return false
    
    // Verificar se todos os dígitos são iguais (CPF inválido)
    if (/^(\d)\1{10}$/.test(cpfLimpo)) return false
    
    // Validar dígitos verificadores
    let soma = 0
    let resto
    
    // Validar primeiro dígito verificador
    for (let i = 1; i <= 9; i++) {
      soma += parseInt(cpfLimpo.substring(i - 1, i)) * (11 - i)
    }
    resto = (soma * 10) % 11
    if (resto === 10 || resto === 11) resto = 0
    if (resto !== parseInt(cpfLimpo.substring(9, 10))) return false
    
    // Validar segundo dígito verificador
    soma = 0
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(cpfLimpo.substring(i - 1, i)) * (12 - i)
    }
    resto = (soma * 10) % 11
    if (resto === 10 || resto === 11) resto = 0
    if (resto !== parseInt(cpfLimpo.substring(10, 11))) return false
    
    return true
  }

  // Estado para erro de CPF
  const [cpfError, setCpfError] = useState<string | null>(null)

  // Estados para mostrar/ocultar senhas
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Handler para mudança no campo CPF
  function handleCpfChange(value: string) {
    const formatted = formatarCPF(value)
    setForm({ ...form, cpf: formatted })
    
    // Validar apenas se o usuário digitou algo
    if (formatted.replace(/\D/g, "").length > 0) {
      const cpfLimpo = formatted.replace(/\D/g, "")
      if (cpfLimpo.length < 11) {
        setCpfError("CPF deve conter 11 dígitos")
      } else if (!validarCPF(formatted)) {
        setCpfError("CPF inválido")
      } else {
        setCpfError(null)
      }
    } else {
      setCpfError(null)
    }
  }

  // Função para validar senha forte
  function validarSenhaForte(senha: string): { valida: boolean; requisitos: string[] } {
    const requisitos: string[] = []
    
    if (senha.length < 8) {
      requisitos.push("Mínimo de 8 caracteres")
    }
    if (!/[A-Z]/.test(senha)) {
      requisitos.push("Pelo menos 1 letra maiúscula")
    }
    if (!/[a-z]/.test(senha)) {
      requisitos.push("Pelo menos 1 letra minúscula")
    }
    if (!/[0-9]/.test(senha)) {
      requisitos.push("Pelo menos 1 número")
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(senha)) {
      requisitos.push("Pelo menos 1 caractere especial (!@#$%^&*...)")
    }
    
    return {
      valida: requisitos.length === 0,
      requisitos
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome.trim() || !form.email.trim()) return
    
    // Validar email único antes de prosseguir
    try {
      const emailExiste = await usuariosService.verificarEmailExistente(form.email.trim())
      if (emailExiste) {
        toast({
          variant: 'error',
          title: 'Email já cadastrado',
          description: 'Já existe um usuário com este email no sistema. Por favor, use outro email.',
        })
        return
      }
    } catch (err: any) {
      console.error("Erro ao verificar email:", err)
      // Continuar mesmo se houver erro na verificação, pois o backend também validará
    }
    
    // Validações específicas para aluno
    if (form.role === "aluno") {
      const toLinkPreview = Array.from(new Set(selectedCourses.filter(Boolean)))
      if (toLinkPreview.length === 0) {
        toast({
          variant: 'error',
          title: 'Selecione pelo menos um curso',
          description: 'Alunos precisam estar vinculados a pelo menos um curso.'
        })
        return
      }
      if (!entrySemester || !validarEntrySemester(entrySemester)) {
        toast({
          variant: 'error',
          title: 'Semestre de ingresso inválido',
          description: "Informe no formato 'YYYY-1' ou 'YYYY-2'."
        })
        return
      }
    }

    // Validar CPF se preenchido
    if (form.cpf) {
      const cpfLimpo = form.cpf.replace(/\D/g, "")
      if (cpfLimpo.length !== 11) {
        setCpfError("CPF deve conter 11 dígitos")
        return
      }
      if (!validarCPF(form.cpf)) {
        setCpfError("CPF inválido")
        return
      }
    }

    // Validar senha forte
    if (!form.senha) {
      toast({
        variant: 'error',
        title: 'Senha obrigatória',
        description: 'Por favor, informe uma senha para o usuário.'
      })
      return
    }

    if (form.senha !== form.confirmarSenha) {
      toast({
        variant: 'error',
        title: 'Senhas não coincidem',
        description: 'As senhas informadas não são iguais. Por favor, verifique.'
      })
      return
    }

    const validacaoSenha = validarSenhaForte(form.senha)
    if (!validacaoSenha.valida) {
      const requisitosTexto = validacaoSenha.requisitos.map(r => `• ${r}`).join('\n')
      toast({
        variant: 'error',
        title: 'Senha não atende aos requisitos',
        description: `A senha precisa ter:\n${requisitosTexto}`,
        duration: 6000
      })
      return
    }
    
    setIsCreating(true)
    try {
      setError(null)
      setCpfError(null)
      const novo = await usuariosService.criar({
        nome: form.nome.trim(),
        email: form.email.trim(),
        usuario: form.usuario.trim() || undefined,
        telefone: form.telefone.trim() || undefined,
        cpf: form.cpf.replace(/\D/g, "") || undefined,
        senha: form.senha,
        confirmarSenha: form.confirmarSenha,
        role: form.role,
        status: form.status,
      })

      // Se for aluno, vincular cursos selecionados
      if (form.role === "aluno") {
        try {
          const toLink = Array.from(new Set(selectedCourses.filter(Boolean)))
          if (toLink.length > 0) {
            await linkStudentToCourses(novo.id, toLink, entrySemester)
          }
        } catch (linkErr: any) {
          console.error("Erro ao vincular aluno aos cursos:", linkErr)
          toast({
            variant: 'error',
            title: 'Aluno criado, mas houve erro ao vincular cursos',
            description: linkErr?.message || 'Tente vincular novamente na tela do curso ou aluno.'
          })
        }
      }

      // Se for coordenador e houver departamento selecionado, aplicar vinculação (opcional)
      if (form.role === "coordenador" && selectedCoordinatorDept) {
        try {
          await setDepartmentCoordinator(selectedCoordinatorDept, novo.id)
        } catch (linkErr: any) {
          console.error("Erro ao definir coordenador do departamento:", linkErr)
          toast({
            variant: 'error',
            title: 'Usuário criado, mas houve erro ao definir coordenador',
            description: linkErr?.message || 'Tente definir novamente em Departamentos.',
          })
        }
      }

      // Se for professor e houver departamentos selecionados, vincular nos departamentos
      if (form.role === "professor" && selectedDepartments.length > 0) {
        try {
          const toLink = Array.from(new Set(selectedDepartments.filter(Boolean)))
          if (toLink.length === 0) {
            // nada para vincular
          } else {
          await Promise.all(
              toLink.map((deptId) =>
              addTeachersToDepartment(deptId, [novo.id])
            )
          )
          }
        } catch (linkErr: any) {
          console.error("Erro ao vincular professor aos departamentos:", linkErr)
          toast({
            variant: 'error',
            title: 'Professor criado, mas houve erro ao vincular departamento',
            description: linkErr?.message || 'Tente vincular novamente na tela de departamentos.'
          })
        }
      }

      // Recarregar a lista para atualizar a paginação
      await carregarUsuarios()
      setForm({
        nome: "",
        email: "",
        usuario: "",
        telefone: "",
        cpf: "",
        senha: "",
        confirmarSenha: "",
        role: "aluno",
        status: "Ativo",
      })
      setSelectedDepartments([])
      setSelectedCoordinatorDept("")
      setSelectedCourses([])
      setEntrySemester("")
      setCpfError(null)
      
      // Toast de sucesso
      toast({
        variant: 'success',
        title: 'Usuário cadastrado com sucesso!',
        description: `O usuário "${novo.nome}" foi cadastrado com sucesso.`,
        duration: 5000
      })
    } catch (err: any) {
      setError(err.message || "Erro ao criar usuário")
      toast({
        variant: 'error',
        title: 'Erro ao cadastrar usuário',
        description: err.message || "Não foi possível criar o usuário. Tente novamente."
      })
    } finally {
      setIsCreating(false)
    }
  }

  function handleEditar(usuario: Usuario) {
    setUsuarioEditando(usuario)
  }

  async function handleSalvarEdicao(usuarioAtualizado: UsuarioType) {
    try {
      setError(null)
      const atualizado = await usuariosService.atualizar(usuarioAtualizado.id, {
        nome: usuarioAtualizado.nome,
        email: usuarioAtualizado.email,
        usuario: usuarioAtualizado.usuario,
        telefone: usuarioAtualizado.telefone,
        cpf: usuarioAtualizado.cpf,
        role: usuarioAtualizado.role,
        status: usuarioAtualizado.status,
      })
      setUsuarios((prev) =>
        prev.map((u) => (u.id === atualizado.id ? atualizado : u))
      )
      setUsuarioEditando(null)
    } catch (err: any) {
      setError(err.message || "Erro ao atualizar usuário")
      alert(err.message || "Erro ao atualizar usuário")
    }
  }

  function handleInativar(usuario: Usuario) {
    setUsuarioInativando(usuario)
  }

  async function confirmarInativacao() {
    if (!usuarioInativando) return
    try {
      setError(null)
      const atualizado = await usuariosService.inativar(usuarioInativando.id)
      setUsuarios((prev) =>
        prev.map((u) => (u.id === atualizado.id ? atualizado : u))
      )
      setUsuarioInativando(null)
    } catch (err: any) {
      setError(err.message || "Erro ao inativar usuário")
      alert(err.message || "Erro ao inativar usuário")
    }
  }

  async function handleDetalhes(usuario: Usuario) {
    try {
      setError(null)
      const detalhes = await usuariosService.buscarDetalhes(usuario.id)
      setUsuarioDetalhes(detalhes)
    } catch (err: any) {
      setError(err.message || "Erro ao carregar detalhes do usuário")
      alert(err.message || "Erro ao carregar detalhes do usuário")
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="administrador" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Gestão de Usuários</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Cadastrar, listar, buscar e filtrar usuários</p>
          </div>

          <Tabs defaultValue="lista" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="lista">Lista</TabsTrigger>
              <TabsTrigger value="cadastro">Cadastro</TabsTrigger>
            </TabsList>

            <TabsContent value="lista" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Usuários
                  </CardTitle>
                  <CardDescription>Gerencie os usuários do sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                      {error}
                    </div>
                  )}
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <Input
                        placeholder="Pesquisar por nome ou email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                    <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as Role | "todos")}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Filtrar por papel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="aluno">Aluno</SelectItem>
                        <SelectItem value="professor">Professor</SelectItem>
                        <SelectItem value="coordenador">Coordenador</SelectItem>
                        <SelectItem value="administrador">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={() => setCurrentPage(1)} className="w-full md:w-auto">
                      <Search className="w-4 h-4 mr-2" />
                      Buscar
                    </Button>
                  </div>

                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Carregando usuários...
                    </div>
                  ) : (
                  <div className="space-y-3">
                    {filtrados.map((u) => (
                      <Card key={u.id} className="border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="space-y-1 flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                <h3 className="font-semibold text-base sm:text-lg truncate">{u.nome}</h3>
                                <Badge variant="outline" className="capitalize flex-shrink-0">{u.role}</Badge>
                                <Badge variant={u.status === "Ativo" ? "default" : "secondary"} className="flex-shrink-0 sm:hidden">{u.status}</Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1 truncate"><Mail className="w-3.5 h-3.5 flex-shrink-0" /><span className="truncate">{u.email}</span></span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                              <Badge variant={u.status === "Ativo" ? "default" : "secondary"} className="hidden sm:inline-flex">{u.status}</Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-transparent flex-1 sm:flex-initial"
                                onClick={() => handleDetalhes(u)}
                                title="Ver detalhes"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-transparent flex-1 sm:flex-initial"
                                onClick={() => handleEditar(u)}
                                title="Editar usuário"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              {u.status === "Ativo" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-transparent flex-1 sm:flex-initial"
                                  onClick={() => handleInativar(u)}
                                  title="Inativar usuário"
                                >
                                  <Ban className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {filtrados.length === 0 && !loading && (
                      <p className="text-sm text-muted-foreground text-center py-8">Nenhum usuário encontrado.</p>
                    )}
                  </div>
                  )}

                  {/* Controles de Paginação */}
                  {!loading && total > 0 && (
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex flex-col sm:flex-row items-center gap-2 text-sm text-muted-foreground w-full sm:w-auto">
                        <span>Mostrando</span>
                        <div className="flex items-center gap-2">
                          <Select value={itemsPerPage.toString()} onValueChange={(v) => handleItemsPerPageChange(Number(v))}>
                            <SelectTrigger className="w-20 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">5</SelectItem>
                              <SelectItem value="10">10</SelectItem>
                              <SelectItem value="20">20</SelectItem>
                              <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                          </Select>
                          <span>de {total} usuários</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="flex-1 sm:flex-initial"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        
                        <div className="flex items-center gap-1 overflow-x-auto">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum: number
                            if (totalPages <= 5) {
                              pageNum = i + 1
                            } else if (currentPage <= 3) {
                              pageNum = i + 1
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i
                            } else {
                              pageNum = currentPage - 2 + i
                            }
                            
                            return (
                              <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageChange(pageNum)}
                                className="w-8 h-8 p-0 flex-shrink-0"
                              >
                                {pageNum}
                              </Button>
                            )
                          })}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="flex-1 sm:flex-initial"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cadastro" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Novo Usuário</CardTitle>
                  <CardDescription>Preencha os dados para cadastrar um novo usuário</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome</Label>
                      <Input id="nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="usuario">Usuário (login)</Label>
                      <Input id="usuario" value={form.usuario} onChange={(e) => setForm({ ...form, usuario: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input id="telefone" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
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
                      {cpfError && (
                        <p className="text-sm text-red-500">{cpfError}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Papel</Label>
                      <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as Role })}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione o papel" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aluno">Aluno</SelectItem>
                          <SelectItem value="professor">Professor</SelectItem>
                          <SelectItem value="coordenador">Coordenador</SelectItem>
                          <SelectItem value="administrador">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {form.role === "aluno" && (
                      <div className="space-y-4 md:col-span-2">
                        <div className="space-y-2">
                          <Label>Cursos do aluno (adicione quantos precisar)</Label>
                          <div className="space-y-2">
                            {selectedCourses.length === 0 && (
                              <p className="text-sm text-muted-foreground">Clique em “Adicionar curso”.</p>
                            )}
                            {selectedCourses.map((value, index) => {
                              // Evitar duplicados: opções disponíveis são todas menos as já escolhidas (exceto a do índice atual)
                              const used = new Set(selectedCourses.filter((_, i) => i !== index && selectedCourses[i]))
                              const available = courses.filter(c => !used.has(c.id))
                              return (
                                <div key={index} className="flex items-center gap-2">
                                  <Select value={value} onValueChange={(v) => editCourseCombo(index, v)}>
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Selecione o curso" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {available.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  {selectedCourses.length > 1 && (
                                    <Button type="button" variant="outline" onClick={() => removeCourseCombo(index)}>
                                      Remover
                                    </Button>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                          <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={addCourseCombo}>
                              Adicionar curso
                            </Button>
                            {selectedCourses.filter(Boolean).length > 0 && (
                              <p className="text-xs text-muted-foreground self-center">
                                Selecionados: {Array.from(new Set(selectedCourses.filter(Boolean))).length}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="entrySemester">Semestre de ingresso</Label>
                          <Input
                            id="entrySemester"
                            placeholder="YYYY-1 ou YYYY-2"
                            value={entrySemester}
                            onChange={(e) => {
                              const v = e.target.value
                              setEntrySemester(v)
                              setEntrySemesterError(v ? (validarEntrySemester(v) ? null : "Use o formato YYYY-1 ou YYYY-2") : "Semestre é obrigatório")
                            }}
                            className={entrySemesterError ? "border-red-500" : ""}
                          />
                          {entrySemesterError && (
                            <p className="text-sm text-red-500">{entrySemesterError}</p>
                          )}
                        </div>
                      </div>
                    )}
                    {form.role === "professor" && (
                      <div className="space-y-2 md:col-span-2">
                        <Label>Departamentos (adicione quantos precisar)</Label>
                        <div className="space-y-2">
                          {selectedDepartments.length === 0 && (
                            <p className="text-sm text-muted-foreground">Clique em “Adicionar departamento”.</p>
                          )}
                          {selectedDepartments.map((value, index) => {
                            // Evitar duplicados: opções disponíveis são todas menos as já escolhidas (exceto a do índice atual)
                            const used = new Set(selectedDepartments.filter((_, i) => i !== index && selectedDepartments[i]))
                            const available = departments.filter(d => !used.has(d.id))
                            return (
                              <div key={index} className="flex items-center gap-2">
                                <Select value={value} onValueChange={(v) => editDepartmentCombo(index, v)}>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecione o departamento" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {available.map((dept) => (
                                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {selectedDepartments.length > 1 && (
                                  <Button type="button" variant="outline" onClick={() => removeDepartmentCombo(index)}>
                                    Remover
                                  </Button>
                                )}
                              </div>
                            )
                          })}
                        </div>
                        <div className="flex gap-2">
                          <Button type="button" variant="outline" onClick={addDepartmentCombo}>
                            Adicionar departamento
                          </Button>
                          {selectedDepartments.filter(Boolean).length > 0 && (
                            <p className="text-xs text-muted-foreground self-center">
                              Selecionados: {Array.from(new Set(selectedDepartments.filter(Boolean))).length}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    {form.role === "coordenador" && (
                      <div className="space-y-2 md:col-span-2">
                        <Label>Departamento (apenas um)</Label>
                        <Select value={selectedCoordinatorDept} onValueChange={(v) => setSelectedCoordinatorDept(v)}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione o departamento" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
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
                      <div className="relative">
                        <Input 
                          id="senha" 
                          type={showPassword ? "text" : "password"} 
                          value={form.senha} 
                          onChange={(e) => setForm({ ...form, senha: e.target.value })} 
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
                      <div className="relative">
                        <Input 
                          id="confirmarSenha" 
                          type={showConfirmPassword ? "text" : "password"} 
                          value={form.confirmarSenha} 
                          onChange={(e) => setForm({ ...form, confirmarSenha: e.target.value })} 
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
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
                            role: "aluno",
                            status: "Ativo",
                          })
                        }
                        disabled={isCreating}
                      >
                        Limpar
                      </Button>
                      <Button type="submit" disabled={isCreating}>
                        {isCreating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Cadastrando...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Cadastrar
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <ModalEditarUsuario
        isOpen={!!usuarioEditando}
        onClose={() => setUsuarioEditando(null)}
        usuario={usuarioEditando}
        onSalvar={handleSalvarEdicao}
      />

      <ModalDetalhesUsuario
        isOpen={!!usuarioDetalhes}
        onClose={() => setUsuarioDetalhes(null)}
        usuario={usuarioDetalhes}
      />

      <ModalConfirmacao
        isOpen={!!usuarioInativando}
        title="Inativar Usuário"
        description={`Tem certeza que deseja inativar o usuário "${usuarioInativando?.nome}"? O usuário não poderá mais acessar o sistema.`}
        confirmLabel="Inativar"
        cancelLabel="Cancelar"
        onConfirm={confirmarInativacao}
        onClose={() => setUsuarioInativando(null)}
      />
    </div>
  )
}


