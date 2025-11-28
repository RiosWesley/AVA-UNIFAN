"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Calendar, Users, Clock, BookOpen, Loader2, Sun, Sunset, Moon, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { getCourseAvailabilitySummary, type CourseAvailabilitySummary } from "@/src/services/availability-service"
import { getCourseById, type BackendCourse } from "@/src/services/coursesService"
import { getSemestresDisponiveisCoordenador } from "@/src/services/coordenador-dashboard"
import { getCurrentUser } from "@/src/services/professor-dashboard"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const TURNOS = [
  { id: 'morning', nome: 'Manhã', icone: Sun, cor: 'yellow' },
  { id: 'afternoon', nome: 'Tarde', icone: Sunset, cor: 'orange' },
  { id: 'evening', nome: 'Noite', icone: Moon, cor: 'blue' }
] as const

const DIAS_SEMANA_MAP: Record<string, string> = {
  'segunda-feira': 'Seg',
  'terca-feira': 'Ter',
  'quarta-feira': 'Qua',
  'quinta-feira': 'Qui',
  'sexta-feira': 'Sex',
  'sabado': 'Sáb',
  'domingo': 'Dom'
}

export default function CursoDisponibilizacoesPage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string

  const [course, setCourse] = useState<BackendCourse | null>(null)
  const [summary, setSummary] = useState<CourseAvailabilitySummary | null>(null)
  const [semesters, setSemesters] = useState<Array<{ id: string; nome: string; ativo: boolean }>>([])
  const [selectedSemesterId, setSelectedSemesterId] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingSummary, setIsLoadingSummary] = useState(false)
  const [coordinatorId, setCoordinatorId] = useState<string | null>(null)

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
    const loadCourse = async () => {
      try {
        setIsLoading(true)
        const courseData = await getCourseById(courseId)
        setCourse(courseData)
      } catch (error: any) {
        console.error("Erro ao carregar curso:", error)
        toast.error("Erro ao carregar curso", {
          description: error.message || "Tente novamente"
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (courseId) {
      loadCourse()
    }
  }, [courseId])

  useEffect(() => {
    const loadSemesters = async () => {
      if (!coordinatorId) return
      
      try {
        const semestersData = await getSemestresDisponiveisCoordenador(coordinatorId)
        setSemesters(semestersData)
        
        if (semestersData.length > 0) {
          const activeSemester = semestersData.find(s => s.ativo)
          if (activeSemester) {
            setSelectedSemesterId(activeSemester.id)
          } else {
            setSelectedSemesterId(semestersData[0].id)
          }
        }
      } catch (error) {
        console.error("Erro ao carregar semestres:", error)
        toast.error("Erro ao carregar semestres")
      }
    }

    loadSemesters()
  }, [coordinatorId])

  useEffect(() => {
    const loadSummary = async () => {
      if (!courseId || !selectedSemesterId) return

      try {
        setIsLoadingSummary(true)
        // Usar o período (string) se disponível, caso contrário usar o ID
        const semester = semesters.find(s => s.id === selectedSemesterId)
        const semesterIdentifier = semester?.nome || selectedSemesterId
        const summaryData = await getCourseAvailabilitySummary(courseId, semesterIdentifier)
        setSummary(summaryData)
      } catch (error: any) {
        console.error("Erro ao carregar resumo:", error)
        if (error.response?.status !== 404) {
          toast.error("Erro ao carregar resumo", {
            description: error.message || "Tente novamente"
          })
        }
        setSummary(null)
      } finally {
        setIsLoadingSummary(false)
      }
    }

    loadSummary()
  }, [courseId, selectedSemesterId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-emerald-500"
      case "submitted": return "bg-blue-500"
      case "draft": return "bg-yellow-500"
      default: return "bg-gray-500"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "approved": return "Aprovada"
      case "submitted": return "Enviada"
      case "draft": return "Rascunho"
      default: return status
    }
  }

  if (isLoading) {
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
                onClick={() => router.push("/coordenador/cursos")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Disponibilizações do Curso</h1>
                <p className="text-muted-foreground mt-1">
                  {course?.name} ({course?.code})
                </p>
              </div>
            </div>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Seleção de Semestre
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="semester">Semestre</Label>
                  <Select value={selectedSemesterId} onValueChange={setSelectedSemesterId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um semestre" />
                    </SelectTrigger>
                    <SelectContent>
                      {semesters.map((semester) => (
                        <SelectItem key={semester.id} value={semester.id}>
                          <div className="flex items-center gap-2">
                            <span>{semester.nome}</span>
                            {semester.ativo && (
                              <Badge variant="secondary" className="text-xs">
                                Atual
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {isLoadingSummary ? (
            <Card>
              <CardContent className="py-8">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
                  <span className="text-muted-foreground">Carregando resumo...</span>
                </div>
              </CardContent>
            </Card>
          ) : !summary ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma disponibilização encontrada para este semestre</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Resumo de Disponibilizações
                  </CardTitle>
                  <CardDescription>
                    Semestre: {summary.academicPeriod.period}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {summary.teachers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum professor com disponibilização para este semestre</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {summary.teachers.map((teacher) => (
                        <div
                          key={teacher.id}
                          className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-lg">{teacher.name}</h3>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-xs",
                                    teacher.status === 'approved' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
                                    teacher.status === 'submitted' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
                                    teacher.status === 'draft' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'
                                  )}
                                >
                                  {getStatusLabel(teacher.status)}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{teacher.email}</p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-2">Turnos Disponíveis:</p>
                              <div className="flex flex-wrap gap-2">
                                {teacher.shifts && teacher.shifts.length > 0 ? (
                                  teacher.shifts.map((shift, idx) => {
                                    const turno = TURNOS.find(t => {
                                      if (shift.shift === 'morning') return t.id === 'morning'
                                      if (shift.shift === 'afternoon') return t.id === 'afternoon'
                                      if (shift.shift === 'evening') return t.id === 'evening'
                                      return false
                                    })
                                    if (!turno) return null
                                    const Icon = turno.icone
                                    const diaAbrev = DIAS_SEMANA_MAP[shift.dayOfWeek] || shift.dayOfWeek
                                    return (
                                      <Badge
                                        key={idx}
                                        variant="secondary"
                                        className={cn(
                                          turno.cor === 'yellow' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
                                          turno.cor === 'orange' && 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
                                          turno.cor === 'blue' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                                        )}
                                      >
                                        <Icon className="h-3 w-3 mr-1" />
                                        {turno.nome} ({diaAbrev})
                                      </Badge>
                                    )
                                  })
                                ) : (
                                  <span className="text-sm text-muted-foreground">Nenhum turno selecionado</span>
                                )}
                              </div>
                            </div>

                            {teacher.disciplines && teacher.disciplines.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-2">Disciplinas de Interesse:</p>
                                <div className="flex flex-wrap gap-2">
                                  {teacher.disciplines.map((discipline) => (
                                    <Badge
                                      key={discipline.id}
                                      variant="outline"
                                      className="bg-primary/5 text-primary border-primary/20"
                                    >
                                      <BookOpen className="h-3 w-3 mr-1" />
                                      {discipline.name}
                                      {discipline.code && ` (${discipline.code})`}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {teacher.observations && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">Observações:</p>
                                <p className="text-sm text-foreground bg-muted/50 p-2 rounded">{teacher.observations}</p>
                              </div>
                            )}

                            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                              {teacher.submittedAt && (
                                <span>Enviado em: {new Date(teacher.submittedAt).toLocaleDateString('pt-BR')}</span>
                              )}
                              {teacher.approvedAt && (
                                <span>Aprovado em: {new Date(teacher.approvedAt).toLocaleDateString('pt-BR')}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Ações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <Button disabled className="w-full">
                            Gerar Grade do Semestre
                          </Button>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Funcionalidade em desenvolvimento</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

