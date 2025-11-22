"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from '@/components/layout/sidebar'
import { LiquidGlassCard } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { Calendar, Clock, Plus, BookOpen, Zap, Trophy, Sparkles, ChevronLeft, ChevronRight, CheckCircle, Info, Bell } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useStudentAgendaSchedules, useStudentAgendaLessonPlans } from '@/hooks/use-dashboard'
import { type ScheduleWithRelations, type LessonPlanWithRelations } from '@/lib/api-client'
import { me } from "@/src/services/auth"
import { PageSpinner } from "@/components/ui/page-spinner"

interface Evento {
  hora: string
  titulo: string
  tipo: string
  sala: string
  professor: string
  participantes: number
  descricao: string
  prioridade: string
  cor: string
}

interface DayInfo {
  day: number
  hasEvents: boolean
  dayName: string
}

type EventosPorDia = Record<string, Evento[]>

export default function AgendaPage() {
  const [isLiquidGlass, setIsLiquidGlass] = useState(false)
  const [selectedDay, setSelectedDay] = useState('Ter')
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0)
  const [studentId, setStudentId] = useState<string | null>(null)
  const router = useRouter()

  // Buscar dados do aluno
  const { data: schedulesData = [], isLoading: isLoadingSchedules } = useStudentAgendaSchedules(studentId ?? "")
  const { data: lessonPlansData = [], isLoading: isLoadingLessonPlans } = useStudentAgendaLessonPlans(studentId ?? "")

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

  useEffect(() => {
    const init = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("ava:token") : null
      if (!token) {
        router.push("/")
        return
      }
      const storedUserId = localStorage.getItem("ava:userId")
      if (storedUserId) {
        setStudentId(storedUserId)
        return
      }
      try {
        const current = await me()
        if (current?.id) {
          localStorage.setItem("ava:userId", current.id)
          setStudentId(current.id)
        }
      } catch {
        router.push("/")
      }
    }
    init()
  }, [router])

  const diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
  const diasSemanaGrade = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  // Mapeamento de DayOfWeek para dia abreviado
  const dayOfWeekMap: Record<string, string> = {
    'segunda-feira': 'Seg',
    'terca-feira': 'Ter',
    'quarta-feira': 'Qua',
    'quinta-feira': 'Qui',
    'sexta-feira': 'Sex',
    'sabado': 'Sáb',
    'domingo': 'Dom'
  }

  // Função para mapear Schedule para Evento
  const mapScheduleToEvento = (schedule: ScheduleWithRelations): Evento => {
    return {
      hora: `${schedule.startTime} - ${schedule.endTime}`,
      titulo: schedule.class.discipline.name,
      tipo: 'Aula',
      sala: schedule.room || '',
      professor: schedule.class.teacher?.name || '',
      participantes: 0,
      descricao: schedule.class.discipline.name,
      prioridade: 'média',
      cor: 'green'
    }
  }

  // Função para mapear LessonPlan para Evento
  const mapLessonPlanToEvento = (lessonPlan: LessonPlanWithRelations): Evento => {
    const hora = lessonPlan.schedule 
      ? `${lessonPlan.schedule.startTime} - ${lessonPlan.schedule.endTime}`
      : ''
    const sala = lessonPlan.schedule?.room || ''
    
    let prioridade: 'alta' | 'média' | 'baixa' = 'média'
    if (lessonPlan.status === 'agendada') prioridade = 'média'
    else if (lessonPlan.status === 'realizada') prioridade = 'baixa'
    else if (lessonPlan.status === 'cancelada') prioridade = 'baixa'

    return {
      hora,
      titulo: lessonPlan.class.discipline.name,
      tipo: 'Aula',
      sala,
      professor: lessonPlan.class.teacher?.name || '',
      participantes: 0,
      descricao: lessonPlan.content,
      prioridade,
      cor: 'green'
    }
  }

  // Agrupar schedules por dia da semana
  const eventosPorDiaFromSchedules: EventosPorDia = useMemo(() => {
    const eventos: EventosPorDia = {
      Seg: [],
      Ter: [],
      Qua: [],
      Qui: [],
      Sex: [],
      Sáb: [],
      Dom: []
    }

    schedulesData.forEach(schedule => {
      const diaAbreviado = dayOfWeekMap[schedule.dayOfWeek.toLowerCase()]
      if (diaAbreviado && eventos[diaAbreviado as keyof EventosPorDia]) {
        eventos[diaAbreviado as keyof EventosPorDia].push(mapScheduleToEvento(schedule))
      }
    })

    return eventos
  }, [schedulesData])

  // Agrupar lesson plans por data para o calendário
  const eventosPorDiaFromLessonPlans: EventosPorDia = useMemo(() => {
    const eventos: EventosPorDia = {
      Seg: [],
      Ter: [],
      Qua: [],
      Qui: [],
      Sex: [],
      Sáb: [],
      Dom: []
    }

    lessonPlansData.forEach(lessonPlan => {
      const date = new Date(lessonPlan.date)
      const dayOfWeek = date.getDay()
      const dayName = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][dayOfWeek] as keyof EventosPorDia
      
      if (dayName && eventos[dayName]) {
        eventos[dayName].push(mapLessonPlanToEvento(lessonPlan))
      }
    })

    return eventos
  }, [lessonPlansData])

  // Para a grade horária, usar schedules
  const eventosPorDia: EventosPorDia = eventosPorDiaFromSchedules

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
      case 'Laboratório':
        return {
          icon: Zap,
          color: 'bg-gradient-to-r from-green-500 to-emerald-500',
          textColor: 'text-green-700 dark:text-green-300',
          bgColor: 'bg-green-100 dark:bg-green-900/50',
          borderColor: 'border-green-200 dark:border-green-800'
        }
      case 'Evento':
        return {
          icon: Trophy,
          color: 'bg-gradient-to-r from-green-500 to-emerald-500',
          textColor: 'text-green-700 dark:text-green-300',
          bgColor: 'bg-green-100 dark:bg-green-900/50',
          borderColor: 'border-green-200 dark:border-green-800'
        }
      case 'Prática':
        return {
          icon: Sparkles,
          color: 'bg-gradient-to-r from-green-500 to-emerald-500',
          textColor: 'text-green-700 dark:text-green-300',
          bgColor: 'bg-green-100 dark:bg-green-900/50',
          borderColor: 'border-green-200 dark:border-green-800'
        }
      case 'Atividade':
        return {
          icon: CheckCircle,
          color: 'bg-gradient-to-r from-green-500 to-emerald-500',
          textColor: 'text-green-700 dark:text-green-300',
          bgColor: 'bg-green-100 dark:bg-green-900/50',
          borderColor: 'border-green-200 dark:border-green-800'
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
  // Retorna apenas horários que realmente têm eventos na semana atual
  const getHorariosUnicos = useMemo(() => {
    const horariosMap = new Map<string, { periodo: string; startTime: string; endTime: string }>()
    
    // Percorrer apenas os dias da semana atual (não todos os dias)
    getWeekDays.forEach(day => {
      const eventosDoDia = eventosPorDia[day.dayName] || []
      eventosDoDia.forEach(evento => {
        if (evento.hora) {
          const [startTime, endTime] = evento.hora.split(' - ')
          if (startTime && endTime) {
            // Usar o período completo como chave única
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
  }, [eventosPorDia, getWeekDays])

  // Função para obter eventos de um dia e período específicos
  const getEventosPorDiaHorario = (dayName: string, periodo: string) => {
    const eventos = eventosPorDia[dayName] || []
    return eventos.filter(evento => evento.hora === periodo)
  }

  // Memoized calendar days to avoid recalculation on every render
  const calendarDays: (DayInfo | null)[] = useMemo(() => {
    const days: (DayInfo | null)[] = []
    const firstDay = new Date(currentYear, currentMonth, 1).getDay()
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate()

    // Empty cells for days before month starts
    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
      days.push(null)
    }

    // Days of the month
    for (let day = 1; day <= lastDay; day++) {
      const dayOfWeek = new Date(currentYear, currentMonth, day).getDay()
      const dayName = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][dayOfWeek]
      
      // Verificar se há lesson plans nesta data
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const hasEvents = lessonPlansData.some(lp => {
        const lpDate = new Date(lp.date)
        const lpDateStr = `${lpDate.getFullYear()}-${String(lpDate.getMonth() + 1).padStart(2, '0')}-${String(lpDate.getDate()).padStart(2, '0')}`
        return lpDateStr === dateStr
      })
      
      days.push({ day, hasEvents, dayName })
    }

    return days
  }, [currentYear, currentMonth, lessonPlansData])

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

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

  // Loading state
  if (isLoadingSchedules || isLoadingLessonPlans || !studentId) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar userRole="aluno" />
        <main className="flex-1 overflow-y-auto">
          <PageSpinner />
        </main>
      </div>
    )
  }

  return (
    <div className={`flex h-screen ${isLiquidGlass ? 'bg-gray-50/30 dark:bg-gray-900/20' : 'bg-background'}`}>
      <Sidebar userRole="aluno" />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-8">
          {/* Header Hero Section */}
          <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm ${
            isLiquidGlass
              ? 'bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-green-500/20 dark:from-green-900/30 dark:via-emerald-900/30 dark:to-green-900/30 border-green-200/30 dark:border-green-700/50'
              : 'bg-gray-50/60 dark:bg-gray-800/40 from-green-50 to-emerald-50 dark:from-gray-800/40 dark:to-gray-900/40 border-gray-200 dark:border-gray-700'
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
                    Organize suas aulas, eventos e compromissos acadêmicos
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
                                {eventos.map((evento, idx) => {
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
                                          {evento.professor && (
                                            <div className="text-xs text-muted-foreground truncate">
                                              {evento.professor}
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
                      } ${
                        selectedDay === dayInfo?.dayName ? 'ring-2 ring-green-500 shadow-lg' : ''
                      }`}
                      onClick={() => dayInfo?.dayName && setSelectedDay(dayInfo.dayName)}
                    >
                      {dayInfo ? (
                        <>
                          <div className="font-semibold text-sm mb-2">{dayInfo.day}</div>
                          {dayInfo.hasEvents && (() => {
                            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayInfo.day).padStart(2, '0')}`
                            const eventosDoDia = lessonPlansData
                              .filter(lp => {
                                const lpDate = new Date(lp.date)
                                const lpDateStr = `${lpDate.getFullYear()}-${String(lpDate.getMonth() + 1).padStart(2, '0')}-${String(lpDate.getDate()).padStart(2, '0')}`
                                return lpDateStr === dateStr
                              })
                              .map(lp => mapLessonPlanToEvento(lp))
                            
                            return (
                              <div className="space-y-1">
                                {eventosDoDia.slice(0, 2).map((evento: Evento, idx: number) => (
                                  <div
                                    key={idx}
                                    className={`text-xs rounded-lg px-2 py-1 ${getTipoConfig(evento.tipo).bgColor} ${getTipoConfig(evento.tipo).borderColor} border`}
                                  >
                                    <div className="font-medium truncate">{evento.titulo}</div>
                                    {evento.hora && (
                                      <div className="text-xs opacity-75">{evento.hora.slice(0, 5)}</div>
                                    )}
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
