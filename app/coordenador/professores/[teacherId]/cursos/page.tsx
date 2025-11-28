"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GraduationCap, Plus, Trash2, ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { getTeacherCourses, createTeacherCourse, deleteTeacherCourse, type TeacherCourse } from "@/src/services/teacher-courses-service"
import { getCourses, type BackendCourse } from "@/src/services/coursesService"
import { getCurrentUser } from "@/src/services/professor-dashboard"
import { getDepartments } from "@/src/services/departmentsService"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProfessorCursosPage() {
  const router = useRouter()
  const params = useParams()
  const teacherId = params.teacherId as string

  const [teacherCourses, setTeacherCourses] = useState<TeacherCourse[]>([])
  const [availableCourses, setAvailableCourses] = useState<BackendCourse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCourseId, setSelectedCourseId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [coordinatorId, setCoordinatorId] = useState<string | null>(null)
  const [departmentId, setDepartmentId] = useState<string | null>(null)

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
          
          const departments = await getDepartments(user.id)
          if (departments.length > 0) {
            setDepartmentId(departments[0].id)
          }
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
    const loadData = async () => {
      if (!teacherId || !departmentId) return

      try {
        setIsLoading(true)
        const [courses, teacherCoursesData] = await Promise.all([
          getCourses({ departmentId, status: 'active' }),
          getTeacherCourses(teacherId)
        ])

        setTeacherCourses(teacherCoursesData)
        
        const linkedCourseIds = new Set(teacherCoursesData.map(tc => tc.course.id))
        const available = courses.filter(c => !linkedCourseIds.has(c.id))
        setAvailableCourses(available)
      } catch (error: any) {
        console.error("Erro ao carregar dados:", error)
        toast.error("Erro ao carregar cursos", {
          description: error.message || "Tente novamente"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [teacherId, departmentId])

  const handleAddCourse = async () => {
    if (!selectedCourseId) {
      toast.error("Selecione um curso")
      return
    }

    try {
      setIsSubmitting(true)
      const newTeacherCourse = await createTeacherCourse({
        teacherId,
        courseId: selectedCourseId
      })

      setTeacherCourses([...teacherCourses, newTeacherCourse])
      
      const linkedCourseIds = new Set([...teacherCourses, newTeacherCourse].map(tc => tc.course.id))
      const available = availableCourses.filter(c => !linkedCourseIds.has(c.id))
      setAvailableCourses(available)
      
      setSelectedCourseId("")
      setIsModalOpen(false)
      
      toast.success("Curso vinculado com sucesso!")
    } catch (error: any) {
      console.error("Erro ao vincular curso:", error)
      toast.error("Erro ao vincular curso", {
        description: error.response?.data?.message || "Tente novamente"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveCourse = async (teacherCourseId: string) => {
    if (!confirm("Tem certeza que deseja remover este curso do professor?")) {
      return
    }

    try {
      setIsLoading(true)
      await deleteTeacherCourse(teacherCourseId)
      
      const removed = teacherCourses.find(tc => tc.id === teacherCourseId)
      setTeacherCourses(teacherCourses.filter(tc => tc.id !== teacherCourseId))
      
      if (removed) {
        const course = availableCourses.find(c => c.id === removed.course.id) || 
          await getCourses({ departmentId: departmentId || undefined, status: 'active' }).then(courses => 
            courses.find(c => c.id === removed.course.id)
          )
        
        if (course) {
          setAvailableCourses([...availableCourses, course])
        }
      }
      
      toast.success("Curso removido com sucesso!")
    } catch (error: any) {
      console.error("Erro ao remover curso:", error)
      toast.error("Erro ao remover curso", {
        description: error.response?.data?.message || "Tente novamente"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && teacherCourses.length === 0) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar userRole="coordenador" />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <Skeleton className="h-10 w-64 mb-6" />
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="coordenador" />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/coordenador/professores")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Gerenciar Cursos do Professor</h1>
                <p className="text-muted-foreground mt-1">
                  Gerencie os cursos vinculados a este professor
                </p>
              </div>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Curso
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Cursos Vinculados
              </CardTitle>
              <CardDescription>
                Lista de cursos aos quais este professor está vinculado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {teacherCourses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum curso vinculado</p>
                  <p className="text-sm mt-2">Clique em "Adicionar Curso" para vincular um curso</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {teacherCourses.map((tc) => (
                    <div
                      key={tc.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{tc.course.name}</h3>
                          <Badge variant="outline">{tc.course.code}</Badge>
                        </div>
                        {tc.course.department && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Departamento: {tc.course.department.name}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Vinculado em {new Date(tc.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCourse(tc.id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Curso</DialogTitle>
                <DialogDescription>
                  Selecione um curso para vincular ao professor
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="course">Curso</Label>
                  <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um curso" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCourses.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          Nenhum curso disponível
                        </div>
                      ) : (
                        availableCourses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.name} ({course.code})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false)
                    setSelectedCourseId("")
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={handleAddCourse} disabled={!selectedCourseId || isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Adicionar"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  )
}



