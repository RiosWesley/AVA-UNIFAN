"use client"

import { useEffect, useMemo, useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Plus, Edit, Trash2, Eye, Users, BookOpen, ChevronLeft, ChevronRight } from "lucide-react"

const DEPARTMENTS_PER_PAGE = 5
import { ModalDepartamento } from "@/components/modals/modal-departamento"
import { ModalDetalhesDepartamento } from "@/components/modals/modal-detalhes-departamento"
import { ModalGerenciarProfessoresDepartamento } from "@/components/modals/modal-gerenciar-professores-departamento"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Department,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartments,
  getDepartment,
  getDepartmentTeachers,
  addTeachersToDepartment,
  removeTeacherFromDepartment,
  setDepartmentCoordinator,
  CreateDepartmentDto,
  UpdateDepartmentDto,
  Teacher,
} from "@/src/services/departmentsService"
import { getCourses } from "@/src/services/coursesService"
import { usuariosService } from "@/src/services/usuariosService"
import { PageSpinner } from "@/components/ui/page-spinner"
import { toast } from "@/components/ui/toast"

export default function DepartamentosAdministradorPage() {
  const queryClient = useQueryClient()

  // Estados da UI
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isManageTeachersModalOpen, setIsManageTeachersModalOpen] = useState(false)
  const [departmentTeachers, setDepartmentTeachers] = useState<Teacher[]>([])
  const [availableTeachers, setAvailableTeachers] = useState<any[]>([])

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)
    return () => clearTimeout(handler)
  }, [search])

  // Resetar página quando a busca mudar
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch])

  // Buscar departamentos
  const { data: departamentos = [], isLoading: isLoadingDepartamentos } = useQuery({
    queryKey: ['departamentos', debouncedSearch],
    queryFn: async () => {
      const departments = await getDepartments()
      // Buscar professores para cada departamento
      const departmentsWithTeachers = await Promise.all(
        departments.map(async (dept) => {
          try {
            const teachers = await getDepartmentTeachers(dept.id)
            return { ...dept, teachers }
          } catch (error) {
            console.error(`Erro ao buscar professores do departamento ${dept.id}:`, error)
            return { ...dept, teachers: [] }
          }
        })
      )
      return departmentsWithTeachers
    },
    placeholderData: keepPreviousData,
  })

  // Filtrar departamentos localmente com base na busca
  const filteredDepartamentos = useMemo(() => {
    if (!debouncedSearch.trim()) return departamentos
    const searchLower = debouncedSearch.toLowerCase()
    return departamentos.filter(
      (dept) =>
        dept.name.toLowerCase().includes(searchLower) ||
        dept.coordinator?.name.toLowerCase().includes(searchLower) ||
        dept.coordinator?.email.toLowerCase().includes(searchLower)
    )
  }, [departamentos, debouncedSearch])

  // Paginação de departamentos
  const paginatedDepartamentos = useMemo(() => {
    const start = (currentPage - 1) * DEPARTMENTS_PER_PAGE
    const end = start + DEPARTMENTS_PER_PAGE
    return filteredDepartamentos.slice(start, end)
  }, [filteredDepartamentos, currentPage])

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredDepartamentos.length / DEPARTMENTS_PER_PAGE)),
    [filteredDepartamentos.length]
  )

  // Ajustar página se necessário quando os dados mudarem
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  // Buscar coordenadores disponíveis
  const { data: coordenadoresResponse } = useQuery({
    queryKey: ['coordenadores'],
    queryFn: () => usuariosService.listar(1, 1000, "coordenador"),
    enabled: isModalOpen || isViewModalOpen,
  })

  const coordenadores = coordenadoresResponse?.data || []

  // Buscar professores disponíveis
  const { data: professoresResponse } = useQuery({
    queryKey: ['professores-disponiveis'],
    queryFn: () => usuariosService.listar(1, 1000, "professor"),
    enabled: isManageTeachersModalOpen,
  })

  // Buscar cursos para estatísticas
  const { data: cursos = [] } = useQuery({
    queryKey: ['cursos'],
    queryFn: () => getCourses({}),
  })

  // Carregar professores do departamento quando abrir modal de gerenciamento
  useEffect(() => {
    if (isManageTeachersModalOpen && selectedDepartment) {
      getDepartmentTeachers(selectedDepartment.id)
        .then(setDepartmentTeachers)
        .catch((error) => {
          console.error("Erro ao carregar professores:", error)
          toast({
            variant: "error",
            title: "Erro",
            description: "Não foi possível carregar os professores do departamento.",
          })
        })
    }
  }, [isManageTeachersModalOpen, selectedDepartment])

  // Carregar professores disponíveis
  useEffect(() => {
    if (isManageTeachersModalOpen && professoresResponse) {
      const allTeachers = professoresResponse.data || []
      const linkedTeacherIds = new Set(departmentTeachers.map((t) => t.id))
      const available = allTeachers.filter((t) => !linkedTeacherIds.has(t.id))
      setAvailableTeachers(available)
    }
  }, [isManageTeachersModalOpen, professoresResponse, departmentTeachers])

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: CreateDepartmentDto) => createDepartment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departamentos'] })
      toast({
        variant: "success",
        title: "Sucesso",
        description: "Departamento criado com sucesso!",
      })
      handleCloseModal()
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || "Não foi possível criar o departamento."
      toast({
        variant: "error",
        title: "Erro",
        description: message,
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDepartmentDto }) => updateDepartment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departamentos'] })
      toast({
        variant: "success",
        title: "Sucesso",
        description: "Departamento atualizado com sucesso!",
      })
      handleCloseModal()
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || "Não foi possível atualizar o departamento."
      toast({
        variant: "error",
        title: "Erro",
        description: message,
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departamentos'] })
      toast({
        variant: "success",
        title: "Sucesso",
        description: "Departamento excluído com sucesso!",
      })
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || "Não foi possível excluir o departamento."
      toast({
        variant: "error",
        title: "Erro",
        description: message,
      })
    },
  })

  const setCoordinatorMutation = useMutation({
    mutationFn: ({ id, coordinatorId }: { id: string; coordinatorId: string | null }) =>
      setDepartmentCoordinator(id, coordinatorId),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['departamentos'] })
      if (isViewModalOpen && selectedDepartment) {
        const updated = await getDepartment(selectedDepartment.id)
        setSelectedDepartment(updated)
      }
      toast({
        variant: "success",
        title: "Sucesso",
        description: "Coordenador atualizado com sucesso!",
      })
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || "Não foi possível atualizar o coordenador."
      toast({
        variant: "error",
        title: "Erro",
        description: message,
      })
    },
  })

  const addTeachersMutation = useMutation({
    mutationFn: ({ id, userIds }: { id: string; userIds: string[] }) => addTeachersToDepartment(id, userIds),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['departamentos'] })
      if (selectedDepartment) {
        const teachers = await getDepartmentTeachers(selectedDepartment.id)
        setDepartmentTeachers(teachers)
        // Atualizar selectedDepartment se o modal de detalhes estiver aberto
        if (isViewModalOpen) {
          const updated = await getDepartment(selectedDepartment.id)
          setSelectedDepartment(updated)
        }
      }
      toast({
        variant: "success",
        title: "Sucesso",
        description: "Professor(es) adicionado(s) com sucesso!",
      })
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || "Não foi possível adicionar os professores."
      toast({
        variant: "error",
        title: "Erro",
        description: message,
      })
    },
  })

  const removeTeacherMutation = useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) => removeTeacherFromDepartment(id, userId),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['departamentos'] })
      if (selectedDepartment) {
        const teachers = await getDepartmentTeachers(selectedDepartment.id)
        setDepartmentTeachers(teachers)
        // Atualizar selectedDepartment se o modal de detalhes estiver aberto
        if (isViewModalOpen) {
          const updated = await getDepartment(selectedDepartment.id)
          setSelectedDepartment(updated)
        }
      }
      toast({
        variant: "success",
        title: "Sucesso",
        description: "Professor removido com sucesso!",
      })
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || "Não foi possível remover o professor."
      toast({
        variant: "error",
        title: "Erro",
        description: message,
      })
    },
  })

  // Estatísticas (usando todos os departamentos filtrados, não apenas os paginados)
  const estatisticas = useMemo(() => {
    const total = filteredDepartamentos.length
    const comCoordenador = filteredDepartamentos.filter((d) => d.coordinator).length
    const totalProfessores = new Set(
      filteredDepartamentos.flatMap((d) => d.teachers?.map((t) => t.id) || [])
    ).size

    return {
      total,
      comCoordenador,
      totalProfessores,
    }
  }, [filteredDepartamentos])

  // Handlers
  const handleSaveDepartment = (payload: CreateDepartmentDto | UpdateDepartmentDto, isEdit: boolean) => {
    if (isEdit && selectedDepartment) {
      updateMutation.mutate({ id: selectedDepartment.id, data: payload })
    } else {
      createMutation.mutate(payload as CreateDepartmentDto)
    }
  }

  const handleEdit = (departamento: Department) => {
    setSelectedDepartment(departamento)
    setIsEditMode(true)
    setIsModalOpen(true)
  }

  const handleDelete = (departamento: Department) => {
    if (confirm(`Tem certeza que deseja excluir o departamento "${departamento.name}"?`)) {
      deleteMutation.mutate(departamento.id)
    }
  }

  const handleView = async (departamento: Department) => {
    try {
      const fullDepartment = await getDepartment(departamento.id)
      setSelectedDepartment(fullDepartment)
      // Carregar professores do departamento
      const teachers = await getDepartmentTeachers(departamento.id)
      setDepartmentTeachers(teachers)
      setIsViewModalOpen(true)
    } catch (error: any) {
      toast({
        variant: "error",
        title: "Erro",
        description: "Não foi possível carregar os detalhes do departamento.",
      })
    }
  }

  const handleManageTeachers = async (departamento: Department) => {
    setSelectedDepartment(departamento)
    try {
      const teachers = await getDepartmentTeachers(departamento.id)
      setDepartmentTeachers(teachers)
      setIsManageTeachersModalOpen(true)
    } catch (error: any) {
      toast({
        variant: "error",
        title: "Erro",
        description: "Não foi possível carregar os professores do departamento.",
      })
    }
  }

  function handleOpenModal() {
    setSelectedDepartment(null)
    setIsEditMode(false)
    setIsModalOpen(true)
  }

  function handleCloseModal() {
    setIsModalOpen(false)
    setSelectedDepartment(null)
    setIsEditMode(false)
  }

  const handleAddTeachers = (userIds: string[]) => {
    if (userIds.length === 0) {
      toast({
        variant: "warning",
        title: "Atenção",
        description: "Selecione pelo menos um professor para adicionar.",
      })
      return
    }
    if (selectedDepartment) {
      addTeachersMutation.mutate({ id: selectedDepartment.id, userIds })
    }
  }

  const handleRemoveTeacher = (teacherId: string, teacherName: string) => {
    if (confirm(`Tem certeza que deseja remover o professor "${teacherName}" do departamento?`)) {
      if (selectedDepartment) {
        removeTeacherMutation.mutate({ id: selectedDepartment.id, userId: teacherId })
      }
    }
  }

  const handleSetCoordinator = (coordinatorId: string | null) => {
    if (selectedDepartment) {
      setCoordinatorMutation.mutate({ id: selectedDepartment.id, coordinatorId })
    }
  }

  const handleRemoveCoordinator = () => {
    if (confirm("Tem certeza que deseja remover o coordenador deste departamento?")) {
      handleSetCoordinator(null)
    }
  }


  if (isLoadingDepartamentos) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar userRole="administrador" />
        <main className="flex-1 overflow-y-auto">
          <PageSpinner />
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="administrador" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Gestão de Departamentos</h1>
              <p className="text-muted-foreground">Cadastrar, listar, buscar e gerenciar departamentos</p>
            </div>
            <Button onClick={handleOpenModal}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Departamento
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Departamentos</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estatisticas.total}</div>
                <p className="text-xs text-muted-foreground">Departamentos cadastrados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Com Coordenador</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estatisticas.comCoordenador}</div>
                <p className="text-xs text-muted-foreground">Departamentos com coordenador</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Professores</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estatisticas.totalProfessores}</div>
                <p className="text-xs text-muted-foreground">Professores vinculados</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Departamentos
              </CardTitle>
              <CardDescription>Gerencie os departamentos do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Pesquisar por nome ou coordenador..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                {paginatedDepartamentos.map((departamento) => {
                  const cursosCount = cursos.filter((c) => c.department?.id === departamento.id).length
                  const professoresCount = departamento.teachers?.length || 0

                  return (
                    <Card key={departamento.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-lg">{departamento.name}</h3>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {departamento.coordinator ? (
                                <span className="flex items-center gap-1">
                                  <Users className="w-3.5 h-3.5" />
                                  Coordenador: {departamento.coordinator.name}
                                </span>
                              ) : (
                                <Badge variant="secondary">Sem coordenador</Badge>
                              )}
                              <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" />
                                {professoresCount} professor(es)
                              </span>
                              <span className="flex items-center gap-1">
                                <BookOpen className="w-3.5 h-3.5" />
                                {cursosCount} curso(s)
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleView(departamento)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleEdit(departamento)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(departamento)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
                {filteredDepartamentos.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhum departamento encontrado.
                  </p>
                )}
              </div>
              
              {/* Paginação */}
              {filteredDepartamentos.length > 0 && totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Próxima
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modal de Criar/Editar Departamento */}
      <ModalDepartamento
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveDepartment}
        department={selectedDepartment}
        coordenadores={coordenadores}
        isEditMode={isEditMode}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      {/* Modal de Detalhes do Departamento */}
      <ModalDetalhesDepartamento
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        department={selectedDepartment}
        coordenadores={coordenadores}
        departmentTeachers={departmentTeachers}
        courses={cursos}
        onEdit={handleEdit}
        onManageTeachers={handleManageTeachers}
        onSetCoordinator={handleSetCoordinator}
        onRemoveCoordinator={handleRemoveCoordinator}
        isPending={setCoordinatorMutation.isPending}
      />

      {/* Modal de Gerenciar Professores */}
      <ModalGerenciarProfessoresDepartamento
        isOpen={isManageTeachersModalOpen}
        onClose={() => setIsManageTeachersModalOpen(false)}
        department={selectedDepartment}
        departmentTeachers={departmentTeachers}
        availableTeachers={availableTeachers}
        onAddTeachers={handleAddTeachers}
        onRemoveTeacher={handleRemoveTeacher}
        isAddingPending={addTeachersMutation.isPending}
        isRemovingPending={removeTeacherMutation.isPending}
      />
    </div>
  )
}

