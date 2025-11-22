import api from './api'
import { getTeacherClassesWithDetails, TeacherClassDetail, getCurrentUser } from './professor-dashboard'
import { ScheduleWithRelations, LessonPlanWithRelations } from '@/lib/api-client'

export interface Evento {
  hora: string
  titulo: string
  tipo: string
  sala: string
  turma: string
  participantes: number
  descricao: string
  prioridade: string
  cor: string
  data?: string // Data específica do evento (YYYY-MM-DD) - para lesson_plans
}

export type EventosPorDia = Record<string, Evento[]>

// Mapeamento de DayOfWeek do backend para dias abreviados do frontend
const dayOfWeekMap: Record<string, string> = {
  'segunda-feira': 'Seg',
  'terca-feira': 'Ter',
  'quarta-feira': 'Qua',
  'quinta-feira': 'Qui',
  'sexta-feira': 'Sex',
  'sabado': 'Sáb',
  'domingo': 'Dom'
}

// Mapeamento inverso para buscar dia da semana a partir da data
const getDayNameFromDate = (date: Date): string => {
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  return dayNames[date.getDay()]
}

// Formatar horário removendo segundos
const formatTime = (time: string | null | undefined): string => {
  if (!time) return '08:00'
  // Se tiver segundos (HH:mm:ss), remover
  if (time.includes(':') && time.split(':').length === 3) {
    return time.substring(0, 5)
  }
  return time
}

// Formatar horário completo
const formatTimeRange = (startTime: string | null | undefined, endTime: string | null | undefined): string => {
  const start = formatTime(startTime) || '08:00'
  const end = formatTime(endTime) || '10:00'
  return `${start} - ${end}`
}

// Determinar cor baseada em tipo e turma (usar hash simples)
const getCorFromTurma = (turma: string): string => {
  const cores = ['blue', 'green', 'purple', 'orange', 'yellow', 'red', 'teal', 'cyan', 'pink', 'indigo']
  let hash = 0
  for (let i = 0; i < turma.length; i++) {
    hash = turma.charCodeAt(i) + ((hash << 5) - hash)
  }
  return cores[Math.abs(hash) % cores.length]
}

// Converter Schedule para Evento
const mapScheduleToEvento = (schedule: ScheduleWithRelations, classInfo: TeacherClassDetail): Evento => {
  const turma = classInfo.nome || schedule.class.code
  const disciplina = classInfo.disciplina || schedule.class.discipline?.name || 'Disciplina'
  
  return {
    hora: formatTimeRange(schedule.startTime, schedule.endTime),
    titulo: `${disciplina} - ${turma}`,
    tipo: 'Aula',
    sala: schedule.room || 'Não definida',
    turma: turma,
    participantes: classInfo.alunos || 0,
    descricao: `Aula de ${disciplina}`,
    prioridade: 'alta',
    cor: getCorFromTurma(turma)
  }
}

// Converter LessonPlan para Evento
const mapLessonPlanToEvento = (lessonPlan: LessonPlanWithRelations, classInfo: TeacherClassDetail): Evento => {
  const turma = classInfo.nome || lessonPlan.class.code
  const disciplina = classInfo.disciplina || lessonPlan.class.discipline?.name || 'Disciplina'
  
  // Usar horário do schedule se disponível, senão horário padrão
  const hora = lessonPlan.schedule
    ? formatTimeRange(lessonPlan.schedule.startTime, lessonPlan.schedule.endTime)
    : '08:00 - 10:00'
  
  const sala = lessonPlan.schedule?.room || classInfo.sala || 'Não definida'
  
  // Determinar tipo baseado no status
  let tipo = 'Aula'
  if (lessonPlan.status === 'cancelada') {
    tipo = 'Atividade'
  }
  
  // Prioridade baseada no status
  let prioridade = 'média'
  if (lessonPlan.status === 'agendada') {
    prioridade = 'alta'
  } else if (lessonPlan.status === 'realizada') {
    prioridade = 'baixa'
  }
  
  return {
    hora,
    titulo: `${disciplina} - ${turma}`,
    tipo,
    sala,
    turma: turma,
    participantes: classInfo.alunos || 0,
    descricao: lessonPlan.content || `Aula de ${disciplina}`,
    prioridade,
    cor: getCorFromTurma(turma)
  }
}

// Buscar schedules de todas as turmas do professor
export async function getTeacherSchedules(teacherId: string): Promise<ScheduleWithRelations[]> {
  try {
    const classes = await getTeacherClassesWithDetails(teacherId)
    const classIds = classes.map(c => c.id)
    
    if (classIds.length === 0) return []
    
    // Buscar todos os schedules e filtrar pelos IDs das turmas do professor
    // O endpoint findAll retorna schedules com relations completas
    const { data: allSchedules } = await api.get<ScheduleWithRelations[]>('/schedules')
    
    // Filtrar apenas schedules das turmas do professor
    const teacherSchedules = allSchedules.filter(schedule => 
      classIds.includes(schedule.class?.id || '')
    )
    
    // Enriquecer com informações das classes
    const classMap = new Map(classes.map(c => [c.id, c]))
    return teacherSchedules.map(schedule => {
      const classInfo = classMap.get(schedule.class?.id || '')
      if (!classInfo) return schedule
      
      return {
        ...schedule,
        class: {
          ...schedule.class,
          code: classInfo.nome || schedule.class.code,
          discipline: {
            ...schedule.class.discipline,
            name: classInfo.disciplina || schedule.class.discipline?.name || 'Disciplina'
          }
        }
      }
    })
  } catch (error) {
    console.error('Erro ao buscar schedules do professor:', error)
    throw new Error('Não foi possível carregar os horários.')
  }
}

