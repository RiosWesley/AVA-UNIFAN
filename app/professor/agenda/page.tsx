"use client"

import { useState, useEffect, useMemo } from "react"
import { Sidebar } from '@/components/layout/sidebar'
import { LiquidGlassCard } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { Calendar, Clock, Plus, Bell, BookOpen, Zap, ChevronLeft, ChevronRight, CheckCircle, Info, Users, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getCurrentUser, getTeacherClassesWithDetails, TeacherClassDetail, getSemestresDisponiveisProfessor } from '@/src/services/professor-dashboard'
import { 
  getTeacherAgendaData, 
  groupSchedulesByDay, 
  groupLessonPlansByDate,
  Evento,
  EventosPorDia
} from '@/src/services/professor-agenda'
import { ScheduleWithRelations } from '@/lib/api-client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { GraduationCap } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface DayInfo {
  day: number
  hasEvents: boolean
  dayName: string
}

export default function AgendaPage() {
  const [isLiquidGlass, setIsLiquidGlass] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [teacherId, setTeacherId] = useState<string | null>(null)
  const [classes, setClasses] = useState<TeacherClassDetail[]>([])
  const [schedules, setSchedules] = useState<ScheduleWithRelations[]>([])
  const [lessonPlans, setLessonPlans] = useState<any[]>([])
  const [semestreSelecionado, setSemestreSelecionado] = useState<string>("")
  const [semestres, setSemestres] = useState<Array<{ id: string; nome: string; ativo: boolean }>>([])
  const [loadingSemestres, setLoadingSemestres] = useState(false)
  const [eventosPorDiaGrade, setEventosPorDiaGrade] = useState<EventosPorDia>({
    Seg: [],
    Ter: [],
    Qua: [],
    Qui: [],
    Sex: [],
    Sáb: [],
    Dom: []
  })
  const [eventosPorDataCalendario, setEventosPorDataCalendario] = useState<Map<string, Evento[]>>(new Map())

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

  // Buscar semestres disponíveis
  useEffect(() => {
    const buscarSemestres = async () => {
      if (!teacherId) return
      try {
        setLoadingSemestres(true)
        const semestresDisponiveis = await getSemestresDisponiveisProfessor(teacherId)
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
      } finally {
        setLoadingSemestres(false)
      }
    }
    buscarSemestres()
  }, [teacherId])

  // Carregar dados do professor e agenda
  useEffect(() => {
    let mounted = true
    
    async function loadAgendaData() {
      try {
        setLoading(true)
        setError(null)

        // Obter usuário atual
        const user = await getCurrentUser()
        if (!mounted) return

        if (!user.id) {
          throw new Error('Usuário não autenticado')
        }

        setTeacherId(user.id)

        // Buscar dados da agenda
        const agendaData = await getTeacherAgendaData(user.id)
        if (!mounted) return

        setClasses(agendaData.classes)
        setSchedules(agendaData.schedules)
        setLessonPlans(agendaData.lessonPlans)

        // Agrupar schedules por dia da semana para grade horária
        const eventosGrade = groupSchedulesByDay(agendaData.schedules, agendaData.classes)
        setEventosPorDiaGrade(eventosGrade)

        // Agrupar lesson_plans por data para calendário (mês atual)
        const eventosCalendario = groupLessonPlansByDate(
          agendaData.lessonPlans,
          agendaData.classes,
          currentMonth,
          currentYear
        )
        setEventosPorDataCalendario(eventosCalendario)
      } catch (err: any) {
        console.error('Erro ao carregar agenda:', err)
        setError(err.message || 'Não foi possível carregar a agenda.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadAgendaData()

    return () => {
      mounted = false
    }
  }, [])

  // Filtrar classes, schedules e lesson plans por semestre
  const classesFiltradas = useMemo(() => {
    if (!semestreSelecionado) return classes
    return classes.filter(classe => {
      const periodo = classe.semestre
      // Normalizar formato de semestre (2025.1 ou 2025-1)
      const periodoNormalizado = periodo?.replace('-', '.')
      const semestreNormalizado = semestreSelecionado.replace('-', '.')
      return periodoNormalizado === semestreNormalizado
    })
  }, [classes, semestreSelecionado])

  const schedulesFiltrados = useMemo(() => {
    if (!semestreSelecionado) return schedules
    const classIdsFiltradas = new Set(classesFiltradas.map(c => c.id))
    return schedules.filter(schedule => {
      return classIdsFiltradas.has(schedule.class?.id || '')
    })
  }, [schedules, classesFiltradas, semestreSelecionado])

  // Atualizar eventos quando dados ou semestre mudarem
  useEffect(() => {
    if (!teacherId || classes.length === 0) return

    // Agrupar schedules por dia da semana para grade horária
    const eventosGrade = groupSchedulesByDay(schedulesFiltrados, classesFiltradas)
    setEventosPorDiaGrade(eventosGrade)
  }, [schedulesFiltrados, classesFiltradas, teacherId])

  // Filtrar lesson plans por semestre
  const lessonPlansFiltrados = useMemo(() => {
    if (!semestreSelecionado) return lessonPlans
    const classIdsFiltradas = new Set(classesFiltradas.map(c => c.id))
    return lessonPlans.filter(lp => {
      return classIdsFiltradas.has(lp.class?.id || '')
    })
  }, [lessonPlans, classesFiltradas, semestreSelecionado])

  // Atualizar calendário quando mês/ano/semestre mudar
  useEffect(() => {
    if (!teacherId || lessonPlans.length === 0) return

    const eventosCalendario = groupLessonPlansByDate(
      lessonPlansFiltrados,
      classesFiltradas,
      currentMonth,
      currentYear
    )
    setEventosPorDataCalendario(eventosCalendario)
  }, [currentMonth, currentYear, teacherId, semestreSelecionado, classesFiltradas, lessonPlansFiltrados])

  const diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
  const diasSemanaGrade = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  const getTipoConfig = (tipo: string) => {
    switch (tipo) {
      case 'Aula':
        return {
          icon: BookOpen,
          color: 'bg-gradient-to-r from-green-500 to-emerald-500',
          textColor: 'text-green-700 dark:text-green-300',
          bgColor: 'bg-green-100 dark:bg-green-900/50',
          borderColor: 'border-green-200 dark:border-green-800'
        }
      case 'Reunião':
        return {
          icon: Users,
          color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
          textColor: 'text-blue-700 dark:text-blue-300',
          bgColor: 'bg-blue-100 dark:bg-blue-900/50',
          borderColor: 'border-blue-200 dark:border-blue-800'
        }
      case 'Atendimento':
        return {
          icon: Zap,
          color: 'bg-gradient-to-r from-purple-500 to-pink-500',
          textColor: 'text-purple-700 dark:text-purple-300',
          bgColor: 'bg-purple-100 dark:bg-purple-900/50',
          borderColor: 'border-purple-200 dark:border-purple-800'
        }
      case 'Atividade':
        return {
          icon: CheckCircle,
          color: 'bg-gradient-to-r from-amber-500 to-orange-500',
          textColor: 'text-amber-700 dark:text-amber-300',
          bgColor: 'bg-amber-100 dark:bg-amber-900/50',
          borderColor: 'border-amber-200 dark:border-amber-800'
        }
      default:
        return {
          icon: Info,
          color: 'bg-gradient-to-r from-green-500 to-emerald-500',
          textColor: 'text-green-700 dark:text-green-300',
          bgColor: 'bg-green-100 dark:bg-green-900/50',
          borderColor: 'border-green-200 dark:border-green-800'
        }
    }
  }


  const calendarDays: (DayInfo | null)[] = useMemo(() => {
    const days: (DayInfo | null)[] = []
    const firstDay = new Date(currentYear, currentMonth, 1).getDay()
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate()

    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
      days.push(null)
    }

    for (let day = 1; day <= lastDay; day++) {
      const dayOfWeek = new Date(currentYear, currentMonth, day).getDay()
      const dayName = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][dayOfWeek]
      // Verificar eventos do calendário (lesson_plans) para esta data específica
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const hasEvents = eventosPorDataCalendario.has(dateStr) && eventosPorDataCalendario.get(dateStr)!.length > 0
      days.push({ day, hasEvents, dayName })
    }

    return days
  }, [currentYear, currentMonth, eventosPorDataCalendario])

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  // Função para calcular a semana atual (segunda a sábado)
  const getWeekDays = useMemo(() => {
    const today = new Date()
    const monday = new Date(today)
    const day = monday.getDay()
    const diff = monday.getDate() - day + (day === 0 ? -6 : 1) // Ajusta para segunda-feira
    monday.setDate(diff)
    
    // Aplica o offset da semana
    monday.setDate(monday.getDate() + (currentWeekOffset * 7))
    
    const weekDays = []
    for (let i = 0; i < 6; i++) { // Segunda a Sábado
      const date = new Date(monday)
      date.setDate(monday.getDate() + i)
      weekDays.push({
        dayName: diasSemanaGrade[i],
        date: date,
        dateStr: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      })
    }
    return weekDays
  }, [currentWeekOffset])

  // Função para extrair horários únicos dos eventos (período completo)
  const getHorariosUnicos = useMemo(() => {
    const horariosMap = new Map<string, { periodo: string; startTime: string; endTime: string }>()
    
    // Percorrer apenas os dias da semana atual (usando eventosPorDiaGrade para grade horária)
    getWeekDays.forEach(day => {
      const eventosDoDia = eventosPorDiaGrade[day.dayName] || []
      eventosDoDia.forEach((evento: Evento) => {
        if (evento.hora) {
          const [startTime, endTime] = evento.hora.split(' - ')
          if (startTime && endTime) {
            const periodo = `${startTime} - ${endTime}`
            if (!horariosMap.has(periodo)) {
              horariosMap.set(periodo, {
                periodo,
                startTime,
                endTime
              })
            }
          }
        }
      })
    })
    
    // Converter para array e ordenar por hora de início
    return Array.from(horariosMap.values()).sort((a, b) => {
      return a.startTime.localeCompare(b.startTime)
    })
  }, [eventosPorDiaGrade, getWeekDays])

  // Função para obter eventos de um dia e período específicos
  const getEventosPorDiaHorario = (dayName: string, periodo: string) => {
    const eventos = eventosPorDiaGrade[dayName] || []
    return eventos.filter(evento => evento.hora === periodo)
  }

  const formatWeekRange = () => {
    if (getWeekDays.length === 0) return ''
    const firstDay = getWeekDays[0].date
    const lastDay = getWeekDays[getWeekDays.length - 1].date
    const firstMonth = monthNames[firstDay.getMonth()].substring(0, 3)
    const lastMonth = monthNames[lastDay.getMonth()].substring(0, 3)
    if (firstMonth === lastMonth) {
      return `${firstDay.getDate()} - ${lastDay.getDate()} de ${firstMonth} ${firstDay.getFullYear()}`
    }
    return `${firstDay.getDate()} ${firstMonth} - ${lastDay.getDate()} ${lastMonth} ${firstDay.getFullYear()}`
  }

  if (loading) {
    return (
      <div className={`flex h-screen ${isLiquidGlass ? 'bg-gray-50/30 dark:bg-gray-900/20' : 'bg-background'}`}>
        <Sidebar userRole="professor" />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-8">
            {/* Skeleton do Header */}
            <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm ${
              isLiquidGlass
                ? 'bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-green-500/20 dark:from-green-900/30 dark:via-emerald-900/30 dark:to-green-900/30 border-green-200/30 dark:border-green-700/50'
                : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
            }`}>
              <div className="p-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-6 w-96" />
                    <div className="flex items-center gap-6 pt-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-5 w-5 rounded" />
                      <Skeleton className="h-10 w-40" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Skeleton da Grade Horária */}
            <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY} className={isLiquidGlass ? 'bg-black/30 dark:bg-gray-800/20 border-green-200/30 dark:border-green-700/50' : 'bg-gray-50/60 dark:bg-gray-800/40 border-green-200 dark:border-green-700'}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-2xl" />
                    <div>
                      <Skeleton className="h-7 w-48 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <Skeleton className="h-9 w-16 rounded-full" />
                    <Skeleton className="h-9 w-9 rounded-full" />
                  </div>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="h-16 w-24" />
                      {[1, 2, 3, 4, 5, 6].map((j) => (
                        <Skeleton key={j} className="h-16 flex-1 rounded-lg" />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </LiquidGlassCard>

            {/* Skeleton do Calendário */}
            <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY} className={isLiquidGlass ? 'bg-black/30 dark:bg-gray-800/20 border-green-200/30 dark:border-green-700/50' : 'bg-gray-50/60 dark:bg-gray-800/40 border-green-200 dark:border-green-700'}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-2xl" />
                    <div>
                      <Skeleton className="h-7 w-32 mb-2" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <Skeleton className="h-9 w-32" />
                    <Skeleton className="h-9 w-9 rounded-full" />
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <Skeleton key={i} className="h-10" />
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 35 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-2xl" />
                  ))}
                </div>
              </div>
            </LiquidGlassCard>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex h-screen ${isLiquidGlass ? 'bg-gray-50/30 dark:bg-gray-900/20' : 'bg-background'}`}>
        <Sidebar userRole="professor" />
        <main className="flex-1 overflow-y-auto flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className={`flex h-screen ${isLiquidGlass ? 'bg-gray-50/30 dark:bg-gray-900/20' : 'bg-background'}`}>
      <Sidebar userRole="professor" />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-8">
          {/* Header Hero Section */}
          <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm ${
            isLiquidGlass
              ? 'bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-green-500/20 dark:from-green-900/30 dark:via-emerald-900/30 dark:to-green-900/30 border-green-200/30 dark:border-green-700/50'
              : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
          }`}>
            <div className="absolute inset-0 bg-grid-white/[0.02] dark:bg-grid-white/[0.05]" />
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-green-500/20 to-transparent rounded-full -translate-y-20 translate-x-20" />
            <div className="relative p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <h1 className="text-4xl font-bold text-green-600 dark:text-green-400">
                    Minha Agenda
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Organize suas aulas, reuniões e compromissos acadêmicos
                  </p>
                    <div className="flex items-center gap-6 pt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                          <Calendar className="h-2 w-2 text-white" />
                        </div>
                        <span className="text-sm font-medium">Agenda Inteligente</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                          <Bell className="h-2 w-2 text-white" />
                        </div>
                        <span className="text-sm font-medium">Lembretes Ativos</span>
                      </div>
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-800 px-3 py-1">
                        <Clock className="h-3 w-3 mr-1" />
                        Atualizado
                      </Badge>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="h-5 w-5 text-green-600 dark:text-green-400" />
                    {loadingSemestres || semestres.length === 0 ? (
                      <Skeleton className="h-10 w-40" />
                    ) : (
                      <Select value={semestreSelecionado} onValueChange={setSemestreSelecionado}>
                        <SelectTrigger className={`w-40 backdrop-blur-sm ${
                          isLiquidGlass
                            ? 'bg-black/30 dark:bg-gray-800/20 border-gray-200/30 dark:border-gray-700/50'
                            : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
                        }`}>
                          <SelectValue placeholder="Selecionar semestre" />
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
                <div className="hidden md:flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                    <Calendar className="h-10 w-10 text-white" />
                  </div>
                </div>
            </div>
            </div>
          </div>

          {/* Grade Horária Semanal */}
          <LiquidGlassCard
            intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
            className={`relative overflow-hidden rounded-xl border shadow-lg transition-all duration-300 ${
              isLiquidGlass
                ? 'bg-black/30 dark:bg-gray-800/20 border-green-200/30 dark:border-green-700/50'
                : 'bg-gray-50/60 dark:bg-gray-800/40 border-green-200 dark:border-green-700'
            }`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-500/20 to-transparent rounded-full -translate-y-16 translate-x-16" />
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Grade Horária Semanal</h2>
                    <p className="text-sm text-muted-foreground">{formatWeekRange()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => setCurrentWeekOffset(currentWeekOffset - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => setCurrentWeekOffset(0)}
                  >
                    Hoje
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => setCurrentWeekOffset(currentWeekOffset + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="p-3 text-left text-sm font-bold text-foreground border-b border-green-200/50 dark:border-green-800/50">
                        Horário
                      </th>
                      {getWeekDays.map((day) => (
                        <th key={day.dayName} className="p-3 text-center text-sm font-bold text-foreground border-b border-green-200/50 dark:border-green-800/50">
                          <div>{day.dayName}</div>
                          <div className="text-xs text-muted-foreground font-normal">{day.dateStr}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {getHorariosUnicos.length === 0 ? (
                      <tr>
                        <td colSpan={getWeekDays.length + 1} className="p-8 text-center text-muted-foreground">
                          Nenhuma aula agendada para esta semana
                        </td>
                      </tr>
                    ) : (
                      getHorariosUnicos.map((horarioInfo) => (
                        <tr key={horarioInfo.periodo} className="border-b border-green-200/30 dark:border-green-800/30">
                          <td className="p-3 text-sm font-medium text-foreground whitespace-nowrap">
                            {horarioInfo.periodo}
                          </td>
                            {getWeekDays.map((day) => {
                            const eventos = getEventosPorDiaHorario(day.dayName, horarioInfo.periodo)
                            return (
                              <td key={`${day.dayName}-${horarioInfo.periodo}`} className="p-2">
                                {eventos.map((evento: Evento, idx: number) => {
                                  const tipoConfig = getTipoConfig(evento.tipo)
                                  const TipoIcon = tipoConfig.icon
                                  return (
                                    <div
                                      key={idx}
                                      className={`mb-2 p-2 rounded-lg border transition-all duration-300 hover:shadow-md ${
                                        isLiquidGlass
                                          ? 'bg-transparent hover:bg-white/10 dark:hover:bg-gray-800/10 border-green-200/30 dark:border-green-800/30'
                                          : `${tipoConfig.bgColor} ${tipoConfig.borderColor} border hover:shadow-lg`
                                      }`}
                                    >
                                      <div className="flex items-start gap-2">
                                        <div className={`w-6 h-6 rounded-lg ${tipoConfig.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                          <TipoIcon className="h-3 w-3 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="font-semibold text-xs text-foreground truncate">
                                            {evento.titulo}
                                          </div>
                                          <div className="text-xs text-muted-foreground truncate">
                                            {evento.sala}
                                          </div>
                                          {evento.turma && (
                                            <div className="text-xs text-muted-foreground truncate">
                                              {evento.turma}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })}
                              </td>
                            )
                          })}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </LiquidGlassCard>
          
          {/* Calendário Interativo */}
          <LiquidGlassCard
            intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
            className={`relative overflow-hidden rounded-xl border shadow-lg transition-all duration-300 ${
              isLiquidGlass
                ? 'bg-black/30 dark:bg-gray-800/20 border-green-200/30 dark:border-green-700/50'
                : 'bg-gray-50/60 dark:bg-gray-800/40 border-green-200 dark:border-green-700'
            }`}
          >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-500/20 to-transparent rounded-full -translate-y-16 translate-x-16" />
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">Calendário</h2>
                      <p className="text-sm text-muted-foreground">Visualização mensal interativa</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => {
                        if (currentMonth === 0) {
                          setCurrentMonth(11)
                          setCurrentYear(currentYear - 1)
                        } else {
                          setCurrentMonth(currentMonth - 1)
                        }
                      }}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-center px-4">
                      <div className="font-bold text-lg">{monthNames[currentMonth]}</div>
                      <div className="text-sm text-muted-foreground">{currentYear}</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => {
                        if (currentMonth === 11) {
                          setCurrentMonth(0)
                          setCurrentYear(currentYear + 1)
                        } else {
                          setCurrentMonth(currentMonth + 1)
                        }
                      }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Header dos dias da semana */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {diasSemana.map((dia) => (
                    <div key={dia} className="p-3 text-center">
                      <div className="font-bold text-sm text-foreground">{dia}</div>
                    </div>
                  ))}
                </div>

                {/* Grid do calendário */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((dayInfo, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-2xl border transition-all duration-300 cursor-pointer group ${
                        dayInfo
                          ? dayInfo.hasEvents
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 hover:shadow-lg'
                            : 'bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:bg-white/80 dark:hover:bg-gray-800/80'
                          : 'bg-transparent'
                      }`}
                    >
                      {dayInfo ? (
                        <>
                          <div className="font-semibold text-sm mb-2">{dayInfo.day}</div>
                          {dayInfo.hasEvents && (() => {
                            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayInfo.day).padStart(2, '0')}`
                            const eventosDoDia = eventosPorDataCalendario.get(dateStr) || []
                            return (
                              <div className="space-y-1">
                                {eventosDoDia.slice(0, 2).map((evento, idx) => (
                                  <div
                                    key={idx}
                                    className={`text-xs rounded-lg px-2 py-1 ${getTipoConfig(evento.tipo).bgColor} ${getTipoConfig(evento.tipo).borderColor} border`}
                                  >
                                    <div className="font-medium truncate">{evento.titulo}</div>
                                  </div>
                                ))}
                                {eventosDoDia.length > 2 && (
                                  <div className="text-xs text-center text-muted-foreground font-medium">
                                    +{eventosDoDia.length - 2}
                                  </div>
                                )}
                              </div>
                            )
                          })()}
                        </>
                      ) : null}
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-green-200/50 dark:border-green-800/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span>Com eventos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                        <span>Sem eventos</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Evento
                    </Button>
                  </div>
                </div>
              </div>
            </LiquidGlassCard>
        </div>
      </main>
    </div>
  )
}


