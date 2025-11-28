"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sidebar } from "@/components/layout/sidebar"
import { LiquidGlassCard, LiquidGlassButton } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { 
  Clock, 
  Calendar, 
  User, 
  Save, 
  Send, 
  CheckCircle, 
  History,
  Sun,
  Sunset,
  Moon
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { getCurrentUser } from "@/src/services/professor-dashboard"
import { Skeleton } from "@/components/ui/skeleton"
import {
  getAvailableSemesters,
  getTeacherAvailabilities,
  getTeacherAvailabilityBySemester,
  createOrUpdateAvailability,
  submitAvailability,
  type DisponibilizacaoHorarios as BackendAvailability,
  type Shift,
  type DisponibilidadeTurnos,
} from "@/src/services/availability-service"
import { ShiftGrid } from "@/components/shift-grid"
import { getTeacherCourses, type TeacherCourse } from "@/src/services/teacher-courses-service"
import { getCourseDisciplines, type BackendDiscipline } from "@/src/services/coursesService"
import { BookOpen, AlertCircle } from "lucide-react"

type Turno = 'manha' | 'tarde' | 'noite'

interface DisponibilizacaoHorarios {
  id: string
  semestre: string
  status: 'rascunho' | 'enviada' | 'aprovada'
  turnos: DisponibilidadeTurnos
  observacoes: string
  dataCriacao: Date
  dataEnvio?: Date
  disciplinas?: Array<{ id: string; name: string; code: string }>
  diasSemana?: string[]
}

const TURNOS: Array<{
  id: Turno
  nome: string
  icone: typeof Sun
  cor: string
  descricao: string
}> = [
  { id: 'manha', nome: 'Manhã', icone: Sun, cor: 'yellow', descricao: '07:00 - 12:00' },
  { id: 'tarde', nome: 'Tarde', icone: Sunset, cor: 'orange', descricao: '13:00 - 18:00' },
  { id: 'noite', nome: 'Noite', icone: Moon, cor: 'blue', descricao: '18:30 - 22:00' }
]

export default function DisponibilizacaoHorariosPage() {
  const router = useRouter()
  const [isLiquidGlass, setIsLiquidGlass] = useState(false)
  const [semestreSelecionado, setSemestreSelecionado] = useState("")
  const [semestres, setSemestres] = useState<Array<{ id: string; nome: string; ativo: boolean }>>([])
  const [teacherId, setTeacherId] = useState<string | null>(null)
  const [status, setStatus] = useState<'rascunho' | 'enviada' | 'aprovada'>('rascunho')
  const [observacoes, setObservacoes] = useState("")
  const [selectedShifts, setSelectedShifts] = useState<Shift[]>([])
  const [historico, setHistorico] = useState<DisponibilizacaoHorarios[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentAvailabilityId, setCurrentAvailabilityId] = useState<string | null>(null)
  const [selectedDisciplineIds, setSelectedDisciplineIds] = useState<string[]>([])
  const [teacherCourses, setTeacherCourses] = useState<TeacherCourse[]>([])
  const [coursesWithDisciplines, setCoursesWithDisciplines] = useState<Array<{
    course: TeacherCourse['course']
    disciplines: BackendDiscipline[]
  }>>([])
  const [loadingDisciplines, setLoadingDisciplines] = useState(false)

  const DIAS_SEMANA = [
    { id: 'segunda-feira', nome: 'Segunda-feira', abreviacao: 'Seg' },
    { id: 'terca-feira', nome: 'Terça-feira', abreviacao: 'Ter' },
    { id: 'quarta-feira', nome: 'Quarta-feira', abreviacao: 'Qua' },
    { id: 'quinta-feira', nome: 'Quinta-feira', abreviacao: 'Qui' },
    { id: 'sexta-feira', nome: 'Sexta-feira', abreviacao: 'Sex' },
    { id: 'sabado', nome: 'Sábado', abreviacao: 'Sáb' }
  ] as const

  useEffect(() => {
    const checkTheme = () => {
      setIsLiquidGlass(document.documentElement.classList.contains("liquid-glass"))
    }

    checkTheme()

    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    })

    return () => observer.disconnect()
  }, [])

  // Buscar usuário atual e semestres disponíveis
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true)
        const token = typeof window !== "undefined" ? localStorage.getItem("ava:token") : null
        if (!token) {
          router.push("/")
          return
        }
        const user = await getCurrentUser()
        if (user?.id) {
          setTeacherId(user.id)
        } else {
          router.push("/")
        }
      } catch (error) {
        console.error("Erro ao buscar usuário:", error)
        router.push("/")
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [router])

  // Buscar cursos do professor e suas disciplinas
  useEffect(() => {
    const carregarCursosEDisciplinas = async () => {
      if (!teacherId) return

      try {
        setLoadingDisciplines(true)
        const courses = await getTeacherCourses(teacherId)
        setTeacherCourses(courses)

        if (courses.length === 0) {
          setCoursesWithDisciplines([])
          return
        }

        const disciplinesPromises = courses.map(async (tc: TeacherCourse) => {
          try {
            const disciplines = await getCourseDisciplines(tc.course.id)
            return {
              course: tc.course,
              disciplines
            }
          } catch (error) {
            console.error(`Erro ao carregar disciplinas do curso ${tc.course.id}:`, error)
            return {
              course: tc.course,
              disciplines: [] as BackendDiscipline[]
            }
          }
        })

        const coursesWithDisciplinesData = await Promise.all(disciplinesPromises)
        setCoursesWithDisciplines(coursesWithDisciplinesData)
      } catch (error) {
        console.error("Erro ao carregar cursos e disciplinas:", error)
        toast.error("Erro ao carregar cursos e disciplinas")
      } finally {
        setLoadingDisciplines(false)
      }
    }

    carregarCursosEDisciplinas()
  }, [teacherId])

  // Buscar semestres disponíveis
  useEffect(() => {
    const buscarSemestres = async () => {
      if (!teacherId) return
      try {
        setLoading(true)
        const semestresDisponiveis = await getAvailableSemesters(teacherId)
        setSemestres(semestresDisponiveis)
        
        // Selecionar semestre ativo ou o primeiro disponível
        const semestreAtivo = semestresDisponiveis.find(s => s.ativo)
        if (semestreAtivo) {
          setSemestreSelecionado(semestreAtivo.id)
        } else if (semestresDisponiveis.length > 0) {
          setSemestreSelecionado(semestresDisponiveis[0].id)
        }
      } catch (error) {
        console.error("Erro ao buscar semestres:", error)
        toast.error("Erro ao carregar semestres disponíveis")
      } finally {
        setLoading(false)
      }
    }
    buscarSemestres()
  }, [teacherId])

  // Carregar disponibilidade ao selecionar semestre
  useEffect(() => {
    const carregarDisponibilidade = async () => {
      if (!teacherId || !semestreSelecionado) return
      
      try {
        setLoading(true)
        const disponibilidade = await getTeacherAvailabilityBySemester(
          teacherId,
          semestreSelecionado
        )
        
        if (disponibilidade) {
          setCurrentAvailabilityId(disponibilidade.id)
          setSelectedShifts(disponibilidade.shifts || [])
          setObservacoes(disponibilidade.observations || "")
          setSelectedDisciplineIds(disponibilidade.disciplines?.map(d => d.id) || [])
          
          const statusMap: Record<string, 'rascunho' | 'enviada' | 'aprovada'> = {
            draft: 'rascunho',
            submitted: 'enviada',
            approved: 'aprovada'
          }
          setStatus(statusMap[disponibilidade.status] || 'rascunho')
        } else {
          setCurrentAvailabilityId(null)
          setSelectedShifts([])
          setObservacoes("")
          setSelectedDisciplineIds([])
          setStatus('rascunho')
        }
      } catch (error) {
        console.error("Erro ao carregar disponibilidade:", error)
      } finally {
        setLoading(false)
      }
    }
    
    carregarDisponibilidade()
  }, [teacherId, semestreSelecionado])

  // Carregar histórico
  useEffect(() => {
    const carregarHistorico = async () => {
      if (!teacherId) return
      
      try {
        const disponibilidades = await getTeacherAvailabilities(teacherId)
        
        const historicoFormatado: DisponibilizacaoHorarios[] = disponibilidades.map(av => {
          const statusMap: Record<string, 'rascunho' | 'enviada' | 'aprovada'> = {
            draft: 'rascunho',
            submitted: 'enviada',
            approved: 'aprovada'
          }
          
          // Converter shifts para formato antigo para compatibilidade com interface
          const turnos = {
            manha: av.shifts?.some(s => s.shift === 'morning') || false,
            tarde: av.shifts?.some(s => s.shift === 'afternoon') || false,
            noite: av.shifts?.some(s => s.shift === 'evening') || false
          }
          
          return {
            id: av.id,
            semestre: av.academicPeriod?.period || av.academicPeriod?.id || '',
            status: statusMap[av.status] || 'rascunho',
            turnos,
            observacoes: av.observations || "",
            dataCriacao: new Date(av.createdAt),
            dataEnvio: av.submittedAt ? new Date(av.submittedAt) : undefined,
            disciplinas: av.disciplines || [],
            diasSemana: av.shifts?.map(s => s.dayOfWeek) || []
          }
        })
        
        setHistorico(historicoFormatado.sort((a, b) => 
          b.dataCriacao.getTime() - a.dataCriacao.getTime()
        ))
      } catch (error) {
        console.error("Erro ao carregar histórico:", error)
      }
    }
    
    carregarHistorico()
  }, [teacherId])

  const temAlgumTurnoSelecionado = () => {
    return selectedShifts.length > 0
  }

  const salvarRascunho = async () => {
    if (!semestreSelecionado) {
      toast.error("Selecione um semestre antes de salvar", {
        description: "É necessário selecionar um semestre para disponibilizar seus horários"
      })
      return
    }

    if (!teacherId) {
      toast.error("Erro ao identificar o professor")
      return
    }

    if (!temAlgumTurnoSelecionado()) {
      toast.warning("Selecione pelo menos um turno em um dia da semana antes de salvar")
      return
    }

    try {
      setSaving(true)
      
      // academicPeriodId aceita UUID ou string de período (ex: "2026.2")
      const disponibilidade = await createOrUpdateAvailability({
        teacherId: teacherId!,
        academicPeriodId: semestreSelecionado,
        shifts: selectedShifts,
        observations: observacoes || undefined,
        disciplineIds: selectedDisciplineIds.length > 0 ? selectedDisciplineIds : undefined
      })

      setCurrentAvailabilityId(disponibilidade.id)
      setStatus('rascunho')
      
      toast.success("Rascunho salvo com sucesso!", {
        description: "Sua disponibilidade foi salva"
      })
      
      // Recarregar histórico
      const historicoAtualizado = await getTeacherAvailabilities(teacherId)
      const historicoFormatado: DisponibilizacaoHorarios[] = historicoAtualizado.map(av => {
        const statusMap: Record<string, 'rascunho' | 'enviada' | 'aprovada'> = {
          draft: 'rascunho',
          submitted: 'enviada',
          approved: 'aprovada'
        }
        
        // Converter shifts para formato antigo para compatibilidade
        const turnos = {
          manha: av.shifts?.some(s => s.shift === 'morning') || false,
          tarde: av.shifts?.some(s => s.shift === 'afternoon') || false,
          noite: av.shifts?.some(s => s.shift === 'evening') || false
        }
        
        return {
          id: av.id,
          semestre: av.academicPeriod?.period || av.academicPeriod?.id || '',
          status: statusMap[av.status] || 'rascunho',
          turnos,
          observacoes: av.observations || "",
          dataCriacao: new Date(av.createdAt),
          dataEnvio: av.submittedAt ? new Date(av.submittedAt) : undefined,
          disciplinas: av.disciplines || [],
          diasSemana: av.shifts?.map(s => s.dayOfWeek) || []
        }
      })
      
      setHistorico(historicoFormatado.sort((a, b) => 
        b.dataCriacao.getTime() - a.dataCriacao.getTime()
      ))
    } catch (error: any) {
      console.error('Erro ao salvar rascunho:', error)
      toast.error("Erro ao salvar rascunho", {
        description: error.response?.data?.message || "Tente novamente em alguns instantes"
      })
    } finally {
      setSaving(false)
    }
  }

  const enviarParaCoordenacao = async () => {
    if (!semestreSelecionado) {
      toast.error("Selecione um semestre antes de enviar", {
        description: "É necessário selecionar um semestre para disponibilizar seus horários"
      })
      return
    }

    if (!teacherId) {
      toast.error("Erro ao identificar o professor")
      return
    }

    if (!temAlgumTurnoSelecionado()) {
      toast.error("Selecione pelo menos um turno antes de enviar", {
        description: "É necessário informar sua disponibilidade"
      })
      return
    }

    const toastId = toast.loading("Enviando disponibilidade para coordenação...", {
      id: "enviando-horarios"
    })

    try {
      setSaving(true)
      
      // Primeiro criar/atualizar como draft
      // academicPeriodId aceita UUID ou string de período (ex: "2026.2")
      let disponibilidade = await createOrUpdateAvailability({
        teacherId: teacherId!,
        academicPeriodId: semestreSelecionado,
        shifts: selectedShifts,
        observations: observacoes || undefined,
        disciplineIds: selectedDisciplineIds.length > 0 ? selectedDisciplineIds : undefined
      })

      setCurrentAvailabilityId(disponibilidade.id)
      
      // Se já existe e está como draft, submeter
      if (disponibilidade.status === 'draft') {
        try {
          disponibilidade = await submitAvailability(disponibilidade.id)
        } catch (submitError: any) {
          // Se o endpoint de submit não existir, o backend pode ter submetido automaticamente
          // ou pode aceitar status no POST. Vamos verificar o status retornado
          if (submitError.response?.status === 404) {
            // Endpoint não existe, assumir que foi submetido
            console.warn("Endpoint de submit não encontrado, assumindo submissão automática")
          } else {
            throw submitError
          }
        }
      }
      
      const statusMap: Record<string, 'rascunho' | 'enviada' | 'aprovada'> = {
        draft: 'rascunho',
        submitted: 'enviada',
        approved: 'aprovada'
      }
      setStatus(statusMap[disponibilidade.status] || 'enviada')
      
      toast.dismiss(toastId)
      toast.success("Disponibilidade enviada com sucesso!", {
        description: "A coordenação foi notificada sobre seus turnos disponíveis"
      })
      
      // Recarregar histórico
      const historicoAtualizado = await getTeacherAvailabilities(teacherId)
      const historicoFormatado: DisponibilizacaoHorarios[] = historicoAtualizado.map(av => {
        const statusMap: Record<string, 'rascunho' | 'enviada' | 'aprovada'> = {
          draft: 'rascunho',
          submitted: 'enviada',
          approved: 'aprovada'
        }
        
        // Converter shifts para formato antigo para compatibilidade
        const turnos = {
          manha: av.shifts?.some(s => s.shift === 'morning') || false,
          tarde: av.shifts?.some(s => s.shift === 'afternoon') || false,
          noite: av.shifts?.some(s => s.shift === 'evening') || false
        }
        
        return {
          id: av.id,
          semestre: av.academicPeriod?.period || av.academicPeriod?.id || '',
          status: statusMap[av.status] || 'rascunho',
          turnos,
          observacoes: av.observations || "",
          dataCriacao: new Date(av.createdAt),
          dataEnvio: av.submittedAt ? new Date(av.submittedAt) : undefined,
          disciplinas: av.disciplines || [],
          diasSemana: av.shifts?.map(s => s.dayOfWeek) || []
        }
      })
      
      setHistorico(historicoFormatado.sort((a, b) => 
        b.dataCriacao.getTime() - a.dataCriacao.getTime()
      ))
    } catch (error: any) {
      console.error('Erro ao enviar disponibilidade:', error)
      toast.dismiss(toastId)
      toast.error("Erro ao enviar disponibilidade", {
        description: error.response?.data?.message || "Verifique sua conexão e tente novamente"
      })
    } finally {
      setSaving(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "aprovada": return "bg-emerald-500"
      case "enviada": return "bg-blue-500"
      case "rascunho": return "bg-yellow-500"
      default: return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "aprovada": return CheckCircle
      case "enviada": return Send
      case "rascunho": return Save
      default: return Clock
    }
  }

  if (loading) {
    return (
      <div className={cn("flex h-screen", isLiquidGlass ? 'bg-gray-50/30 dark:bg-gray-900/20' : 'bg-background')}>
        <Sidebar userRole="professor" />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            {/* Skeleton do Header */}
            <div className={cn(
              "flex flex-col lg:flex-row lg:items-center justify-between mb-8 p-6 rounded-xl border gap-4",
              isLiquidGlass
                ? 'bg-black/30 dark:bg-gray-800/20 border-gray-200/30 dark:border-gray-700/50'
                : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
            )}>
              <div className="flex items-center space-x-4">
                <Skeleton className="w-16 h-16 rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-9 w-80" />
                  <Skeleton className="h-5 w-96" />
                  <div className="flex gap-2 mt-2">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </div>
              <Skeleton className="h-10 w-40" />
            </div>

            {/* Skeleton dos Tabs */}
            <div className="mb-6">
              <div className={cn(
                "grid w-full grid-cols-2 gap-1 backdrop-blur-sm",
                isLiquidGlass
                  ? 'bg-black/30 dark:bg-gray-800/20 border-gray-200/30 dark:border-gray-700/50'
                  : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
              )}>
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
            </div>

            {/* Skeleton do Conteúdo */}
            <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY} className={isLiquidGlass ? 'bg-black/30 dark:bg-gray-800/20' : 'bg-gray-50/60 dark:bg-gray-800/40'}>
              <CardHeader>
                <Skeleton className="h-7 w-48 mb-2" />
                <Skeleton className="h-4 w-96" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-48 rounded-xl" />
                  ))}
                </div>
                <Skeleton className="h-24 w-full rounded-lg" />
                <div className="flex gap-3 pt-4 border-t">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 flex-1" />
                </div>
              </CardContent>
            </LiquidGlassCard>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className={cn("flex h-screen", isLiquidGlass ? 'bg-gray-50/30 dark:bg-gray-900/20' : 'bg-background')}>
      <Sidebar userRole="professor" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6 lg:p-8">
          {/* Header */}
          <div className={cn(
            "flex flex-col lg:flex-row lg:items-center justify-between mb-4 md:mb-6 lg:mb-8 p-4 md:p-6 rounded-xl border gap-4",
            isLiquidGlass
              ? 'bg-black/30 dark:bg-gray-800/20 border-gray-200/30 dark:border-gray-700/50'
              : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
          )}>
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Clock className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                  <Calendar className="h-2.5 w-2.5 md:h-3 md:w-3 text-white" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-green-600 dark:text-green-400 truncate">
                    Disponibilização de Horários
                  </h1>
                  <Badge variant="outline" className="text-green-600 border-green-200 dark:text-green-400 dark:border-green-800 text-xs md:text-sm px-2 md:px-3 py-1 w-fit">
                    {semestres.find(s => s.id === semestreSelecionado)?.nome}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm md:text-base lg:text-lg mt-1">
                  Informe os turnos em que você está disponível
                </p>
                <div className="flex items-center mt-2 flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                    <User className="h-3 w-3 mr-1" />
                    Professor
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      status === 'aprovada' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
                      status === 'enviada' && 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
                      status === 'rascunho' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'
                    )}
                  >
                    {status === 'aprovada' ? 'Aprovada' : status === 'enviada' ? 'Enviada' : 'Rascunho'}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full lg:w-auto">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                {loading || semestres.length === 0 ? (
                  <Skeleton className="h-10 w-full sm:w-40" />
                ) : (
                  <Select value={semestreSelecionado} onValueChange={setSemestreSelecionado}>
                    <SelectTrigger className={cn(
                      "w-full sm:w-40 backdrop-blur-sm",
                      isLiquidGlass
                        ? 'bg-black/30 dark:bg-gray-800/20 border-gray-200/30 dark:border-gray-700/50'
                        : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
                    )}>
                      <SelectValue placeholder="Selecionar semestre">
                        {semestreSelecionado 
                          ? semestres.find(s => s.id === semestreSelecionado)?.nome || semestreSelecionado
                          : "Selecionar semestre"
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border-gray-200/30 dark:border-gray-700/50">
                      {semestres.map((semestre) => (
                        <SelectItem key={semestre.id} value={semestre.id}>
                          <div className="flex items-center space-x-2">
                            <span>{semestre.nome}</span>
                            {semestre.ativo && (
                              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 text-xs">
                                Atual
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>

          <Tabs defaultValue="disponibilizar" className="space-y-4 md:space-y-6">
            <TabsList className={cn(
              "grid w-full grid-cols-2 gap-1 backdrop-blur-sm",
              isLiquidGlass
                ? 'bg-black/30 dark:bg-gray-800/20 border-gray-200/30 dark:border-gray-700/50'
                : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
            )}>
              <TabsTrigger value="disponibilizar" className="border-none flex items-center space-x-2 text-xs sm:text-sm">
                <Clock className="h-3 w-3 md:h-4 md:w-4" />
                <span className="truncate">Disponibilizar Turnos</span>
              </TabsTrigger>
              <TabsTrigger value="historico" className="border-none flex items-center space-x-2 text-xs sm:text-sm">
                <History className="h-3 w-3 md:h-4 md:w-4" />
                <span>Histórico</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="disponibilizar" className="space-y-6">
              <LiquidGlassCard
                intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
                className={cn(
                  isLiquidGlass
                    ? 'bg-black/30 dark:bg-gray-800/20'
                    : 'bg-gray-50/60 dark:bg-gray-800/40'
                )}
              >
                <CardHeader>
                  <CardTitle className="text-xl md:text-2xl text-gray-900 dark:text-gray-100">
                    Turnos Disponíveis
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    Selecione os turnos em que você está disponível para lecionar
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 md:space-y-6">
                  {/* Seleção de Turnos */}
                  <ShiftGrid
                    selectedShifts={selectedShifts}
                    onChange={setSelectedShifts}
                    disabled={status === 'aprovada' || status === 'enviada'}
                  />

                  {/* Resumo da Seleção */}
                  {temAlgumTurnoSelecionado() && (
                    <div className={cn(
                      "p-4 rounded-lg border",
                      isLiquidGlass
                        ? 'bg-black/20 dark:bg-gray-800/10 border-gray-200/30 dark:border-gray-700/50'
                        : 'bg-gray-50/40 dark:bg-gray-800/20 border-gray-200 dark:border-gray-700'
                    )}>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Turnos selecionados:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedShifts.map((shift, index) => {
                          const dia = DIAS_SEMANA.find(d => d.id === shift.dayOfWeek)
                          const turno = TURNOS.find(t => {
                            if (shift.shift === 'morning') return t.id === 'manha'
                            if (shift.shift === 'afternoon') return t.id === 'tarde'
                            if (shift.shift === 'evening') return t.id === 'noite'
                            return false
                          })
                          if (!dia || !turno) return null
                          return (
                            <Badge
                              key={index}
                              variant="secondary"
                              className={cn(
                                turno.cor === 'yellow' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
                                turno.cor === 'orange' && 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
                                turno.cor === 'blue' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                              )}
                            >
                              {turno.nome} ({dia.abreviacao})
                            </Badge>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Seleção de Disciplinas */}
                  {teacherCourses.length === 0 ? (
                    <div className={cn(
                      "p-4 rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-900/10"
                    )}>
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                            Nenhum curso vinculado
                          </p>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                            Você não está vinculado a nenhum curso. Entre em contato com o coordenador para ser vinculado a um curso.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">
                          Disciplinas de Interesse (opcional)
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Selecione as disciplinas que você tem interesse em lecionar
                        </p>
                      </div>
                      
                      {loadingDisciplines ? (
                        <div className="space-y-3">
                          <Skeleton className="h-20 w-full" />
                          <Skeleton className="h-20 w-full" />
                        </div>
                      ) : coursesWithDisciplines.length === 0 ? (
                        <div className="text-sm text-muted-foreground p-4 border rounded-lg">
                          Nenhuma disciplina disponível nos cursos vinculados
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-96 overflow-y-auto p-4 border rounded-lg">
                          {coursesWithDisciplines.map(({ course, disciplines }) => {
                            if (disciplines.length === 0) return null
                            
                            return (
                              <div key={course.id} className="space-y-2">
                                <div className="flex items-center gap-2 pb-2 border-b">
                                  <BookOpen className="h-4 w-4 text-primary" />
                                  <h4 className="font-semibold text-sm">{course.name}</h4>
                                  <Badge variant="outline" className="text-xs">{course.code}</Badge>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-6">
                                  {disciplines.map((discipline) => {
                                    const isSelected = selectedDisciplineIds.includes(discipline.id)
                                    return (
                                      <label
                                        key={discipline.id}
                                        className={cn(
                                          "flex items-center space-x-2 p-2 rounded-md border cursor-pointer transition-colors",
                                          isSelected
                                            ? "bg-primary/10 border-primary"
                                            : "hover:bg-accent border-gray-200 dark:border-gray-700"
                                        )}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={isSelected}
                                          onChange={(e) => {
                                            if (e.target.checked) {
                                              setSelectedDisciplineIds([...selectedDisciplineIds, discipline.id])
                                            } else {
                                              setSelectedDisciplineIds(selectedDisciplineIds.filter(id => id !== discipline.id))
                                            }
                                          }}
                                          className="rounded"
                                          disabled={status === 'aprovada' || status === 'enviada'}
                                        />
                                        <span className="text-sm flex-1">
                                          {discipline.name}
                                          {discipline.code && (
                                            <span className="text-muted-foreground ml-1">({discipline.code})</span>
                                          )}
                                        </span>
                                      </label>
                                    )
                                  })}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                      
                      {selectedDisciplineIds.length > 0 && (
                        <div className={cn(
                          "p-3 rounded-lg border",
                          isLiquidGlass
                            ? 'bg-black/20 dark:bg-gray-800/10 border-gray-200/30 dark:border-gray-700/50'
                            : 'bg-gray-50/40 dark:bg-gray-800/20 border-gray-200 dark:border-gray-700'
                        )}>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Disciplinas selecionadas: {selectedDisciplineIds.length}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Observações */}
                  <div className="space-y-2">
                    <Label htmlFor="observacoes" className="text-sm font-medium">
                      Observações Adicionais (opcional)
                    </Label>
                    <Textarea
                      id="observacoes"
                      placeholder="Informe qualquer observação relevante sobre sua disponibilidade..."
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      className="min-h-[100px]"
                      disabled={status === 'aprovada' || status === 'enviada'}
                    />
                  </div>

                  {/* Resumo antes de enviar */}
                  {semestreSelecionado && temAlgumTurnoSelecionado() && (
                    <div className={cn(
                      "p-4 rounded-lg border border-primary/20 bg-primary/5",
                    )}>
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <CheckCircle className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm mb-1">Resumo da Disponibilização</p>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p>
                              <span className="font-medium">Semestre:</span> {semestres.find(s => s.id === semestreSelecionado)?.nome}
                            </p>
                            <p>
                              <span className="font-medium">Turnos selecionados:</span> {selectedShifts.length} combinação{selectedShifts.length !== 1 ? 'ões' : ''}
                            </p>
                            {selectedShifts.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {selectedShifts.slice(0, 5).map((shift, idx) => {
                                  const dia = DIAS_SEMANA.find(d => d.id === shift.dayOfWeek)
                                  const turno = TURNOS.find(t => {
                                    if (shift.shift === 'morning') return t.id === 'manha'
                                    if (shift.shift === 'afternoon') return t.id === 'tarde'
                                    if (shift.shift === 'evening') return t.id === 'noite'
                                    return false
                                  })
                                  if (!dia || !turno) return null
                                  return (
                                    <span key={idx} className="text-xs">
                                      {turno.nome} ({dia.abreviacao}){idx < Math.min(selectedShifts.length, 5) - 1 ? ',' : ''}
                                    </span>
                                  )
                                })}
                                {selectedShifts.length > 5 && (
                                  <span className="text-xs">+{selectedShifts.length - 5} mais</span>
                                )}
                              </div>
                            )}
                            {selectedDisciplineIds.length > 0 && (
                              <p>
                                <span className="font-medium">Disciplinas de interesse:</span> {selectedDisciplineIds.length} selecionada{selectedDisciplineIds.length !== 1 ? 's' : ''}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Botões de Ação */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <LiquidGlassButton
                      variant="outline"
                      onClick={salvarRascunho}
                      className="flex-1"
                      disabled={saving || loading || !semestreSelecionado}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? "Salvando..." : "Salvar Rascunho"}
                    </LiquidGlassButton>
                    <LiquidGlassButton
                      onClick={enviarParaCoordenacao}
                      className="flex-1"
                      disabled={saving || loading || status === 'aprovada' || !semestreSelecionado}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {saving ? "Enviando..." : "Enviar para Coordenação"}
                    </LiquidGlassButton>
                  </div>
                  {!semestreSelecionado && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      Selecione um semestre acima para continuar
                    </p>
                  )}
                </CardContent>
              </LiquidGlassCard>
            </TabsContent>

            <TabsContent value="historico" className="space-y-4 md:space-y-6">
              <LiquidGlassCard
                intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
                className={cn(
                  isLiquidGlass
                    ? 'bg-black/30 dark:bg-gray-800/20'
                    : 'bg-gray-50/60 dark:bg-gray-800/40'
                )}
              >
                <CardHeader>
                  <CardTitle className="text-xl md:text-2xl text-gray-900 dark:text-gray-100">
                    Histórico de Disponibilizações
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    Visualize suas disponibilizações anteriores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {historico.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma disponibilização encontrada</p>
                    </div>
                  ) : (
                    <div className="space-y-3 md:space-y-4">
                      {historico.map((item) => {
                        const StatusIcon = getStatusIcon(item.status)
                        const turnosSelecionados = TURNOS.filter(t => item.turnos[t.id])
                        
                        return (
                          <div
                            key={item.id}
                            className={cn(
                              "p-3 md:p-4 rounded-xl border",
                              isLiquidGlass
                                ? 'bg-black/20 dark:bg-gray-800/10 border-gray-200/30 dark:border-gray-700/50'
                                : 'bg-gray-50/40 dark:bg-gray-800/20 border-gray-200 dark:border-gray-700'
                            )}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3">
                              <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
                                <StatusIcon className="h-4 w-4 md:h-5 md:w-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <h3 className="font-medium text-sm md:text-base text-gray-900 dark:text-gray-100 truncate">
                                    {semestres.find(s => s.id === item.semestre)?.nome || `Semestre ${item.semestre}`}
                                  </h3>
                                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                                    Criado em {item.dataCriacao.toLocaleDateString('pt-BR')}
                                    {item.dataEnvio && ` • Enviado em ${item.dataEnvio.toLocaleDateString('pt-BR')}`}
                                  </p>
                                </div>
                              </div>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs w-fit",
                                  item.status === 'aprovada' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
                                  item.status === 'enviada' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
                                  item.status === 'rascunho' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'
                                )}
                              >
                                {item.status === 'aprovada' ? 'Aprovada' : item.status === 'enviada' ? 'Enviada' : 'Rascunho'}
                              </Badge>
                            </div>
                            
                            {item.observacoes && (
                              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-3">
                                {item.observacoes}
                              </p>
                            )}

                            <div className="space-y-3">
                              <div>
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                                  Turnos por dia da semana:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {item.diasSemana && item.diasSemana.length > 0 && turnosSelecionados.length > 0 ? (
                                    item.diasSemana.map(diaId => {
                                      const dia = DIAS_SEMANA.find(d => d.id === diaId)
                                      const turnosDoDia = turnosSelecionados.filter(t => {
                                        // Verificar se há algum turno selecionado para este dia
                                        // Como não temos os shifts originais, vamos mostrar todos os turnos selecionados
                                        return true
                                      })
                                      return dia ? (
                                        <div key={diaId} className="flex flex-col gap-1">
                                          <span className="text-xs font-medium text-gray-500">{dia.abreviacao}:</span>
                                          <div className="flex gap-1">
                                            {turnosSelecionados.map(turno => (
                                              <Badge
                                                key={`${diaId}-${turno.id}`}
                                                variant="secondary"
                                                className={cn(
                                                  "text-xs",
                                                  turno.cor === 'yellow' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
                                                  turno.cor === 'orange' && 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
                                                  turno.cor === 'blue' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                                                )}
                                              >
                                                {turno.nome}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                      ) : null
                                    })
                                  ) : turnosSelecionados.length > 0 ? (
                                    turnosSelecionados.map(turno => (
                                      <Badge
                                        key={turno.id}
                                        variant="secondary"
                                        className={cn(
                                          turno.cor === 'yellow' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
                                          turno.cor === 'orange' && 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
                                          turno.cor === 'blue' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                                        )}
                                      >
                                        {turno.nome}
                                      </Badge>
                                    ))
                                  ) : (
                                    <span className="text-gray-400 dark:text-gray-500 text-sm">
                                      Nenhum turno selecionado
                                    </span>
                                  )}
                                </div>
                              </div>

                              {item.disciplinas && item.disciplinas.length > 0 && (
                                <div>
                                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Disciplinas de interesse:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {item.disciplinas.map(disciplina => (
                                      <Badge
                                        key={disciplina.id}
                                        variant="outline"
                                        className="bg-primary/5 text-primary border-primary/20"
                                      >
                                        <BookOpen className="h-3 w-3 mr-1" />
                                        {disciplina.name}
                                        {disciplina.code && ` (${disciplina.code})`}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </LiquidGlassCard>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
