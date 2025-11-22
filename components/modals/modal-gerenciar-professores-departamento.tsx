"use client"

import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Department, Teacher } from "@/src/services/departmentsService"
import { UserX, X, Mail, ChevronLeft, ChevronRight } from "lucide-react"

const TEACHERS_PER_PAGE = 5

interface Usuario {
  id: string
  nome: string
  email: string
}

interface ModalGerenciarProfessoresDepartamentoProps {
  isOpen: boolean
  onClose: () => void
  department: Department | null
  departmentTeachers: Teacher[]
  availableTeachers: Usuario[]
  onAddTeachers: (userIds: string[]) => void
  onRemoveTeacher: (userId: string, teacherName: string) => void
  isAddingPending?: boolean
  isRemovingPending?: boolean
}

export function ModalGerenciarProfessoresDepartamento({
  isOpen,
  onClose,
  department,
  departmentTeachers,
  availableTeachers,
  onAddTeachers,
  onRemoveTeacher,
  isAddingPending = false,
  isRemovingPending = false,
}: ModalGerenciarProfessoresDepartamentoProps) {
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>([])
  const [selectValue, setSelectValue] = useState<string>("")
  const [teachersPage, setTeachersPage] = useState(1)

  // Paginação de professores vinculados
  const paginatedTeachers = useMemo(() => {
    const start = (teachersPage - 1) * TEACHERS_PER_PAGE
    const end = start + TEACHERS_PER_PAGE
    return departmentTeachers.slice(start, end)
  }, [departmentTeachers, teachersPage])

  const totalTeachersPages = useMemo(
    () => Math.max(1, Math.ceil(departmentTeachers.length / TEACHERS_PER_PAGE)),
    [departmentTeachers.length]
  )

  useEffect(() => {
    if (!isOpen) {
      setSelectedTeacherIds([])
      setSelectValue("")
      setTeachersPage(1)
    }
  }, [isOpen])

  // Ajustar página se necessário quando os dados mudarem
  useEffect(() => {
    if (teachersPage > totalTeachersPages && totalTeachersPages > 0) {
      setTeachersPage(totalTeachersPages)
    }
    // Se a lista de professores mudou (adicionou/removeu), ajustar página se necessário
    if (departmentTeachers.length > 0 && teachersPage < 1) {
      setTeachersPage(1)
    }
  }, [teachersPage, totalTeachersPages, departmentTeachers.length])

  const handleAddTeachers = () => {
    if (selectedTeacherIds.length === 0) {
      return
    }
    onAddTeachers(selectedTeacherIds)
    setSelectedTeacherIds([])
  }

  const handleSelectTeacher = (value: string) => {
    if (value && value !== "" && !selectedTeacherIds.includes(value)) {
      setSelectedTeacherIds([...selectedTeacherIds, value])
      setSelectValue("")
    }
  }

  const handleRemoveSelectedTeacher = (teacherId: string) => {
    setSelectedTeacherIds(selectedTeacherIds.filter((id) => id !== teacherId))
  }

  const handleRemoveTeacher = (teacherId: string, teacherName: string) => {
    onRemoveTeacher(teacherId, teacherName)
  }

  if (!department) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Professores - {department.name}</DialogTitle>
          <DialogDescription>Adicione ou remova professores do departamento</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Adicionar Professores */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Adicionar Professores</Label>
            {availableTeachers.length > 0 ? (
              <Select 
                value={selectValue === "" ? undefined : selectValue} 
                onValueChange={handleSelectTeacher}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um professor para adicionar" />
                </SelectTrigger>
                <SelectContent>
                  {availableTeachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.nome} ({teacher.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum professor disponível para adicionar</p>
            )}
            {selectedTeacherIds.length > 0 && (
              <div className="space-y-2">
                <Label>Professores selecionados para adicionar:</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedTeacherIds.map((teacherId) => {
                    const teacher = availableTeachers.find((t) => t.id === teacherId)
                    return (
                      <Badge
                        key={teacherId}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {teacher?.nome}
                        <button
                          onClick={() => handleRemoveSelectedTeacher(teacherId)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )
                  })}
                </div>
                <Button
                  onClick={handleAddTeachers}
                  disabled={isAddingPending}
                  size="sm"
                >
                  Adicionar {selectedTeacherIds.length} professor(es)
                </Button>
              </div>
            )}
          </div>

          {/* Lista de Professores Vinculados */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              Professores Vinculados ({departmentTeachers.length})
            </Label>
            {departmentTeachers.length > 0 ? (
              <>
                <div className="space-y-2">
                  {paginatedTeachers.map((teacher) => (
                    <Card key={teacher.id}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-sm">{teacher.name}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {teacher.email}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveTeacher(teacher.id, teacher.name)}
                            disabled={isRemovingPending}
                          >
                            <UserX className="w-4 h-4 mr-2" />
                            Remover
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {/* Paginação Professores */}
                {totalTeachersPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={teachersPage <= 1}
                      onClick={() => setTeachersPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Anterior
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      Página {teachersPage} de {totalTeachersPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={teachersPage >= totalTeachersPages}
                      onClick={() => setTeachersPage((p) => Math.min(totalTeachersPages, p + 1))}
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum professor vinculado</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

