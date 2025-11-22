"use client"

import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Department, Teacher } from "@/src/services/departmentsService"
import { Edit, Users, BookOpen, Mail, UserX, ChevronLeft, ChevronRight } from "lucide-react"
import { BackendCourse } from "@/src/services/coursesService"

const COURSES_PER_PAGE = 5
const TEACHERS_PER_PAGE = 10

interface Usuario {
  id: string
  nome: string
  email: string
}

interface ModalDetalhesDepartamentoProps {
  isOpen: boolean
  onClose: () => void
  department: Department | null
  coordenadores: Usuario[]
  departmentTeachers: Teacher[]
  courses: BackendCourse[]
  onEdit: (department: Department) => void
  onManageTeachers: (department: Department) => void
  onSetCoordinator: (coordinatorId: string | null) => void
  onRemoveCoordinator: () => void
  isPending?: boolean
}

export function ModalDetalhesDepartamento({
  isOpen,
  onClose,
  department,
  coordenadores,
  departmentTeachers,
  courses,
  onEdit,
  onManageTeachers,
  onSetCoordinator,
  onRemoveCoordinator,
  isPending = false,
}: ModalDetalhesDepartamentoProps) {
  // Estados de paginação
  const [coursesPage, setCoursesPage] = useState(1)
  const [teachersPage, setTeachersPage] = useState(1)

  // Obter cursos vinculados ao departamento
  const departmentCourses = useMemo(() => {
    if (!department) return []
    return courses.filter((c) => c.department?.id === department.id)
  }, [courses, department])

  // Paginação de cursos
  const paginatedCourses = useMemo(() => {
    const start = (coursesPage - 1) * COURSES_PER_PAGE
    const end = start + COURSES_PER_PAGE
    return departmentCourses.slice(start, end)
  }, [departmentCourses, coursesPage])

  const totalCoursesPages = useMemo(
    () => Math.max(1, Math.ceil(departmentCourses.length / COURSES_PER_PAGE)),
    [departmentCourses.length]
  )

  // Paginação de professores
  const paginatedTeachers = useMemo(() => {
    const start = (teachersPage - 1) * TEACHERS_PER_PAGE
    const end = start + TEACHERS_PER_PAGE
    return departmentTeachers.slice(start, end)
  }, [departmentTeachers, teachersPage])

  const totalTeachersPages = useMemo(
    () => Math.max(1, Math.ceil(departmentTeachers.length / TEACHERS_PER_PAGE)),
    [departmentTeachers.length]
  )

  // Resetar páginas quando o modal abrir ou o departamento mudar
  useEffect(() => {
    if (isOpen) {
      setCoursesPage(1)
      setTeachersPage(1)
    }
  }, [isOpen, department?.id])

  // Ajustar página se necessário quando os dados mudarem
  useEffect(() => {
    if (coursesPage > totalCoursesPages && totalCoursesPages > 0) {
      setCoursesPage(totalCoursesPages)
    }
  }, [coursesPage, totalCoursesPages])

  useEffect(() => {
    if (teachersPage > totalTeachersPages && totalTeachersPages > 0) {
      setTeachersPage(totalTeachersPages)
    }
  }, [teachersPage, totalTeachersPages])

  if (!department) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{department.name}</DialogTitle>
          <DialogDescription>Detalhes do departamento</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Coordenador */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Coordenador</Label>
              <div className="flex gap-2">
                <Select
                  value={department.coordinator?.id || undefined}
                  onValueChange={(v) => onSetCoordinator(v === "none" ? null : v)}
                  disabled={isPending}
                >
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Selecione um coordenador" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Remover coordenador</SelectItem>
                    {coordenadores.map((coord) => (
                      <SelectItem key={coord.id} value={coord.id}>
                        {coord.nome} ({coord.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {department.coordinator && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRemoveCoordinator}
                    disabled={isPending}
                  >
                    <UserX className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
            {department.coordinator ? (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">{department.coordinator.name}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {department.coordinator.email}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum coordenador atribuído</p>
            )}
          </div>

          {/* Professores */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                Professores ({departmentTeachers.length})
              </Label>
              <Button variant="outline" size="sm" onClick={() => onManageTeachers(department)}>
                <Users className="w-4 h-4 mr-2" />
                Gerenciar Professores
              </Button>
            </div>
            {departmentTeachers.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

          {/* Cursos */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Cursos ({departmentCourses.length})</Label>
            {departmentCourses.length > 0 ? (
              <>
                <div className="space-y-2">
                  {paginatedCourses.map((course) => (
                    <Card key={course.id}>
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="font-semibold text-sm">{course.name}</p>
                            {course.code && (
                              <p className="text-xs text-muted-foreground">Código: {course.code}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {/* Paginação Cursos */}
                {totalCoursesPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={coursesPage <= 1}
                      onClick={() => setCoursesPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Anterior
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      Página {coursesPage} de {totalCoursesPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={coursesPage >= totalCoursesPages}
                      onClick={() => setCoursesPage((p) => Math.min(totalCoursesPages, p + 1))}
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum curso vinculado</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button
            onClick={() => {
              onClose()
              onEdit(department)
            }}
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

