"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LiquidGlassButton } from "@/components/liquid-glass"
import { Save, X, Eye, EyeOff, Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/toast"
import { usuariosService, type Role } from "@/src/services/usuariosService"
import { getDepartments, addTeachersToDepartment, removeTeacherFromDepartment, setDepartmentCoordinator, getUserDepartments, getCoordinatorDepartment, type Department } from "@/src/services/departmentsService"
import { getCourses, type BackendCourse } from "@/src/services/coursesService"
import { linkStudentToCourses, getStudentCourses, removeStudentCourse, type StudentCourseLink } from "@/src/services/studentCoursesService"

type RoleType = "aluno" | "professor" | "coordenador" | "administrador"

export interface Usuario {
  id: string
  nome: string
  email: string
  usuario?: string
  telefone?: string
  cpf?: string
  role: RoleType
  status: "Ativo" | "Inativo"
}

interface ModalEditarUsuarioProps {
  isOpen: boolean
  onClose: () => void
  usuario: Usuario | null
  onSalvar: (usuario: Usuario) => void
}

export function ModalEditarUsuario({
  isOpen,
  onClose,
  usuario,
  onSalvar
}: ModalEditarUsuarioProps) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [usuarioLogin, setUsuarioLogin] = useState('')
  const [telefone, setTelefone] = useState('')
  const [cpf, setCpf] = useState('')
  const [role, setRole] = useState<RoleType>("aluno")
  const [status, setStatus] = useState<"Ativo" | "Inativo">("Ativo")
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [isLiquidGlass, setIsLiquidGlass] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [cpfError, setCpfError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Estados para departamentos (professores e coordenadores)
  const [departments, setDepartments] = useState<Department[]>([])
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])
  const [selectedCoordinatorDept, setSelectedCoordinatorDept] = useState<string>("")
  const [currentUserDepartments, setCurrentUserDepartments] = useState<Department[]>([])
  const [currentCoordinatorDept, setCurrentCoordinatorDept] = useState<Department | null>(null)

  // Estados para cursos (alunos)
  const [courses, setCourses] = useState<BackendCourse[]>([])
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [entrySemester, setEntrySemester] = useState<string>("")
  const [entrySemesterError, setEntrySemesterError] = useState<string | null>(null)
  const [currentStudentCourses, setCurrentStudentCourses] = useState<StudentCourseLink[]>([])

  // Função para formatar CPF
  const formatarCPF = (value: string): string => {
    const cpf = value.replace(/\D/g, "")
    if (cpf.length <= 3) return cpf
    if (cpf.length <= 6) return `${cpf.slice(0, 3)}.${cpf.slice(3)}`
    if (cpf.length <= 9) return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6)}`
    return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9, 11)}`
  }

  // Função para validar CPF
  const validarCPF = (cpf: string): boolean => {
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

  // Função para validar semestre de ingresso
  function validarEntrySemester(value: string): boolean {
    return /^\d{4}-(1|2)$/.test(value)
  }

  // Handler para mudança no campo CPF
  const handleCpfChange = (value: string) => {
    const formatted = formatarCPF(value)
    setCpf(formatted)
    
    if (cpfError) {
      setCpfError(null)
    }
    
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

  // Carregar dados iniciais do usuário quando o modal abre
  useEffect(() => {
    async function loadUserData() {
      if (!usuario || !isOpen) {
        // Resetar estados quando o modal fecha
        setNome('')
        setEmail('')
        setUsuarioLogin('')
        setTelefone('')
        setCpf('')
        setRole("aluno")
        setStatus("Ativo")
        setSenha('')
        setConfirmarSenha('')
        setSelectedDepartments([])
        setSelectedCoordinatorDept("")
        setSelectedCourses([])
        setEntrySemester("")
        setCurrentUserDepartments([])
        setCurrentCoordinatorDept(null)
        setCurrentStudentCourses([])
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        // Buscar dados completos do usuário do backend para garantir que temos todos os campos
        const usuarioCompleto = await usuariosService.buscarPorId(usuario.id)
        
        // Carregar TODOS os dados necessários ANTES de atualizar o estado
        // Isso garante que tudo apareça de uma vez, sem "pulos"
        
        // Carregar listas disponíveis (departamentos e cursos) em paralelo
        const [depts, courseList] = await Promise.all([
          getDepartments().catch(() => []),
          getCourses({ status: "active" }).catch(() => [])
        ])

        // Carregar dados específicos por role ANTES de atualizar estados
        let studentCourses: StudentCourseLink[] = []
        let userDepts: Department[] = []
        let coordDept: Department | null = null
        
        if (usuarioCompleto.role === "aluno") {
          try {
            studentCourses = await getStudentCourses(usuarioCompleto.id)
          } catch (err: any) {
            console.error("Erro ao carregar cursos do aluno:", err)
            // Se o erro for 404, o aluno pode não ter cursos vinculados ainda
            if (err?.response?.status !== 404) {
              toast({
                variant: 'warning',
                title: 'Aviso',
                description: 'Não foi possível carregar os cursos do aluno. Você pode adicionar cursos manualmente.'
              })
            }
            studentCourses = []
          }
        } else if (usuarioCompleto.role === "professor") {
          try {
            userDepts = await getUserDepartments(usuarioCompleto.id)
          } catch (err) {
            console.error("Erro ao carregar departamentos do professor:", err)
            userDepts = []
          }
        } else if (usuarioCompleto.role === "coordenador") {
          try {
            coordDept = await getCoordinatorDepartment(usuarioCompleto.id)
          } catch (err) {
            console.error("Erro ao carregar departamento do coordenador:", err)
            coordDept = null
          }
        }

        // AGORA sim, atualizar todos os estados de uma vez
        // Dados básicos
        setNome(usuarioCompleto.nome || '')
        setEmail(usuarioCompleto.email || '')
        setUsuarioLogin(usuarioCompleto.usuario || '')
        setTelefone(usuarioCompleto.telefone || '')
        setCpf(usuarioCompleto.cpf ? formatarCPF(usuarioCompleto.cpf) : '')
        setRole(usuarioCompleto.role)
        setStatus(usuarioCompleto.status)
        setSenha('')
        setConfirmarSenha('')
        setCpfError(null)
        setEntrySemesterError(null)

        // Listas disponíveis
        setDepartments(depts)
        setCourses(courseList)

        // Dados específicos por role
        if (usuarioCompleto.role === "aluno") {
          setCurrentStudentCourses(studentCourses)
          const courseIds = studentCourses.map(sc => sc.courseId)
          // Só definir cursos selecionados se a lista de cursos disponíveis já estiver carregada
          // Isso garante que o Select possa encontrar os nomes dos cursos
          if (courseList.length > 0 && courseIds.length > 0) {
            // Verificar se todos os cursos do aluno existem na lista disponível
            const validCourseIds = courseIds.filter(id => courseList.some(c => c.id === id))
            setSelectedCourses(validCourseIds.length > 0 ? validCourseIds : [])
          } else {
            setSelectedCourses([])
          }
          // Definir semestre de ingresso do primeiro curso, se disponível
          if (studentCourses.length > 0 && studentCourses[0].entrySemester) {
            setEntrySemester(studentCourses[0].entrySemester)
          } else {
            const now = new Date()
            const semester = now.getMonth() < 6 ? 1 : 2
            setEntrySemester(`${now.getFullYear()}-${semester}`)
          }
        } else if (usuarioCompleto.role === "professor") {
          setCurrentUserDepartments(userDepts)
          const deptIds = userDepts.map(d => d.id)
          setSelectedDepartments(deptIds.length > 0 ? deptIds : [""])
        } else if (usuarioCompleto.role === "coordenador") {
          setCurrentCoordinatorDept(coordDept)
          setSelectedCoordinatorDept(coordDept?.id || "")
        } else {
          // Para administrador ou outros roles, limpar seleções
          setSelectedDepartments([])
          setSelectedCoordinatorDept("")
          setSelectedCourses([])
          setEntrySemester("")
        }
      } catch (err) {
        console.error("Erro ao carregar dados do usuário:", err)
        toast({
          variant: 'error',
          title: 'Erro ao carregar dados',
          description: 'Não foi possível carregar os dados do usuário.'
        })
      } finally {
        setLoading(false)
      }
    }
    loadUserData()
  }, [usuario?.id, isOpen])

  // Carregar departamentos quando role mudar (mas só se não estivermos carregando dados iniciais)
  useEffect(() => {
    if (!isOpen || !usuario || loading) return
    
    async function loadDepartmentsIfNeeded() {
      if (role === "professor" || role === "coordenador") {
        try {
          // Só carregar se ainda não temos a lista
          if (departments.length === 0) {
            const depts = await getDepartments()
            setDepartments(depts)
          }
          // Se for professor e não temos departamentos selecionados, adicionar um campo vazio
          if (role === "professor" && selectedDepartments.length === 0) {
            setSelectedDepartments([""])
          }
        } catch (err) {
          console.error("Erro ao carregar departamentos:", err)
        }
      } else {
        // Limpar apenas se não for o role do usuário original
        if (role !== usuario.role) {
          setSelectedDepartments([])
          setSelectedCoordinatorDept("")
        }
      }
    }
    loadDepartmentsIfNeeded()
  }, [role, isOpen, usuario?.id])

  // Carregar cursos quando role mudar (mas só se não estivermos carregando dados iniciais)
  useEffect(() => {
    if (!isOpen || !usuario || loading) return
    
    async function loadCoursesIfNeeded() {
      if (role === "aluno") {
        try {
          // Só carregar se ainda não temos a lista
          if (courses.length === 0) {
            const list = await getCourses({ status: "active" })
            setCourses(list)
          }
          // Se não temos cursos selecionados, adicionar um campo vazio
          if (selectedCourses.length === 0) {
            setSelectedCourses([""])
          }
          // Se não temos semestre definido, definir padrão
          if (!entrySemester) {
            const now = new Date()
            const semester = now.getMonth() < 6 ? 1 : 2
            setEntrySemester(`${now.getFullYear()}-${semester}`)
          }
        } catch (err) {
          console.error("Erro ao carregar cursos:", err)
        }
      } else {
        // Limpar apenas se não for o role do usuário original
        if (role !== usuario.role) {
          setSelectedCourses([])
          setEntrySemester("")
        }
      }
    }
    loadCoursesIfNeeded()
  }, [role, isOpen, usuario?.id])

  // Sincronizar cursos selecionados quando a lista de cursos disponíveis for carregada
  // Isso garante que os cursos do aluno apareçam corretamente no Select
  useEffect(() => {
    if (!isOpen || !usuario || loading || role !== "aluno") return
    if (courses.length === 0 || currentStudentCourses.length === 0) return
    
    // Se temos cursos disponíveis e cursos do aluno, mas os selecionados não estão sincronizados
    const courseIds = currentStudentCourses.map(sc => sc.courseId)
    const validCourseIds = courseIds.filter(id => courses.some(c => c.id === id))
    
    // Só atualizar se houver diferença e se os cursos selecionados estiverem vazios ou incorretos
    const currentSelected = selectedCourses.filter(Boolean)
    const needsUpdate = validCourseIds.length > 0 && (
      currentSelected.length === 0 || 
      !validCourseIds.every(id => currentSelected.includes(id)) ||
      !currentSelected.every(id => validCourseIds.includes(id))
    )
    
    if (needsUpdate) {
      setSelectedCourses(validCourseIds.length > 0 ? validCourseIds : [])
    }
  }, [courses, currentStudentCourses, isOpen, usuario?.id, loading, role, selectedCourses])

  useEffect(() => {
    const checkTheme = () => {
      if (typeof document !== 'undefined') {
        setIsLiquidGlass(document.documentElement.classList.contains('liquid-glass'))
      }
    }
    checkTheme()

    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])

  const validarCampos = () => {
    const novosErros: Record<string, string> = {}

    if (!nome.trim()) {
      novosErros.nome = 'Nome é obrigatório'
    }

    if (!email.trim()) {
      novosErros.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      novosErros.email = 'Email inválido'
    }

    if (cpf) {
      const cpfLimpo = cpf.replace(/\D/g, "")
      if (cpfLimpo.length !== 11) {
        novosErros.cpf = 'CPF deve conter 11 dígitos'
      } else if (!validarCPF(cpf)) {
        novosErros.cpf = 'CPF inválido'
      }
    }

    if (senha) {
      const validacaoSenha = validarSenhaForte(senha)
      if (!validacaoSenha.valida) {
        novosErros.senha = validacaoSenha.requisitos.join(', ')
      } else if (senha !== confirmarSenha) {
        novosErros.confirmarSenha = 'As senhas não coincidem'
      }
    }

    // Validações específicas para aluno
    if (role === "aluno") {
      const toLinkPreview = Array.from(new Set(selectedCourses.filter(Boolean)))
      // Se houver cursos selecionados, validar o semestre
      if (toLinkPreview.length > 0) {
        if (!entrySemester || !validarEntrySemester(entrySemester)) {
          novosErros.entrySemester = "Use o formato 'YYYY-1' ou 'YYYY-2'"
        }
      }
    }

    setErrors(novosErros)
    return Object.keys(novosErros).length === 0
  }

  const handleSalvar = async () => {
    if (!usuario || !validarCampos()) return

    // Verificar email único se mudou
    if (email.trim() !== usuario.email.trim()) {
      try {
        const emailExiste = await usuariosService.verificarEmailExistente(email.trim())
        if (emailExiste) {
          toast({
            variant: 'error',
            title: 'Email já cadastrado',
            description: 'Já existe um usuário com este email no sistema.',
          })
          return
        }
      } catch (err: any) {
        console.error("Erro ao verificar email:", err)
      }
    }

    setLoading(true)
    try {
      const cpfDigits = cpf.replace(/\D/g, "")
      const updateData: any = {
        nome: nome.trim(),
        email: email.trim(),
        usuario: usuarioLogin.trim() || undefined,
        telefone: telefone.trim() || undefined,
        cpf: cpfDigits || undefined,
        role,
        status
      }

      if (senha) {
        updateData.senha = senha
      }

      const usuarioAtualizado = await usuariosService.atualizar(usuario.id, updateData)

      // Gerenciar vínculos por role
      if (role === "aluno") {
        const toLink = Array.from(new Set(selectedCourses.filter(Boolean)))
        const currentCourseIds = currentStudentCourses.map(sc => sc.courseId)
        
        // Remover cursos que não estão mais selecionados
        const toRemove = currentCourseIds.filter(id => !toLink.includes(id))
        if (toRemove.length > 0) {
          for (const courseId of toRemove) {
            try {
              await removeStudentCourse(usuario.id, courseId)
            } catch (err: any) {
              console.error("Erro ao remover vínculo aluno-curso:", err)
              // Se o endpoint não existir, informar ao usuário
              if (err?.response?.status === 404 || err?.message?.includes('endpoint')) {
                toast({
                  variant: 'warning',
                  title: 'Funcionalidade não disponível',
                  description: 'A remoção de cursos requer atualização do servidor. Os cursos selecionados foram adicionados, mas os antigos não foram removidos.'
                })
                // Não continuar tentando remover os outros se o endpoint não existe
                break
              } else {
                // Outro tipo de erro, continuar tentando
                toast({
                  variant: 'warning',
                  title: 'Aviso',
                  description: `Não foi possível remover o vínculo com um dos cursos.`
                })
              }
            }
          }
        }
        
        // Adicionar novos cursos
        const toAdd = toLink.filter(id => !currentCourseIds.includes(id))
        if (toAdd.length > 0) {
          try {
            await linkStudentToCourses(usuario.id, toAdd, entrySemester)
          } catch (err: any) {
            // Se o curso já estiver vinculado, o backend retornará erro de conflito
            // Isso é esperado e pode ser ignorado
            if (err?.response?.status !== 409) {
              console.error("Erro ao vincular aluno aos cursos:", err)
              throw err
            }
          }
        }
      } else if (role === "professor") {
        const toLink = Array.from(new Set(selectedDepartments.filter(Boolean)))
        const currentDeptIds = currentUserDepartments.map(d => d.id)
        
        // Remover de departamentos não mais selecionados
        const toRemove = currentDeptIds.filter(id => !toLink.includes(id))
        for (const deptId of toRemove) {
          try {
            await removeTeacherFromDepartment(deptId, usuario.id)
          } catch (err) {
            console.error("Erro ao remover professor do departamento:", err)
          }
        }

        // Adicionar a novos departamentos
        const toAdd = toLink.filter(id => !currentDeptIds.includes(id))
        for (const deptId of toAdd) {
          try {
            await addTeachersToDepartment(deptId, [usuario.id])
          } catch (err) {
            console.error("Erro ao adicionar professor ao departamento:", err)
          }
        }
      } else if (role === "coordenador") {
        const newDeptId = selectedCoordinatorDept || null
        const currentDeptId = currentCoordinatorDept?.id || null

        if (newDeptId !== currentDeptId) {
          // Remover do departamento anterior
          if (currentDeptId) {
            try {
              await setDepartmentCoordinator(currentDeptId, null)
            } catch (err) {
              console.error("Erro ao remover coordenador do departamento:", err)
            }
          }

          // Definir no novo departamento
          if (newDeptId) {
            try {
              await setDepartmentCoordinator(newDeptId, usuario.id)
            } catch (err) {
              console.error("Erro ao definir coordenador do departamento:", err)
            }
          }
        }
      }

      onSalvar(usuarioAtualizado)
      toast({ 
        variant: 'success',
        title: "Sucesso", 
        description: `"${nome}" atualizado com sucesso!` 
      })
      onClose()
    } catch (err: any) {
      console.error("Erro ao salvar:", err)
      toast({
        variant: 'error',
        title: 'Erro ao atualizar usuário',
        description: err.message || "Não foi possível atualizar o usuário."
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setErrors({})
    setCpfError(null)
    setEntrySemesterError(null)
    setSelectedDepartments([])
    setSelectedCoordinatorDept("")
    setSelectedCourses([])
    setEntrySemester("")
    setCurrentUserDepartments([])
    setCurrentCoordinatorDept(null)
    setCurrentStudentCourses([])
    onClose()
  }

  if (!usuario) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-bold">Editar Usuário</DialogTitle>
          <DialogDescription>
            Atualize as informações do usuário
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto relative">
          {loading && nome === '' ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Carregando dados do usuário...</p>
              </div>
            </div>
          ) : null}
          
          <form id="edit-user-form" onSubmit={(e) => { e.preventDefault(); handleSalvar(); }} className="space-y-6 pr-1">
            {loading && nome === '' ? (
              // Skeleton loaders enquanto carrega
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome *</Label>
                    <Input
                      id="nome"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className={errors.nome ? 'border-destructive' : ''}
                    />
                    {errors.nome && (
                      <p className="text-sm text-destructive mt-1">{errors.nome}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={errors.email ? 'border-destructive' : ''}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="usuario">Usuário (login)</Label>
                    <Input
                      id="usuario"
                      value={usuarioLogin}
                      onChange={(e) => setUsuarioLogin(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      value={cpf}
                      onChange={(e) => handleCpfChange(e.target.value)}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      className={cpfError || errors.cpf ? 'border-destructive' : ''}
                    />
                    {(cpfError || errors.cpf) && (
                      <p className="text-sm text-destructive mt-1">{cpfError || errors.cpf}</p>
                    )}
                  </div>

                  <div>
                    <Label>Papel</Label>
                    <Select value={role} onValueChange={(v) => setRole(v as RoleType)}>
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

                  <div>
                    <Label>Status</Label>
                    <Select value={status} onValueChange={(v) => setStatus(v as "Ativo" | "Inativo")}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ativo">Ativo</SelectItem>
                        <SelectItem value="Inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Seção para Alunos */}
                {role === "aluno" && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="space-y-2">
                      <Label>Cursos do aluno (adicione quantos precisar)</Label>
                      <div className="space-y-2">
                        {selectedCourses.length === 0 && (
                          <p className="text-sm text-muted-foreground">Clique em "Adicionar curso".</p>
                        )}
                        {selectedCourses.map((value, index) => {
                          const used = new Set(selectedCourses.filter((_, i) => i !== index && selectedCourses[i]))
                          const available = courses.filter(c => !used.has(c.id))
                          const isExistingCourse = value && currentStudentCourses.some(sc => sc.courseId === value)
                          const courseName = value ? courses.find(c => c.id === value)?.name : null
                          return (
                            <div key={index} className="flex items-center gap-2">
                              <Select value={value} onValueChange={(v) => editCourseCombo(index, v)}>
                                <SelectTrigger className={`w-full ${isExistingCourse ? 'border-green-500' : ''}`}>
                                  <SelectValue placeholder="Selecione o curso" />
                                </SelectTrigger>
                                <SelectContent>
                                  {available.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => removeCourseCombo(index)}
                                className="flex-shrink-0"
                              >
                                Remover
                              </Button>
                              {isExistingCourse && (
                                <span className="text-xs text-green-600 dark:text-green-400 flex-shrink-0">
                                  (Existente)
                                </span>
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
                      {errors.cursos && (
                        <p className="text-sm text-destructive">{errors.cursos}</p>
                      )}
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
                          setEntrySemesterError(v ? (validarEntrySemester(v) ? null : "Use o formato YYYY-1 ou YYYY-2") : null)
                        }}
                        className={entrySemesterError || errors.entrySemester ? "border-red-500" : ""}
                      />
                      {(entrySemesterError || errors.entrySemester) && (
                        <p className="text-sm text-red-500">{entrySemesterError || errors.entrySemester}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Seção para Professores */}
                {role === "professor" && (
                  <div className="space-y-2 border-t pt-4">
                    <Label>Departamentos (adicione quantos precisar)</Label>
                    <div className="space-y-2">
                      {selectedDepartments.length === 0 && (
                        <p className="text-sm text-muted-foreground">Clique em "Adicionar departamento".</p>
                      )}
                      {selectedDepartments.map((value, index) => {
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

                {/* Seção para Coordenadores */}
                {role === "coordenador" && (
                  <div className="space-y-2 border-t pt-4">
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

                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium mb-4">Alterar Senha (opcional)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="senha">Nova Senha</Label>
                      <div className="relative">
                        <Input
                          id="senha"
                          type={showPassword ? "text" : "password"}
                          value={senha}
                          onChange={(e) => setSenha(e.target.value)}
                          className={errors.senha ? 'border-destructive pr-10' : 'pr-10'}
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
                      {errors.senha && (
                        <p className="text-sm text-destructive mt-1">{errors.senha}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
                      <div className="relative">
                        <Input
                          id="confirmarSenha"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmarSenha}
                          onChange={(e) => setConfirmarSenha(e.target.value)}
                          className={errors.confirmarSenha ? 'border-destructive pr-10' : 'pr-10'}
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
                      {errors.confirmarSenha && (
                        <p className="text-sm text-destructive mt-1">{errors.confirmarSenha}</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </form>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <LiquidGlassButton onClick={handleSalvar} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Salvando..." : "Salvar Alterações"}
          </LiquidGlassButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}