// Buscar lesson_plans de todas as turmas do professor
export async function getTeacherLessonPlans(teacherId: string): Promise<LessonPlanWithRelations[]> {
  try {
    const classes = await getTeacherClassesWithDetails(teacherId)
    const classIds = classes.map(c => c.id)
    
    if (classIds.length === 0) return []
    
    // Buscar todos os lesson_plans e filtrar pelos IDs das turmas do professor
    // O endpoint findAll retorna lesson_plans com relations completas
    const { data: allLessonPlans } = await api.get<LessonPlanWithRelations[]>('/lesson-plans')
    
    // Filtrar apenas lesson_plans das turmas do professor
    const teacherLessonPlans = allLessonPlans.filter(lessonPlan => 
      classIds.includes(lessonPlan.class?.id || '')
    )
    
    // Enriquecer com informações das classes
    const classMap = new Map(classes.map(c => [c.id, c]))
    return teacherLessonPlans.map(lessonPlan => {
      const classInfo = classMap.get(lessonPlan.class?.id || '')
      if (!classInfo) return lessonPlan
      
      return {
        ...lessonPlan,
        class: {
          ...lessonPlan.class,
          code: classInfo.nome || lessonPlan.class.code,
          discipline: {
            ...lessonPlan.class.discipline,
            name: classInfo.disciplina || lessonPlan.class.discipline?.name || 'Disciplina'
          }
        }
      }
    })
  } catch (error) {
    console.error('Erro ao buscar lesson_plans do professor:', error)
    throw new Error('Não foi possível carregar os planos de aula.')
  }
}

// Agrupar schedules por dia da semana
export function groupSchedulesByDay(
  schedules: ScheduleWithRelations[],
  classes: TeacherClassDetail[]
): EventosPorDia {
  const eventosPorDia: EventosPorDia = {
    Seg: [],
    Ter: [],
    Qua: [],
    Qui: [],
    Sex: [],
    Sáb: [],
    Dom: []
  }
  
  // Criar mapa de class.id para classInfo
  const classMap = new Map<string, TeacherClassDetail>()
  classes.forEach(c => classMap.set(c.id, c))
  
  schedules.forEach(schedule => {
    const dayName = dayOfWeekMap[schedule.dayOfWeek]
    if (!dayName) return // Ignorar dias não mapeados
    
    const classInfo = classMap.get(schedule.class.id)
    if (!classInfo) return
    
    const evento = mapScheduleToEvento(schedule, classInfo)
    eventosPorDia[dayName].push(evento)
  })
  
  // Ordenar eventos por horário em cada dia
  Object.keys(eventosPorDia).forEach(day => {
    eventosPorDia[day].sort((a, b) => {
      const timeA = a.hora.split(' - ')[0]
      const timeB = b.hora.split(' - ')[0]
      return timeA.localeCompare(timeB)
    })
  })
  
  return eventosPorDia
}

// Agrupar lesson_plans por data - retorna um mapa de data (YYYY-MM-DD) para eventos
export function groupLessonPlansByDate(
  lessonPlans: LessonPlanWithRelations[],
  classes: TeacherClassDetail[],
  month: number,
  year: number
): Map<string, Evento[]> {
  const eventosPorData = new Map<string, Evento[]>()
  
  // Criar mapa de class.id para classInfo
  const classMap = new Map<string, TeacherClassDetail>()
  classes.forEach(c => classMap.set(c.id, c))
  
  // Filtrar lesson_plans do mês/ano especificado
  const lessonPlansInMonth = lessonPlans.filter(lp => {
    const [lpYear, lpMonth] = lp.date.split('-').map(Number)
    return lpYear === year && lpMonth === month + 1 // month é 0-indexed
  })
  
  lessonPlansInMonth.forEach(lessonPlan => {
    const classInfo = classMap.get(lessonPlan.class.id)
    if (!classInfo) return
    
    const evento = mapLessonPlanToEvento(lessonPlan, classInfo)
    // Adicionar data específica ao evento
    evento.data = lessonPlan.date
    
    // Agrupar por data específica (YYYY-MM-DD)
    if (!eventosPorData.has(lessonPlan.date)) {
      eventosPorData.set(lessonPlan.date, [])
    }
    eventosPorData.get(lessonPlan.date)!.push(evento)
  })
  
  // Ordenar eventos por horário em cada data
  eventosPorData.forEach((eventos, data) => {
    eventos.sort((a, b) => {
      const timeA = a.hora.split(' - ')[0]
      const timeB = b.hora.split(' - ')[0]
      return timeA.localeCompare(timeB)
    })
  })
  
  return eventosPorData
}

// Buscar todos os dados da agenda do professor
export async function getTeacherAgendaData(teacherId: string) {
  try {
    const [classes, schedules, lessonPlans] = await Promise.all([
      getTeacherClassesWithDetails(teacherId),
      getTeacherSchedules(teacherId),
      getTeacherLessonPlans(teacherId)
    ])
    
    return {
      classes,
      schedules,
      lessonPlans
    }
  } catch (error) {
    console.error('Erro ao buscar dados da agenda:', error)
    throw error
  }
}

