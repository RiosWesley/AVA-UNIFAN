import api from './api'
import { getDepartments, getDepartmentTeachers, type Department, type Teacher } from './departmentsService'
import { getCourses, getCourseClasses, type BackendCourse, type BackendClass } from './coursesService'
import { getClassGradebook } from './gradesService'
import { getClassAttendanceTable } from './attendancesService'
import { getCurrentUser } from './professor-dashboard'

export type CoordenadorCurso = {
  id: string
  nome: string
  turmas: number
  alunos: number
  professores: number
  media: number
  frequencia: number
  status: string
  cor: string
}

export type CoordenadorDesempenho = {
  curso: string
  media: number
  frequencia: number
}

export type CoordenadorProfessor = {
  id: string
  nome: string
  disciplina: string
  disponivel: boolean
  carga: string
  especialidade: string
  avaliacao: number
}

export type CoordenadorComunicado = {
  titulo: string
  descricao: string
  data: string
  prioridade: string
}

export type CoordenadorDashboardData = {
  totalCursos: number
  totalTurmas: number
  totalAlunos: number
  totalProfessores: number
  mediaGeral: number
  cursos: CoordenadorCurso[]
  desempenhoData: CoordenadorDesempenho[]
  professores: CoordenadorProfessor[]
  comunicados: CoordenadorComunicado[]
}

function formatDateBR(dateStr?: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatDateTimeBR(dateStr?: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export async function getCoordinatorDepartments(coordinatorId: string): Promise<Department[]> {
  return getDepartments(coordinatorId)
}

export async function getCoursesByDepartments(departmentIds: string[]): Promise<BackendCourse[]> {
  if (departmentIds.length === 0) return []
  
  const allCourses: BackendCourse[] = []
  for (const deptId of departmentIds) {
    try {
      const courses = await getCourses({ departmentId: deptId, status: 'active' })
      allCourses.push(...courses)
    } catch (error) {
      console.error(`Erro ao buscar cursos do departamento ${deptId}:`, error)
    }
  }
  return allCourses
}

async function getClassDetails(classId: string): Promise<{ enrollments: any[], grades: any[], attendances: any[] }> {
  try {
    const [gradebook, attendanceTable] = await Promise.allSettled([
      getClassGradebook(classId),
      getClassAttendanceTable(classId)
    ])

    const enrollments = gradebook.status === 'fulfilled' 
      ? (gradebook.value.entries || []).map(e => ({ id: e.enrollmentId, student: e.student }))
      : []

    const grades = gradebook.status === 'fulfilled'
      ? gradebook.value.entries.flatMap(e => 
          e.grades.filter(g => g.grade).map(g => ({
            enrollmentId: e.enrollmentId,
            score: g.grade!.score
          }))
        )
      : []

    const attendances = attendanceTable.status === 'fulfilled'
      ? (attendanceTable.value || []).map(row => ({
        enrollmentId: row.enrollmentId,
        percentage: row.attendancePercentage || row.presentPercentage || row.percentage || 0
      }))
      : []

    return { enrollments, grades, attendances }
  } catch (error) {
    console.error(`Erro ao buscar detalhes da turma ${classId}:`, error)
    return { enrollments: [], grades: [], attendances: [] }
  }
}

export async function calculateCourseStatistics(courseId: string, semestre?: string): Promise<{
  turmas: number
  alunos: number
  professores: Set<string>
  media: number
  frequencia: number
}> {
  try {
    const classes = await getCourseClasses(courseId)
    
    // Filtrar turmas por semestre se fornecido
    let filteredClasses = classes
    if (semestre) {
      filteredClasses = classes.filter(classe => {
        let classeSemestre: string | undefined
        
        if ((classe as any).academicPeriod?.period) {
          classeSemestre = (classe as any).academicPeriod.period
        } else if (classe.period) {
          const periodParts = classe.period.split('/')
          if (periodParts.length > 0) {
            classeSemestre = periodParts[0].replace('-', '.')
          } else {
            classeSemestre = classe.period.replace('-', '.')
          }
        } else if (classe.semester) {
          classeSemestre = classe.semester.replace('-', '.')
        }
        
        return classeSemestre === semestre
      })
    }
    
    if (filteredClasses.length === 0) {
      return { turmas: 0, alunos: 0, professores: new Set(), media: 0, frequencia: 0 }
    }

    const professoresSet = new Set<string>()
    const allUniqueStudents = new Set<string>() // Alunos únicos em todas as turmas
    const allGrades: number[] = []
    const allFrequencies: number[] = []

    for (const classItem of filteredClasses) {
      if (classItem.teacher?.id) {
        professoresSet.add(classItem.teacher.id)
      }

      const details = await getClassDetails(classItem.id)
      
      // Coletar alunos únicos de todas as turmas (sem duplicatas)
      details.enrollments.forEach(e => {
        if (e.student?.id) {
          allUniqueStudents.add(e.student.id)
        }
      })

      // Coletar notas
      if (details.grades.length > 0) {
        allGrades.push(...details.grades.map(g => g.score))
      }

      // Coletar frequências
      if (details.attendances.length > 0) {
        const avgFreq = details.attendances.reduce((sum, a) => sum + a.percentage, 0) / details.attendances.length
        allFrequencies.push(avgFreq)
      }
    }

    const totalAlunos = allUniqueStudents.size

    const media = allGrades.length > 0
      ? allGrades.reduce((sum, g) => sum + g, 0) / allGrades.length
      : 0

    const frequencia = allFrequencies.length > 0
      ? allFrequencies.reduce((sum, f) => sum + f, 0) / allFrequencies.length
      : 0

    return {
      turmas: filteredClasses.length,
      alunos: totalAlunos,
      professores: professoresSet,
      media: Math.round(media * 10) / 10,
      frequencia: Math.round(frequencia * 10) / 10
    }
  } catch (error) {
    console.error(`Erro ao calcular estatísticas do curso ${courseId}:`, error)
    return { turmas: 0, alunos: 0, professores: new Set(), media: 0, frequencia: 0 }
  }
}

function getStatusFromMedia(media: number): string {
  if (media >= 8.0) return 'Excelente'
  if (media >= 7.0) return 'Bom'
  if (media >= 6.0) return 'Regular'
  return 'Atenção'
}

function getColorFromStatus(status: string): string {
  if (status === 'Excelente') return 'emerald'
  if (status === 'Bom') return 'green'
  if (status === 'Regular') return 'yellow'
  return 'orange'
}

export async function getTeachersByDepartments(departmentIds: string[]): Promise<CoordenadorProfessor[]> {
  if (departmentIds.length === 0) return []

  const allTeachers: CoordenadorProfessor[] = []
  const teacherMap = new Map<string, CoordenadorProfessor>()

  for (const deptId of departmentIds) {
    try {
      const teachers = await getDepartmentTeachers(deptId)
      
      for (const teacher of teachers) {
        if (!teacherMap.has(teacher.id)) {
          // Buscar turmas do professor para determinar disponibilidade e carga
          try {
            const { data: classes } = await api.get<BackendClass[]>(`/classes/teacher/${teacher.id}`)
            const totalClasses = classes?.length || 0
            const disponivel = totalClasses < 5 // Considera disponível se tiver menos de 5 turmas
            const carga = `${totalClasses * 4}h/sem` // Estimativa: 4h por turma por semana
            
            // Buscar disciplina mais comum
            const disciplines = classes?.map(c => c.discipline?.name || '').filter(Boolean) || []
            const disciplina = disciplines[0] || 'Não definida'
            const especialidade = disciplines[0] || 'Geral'

            teacherMap.set(teacher.id, {
              id: teacher.id,
              nome: teacher.name,
              disciplina,
              disponivel,
              carga,
              especialidade,
              avaliacao: 4.5 + Math.random() * 0.5 // Placeholder: entre 4.5 e 5.0
            })
          } catch (error) {
            // Se falhar, usar valores padrão
            teacherMap.set(teacher.id, {
              id: teacher.id,
              nome: teacher.name,
              disciplina: 'Não definida',
              disponivel: true,
              carga: '0h/sem',
              especialidade: 'Geral',
              avaliacao: 4.5
            })
          }
        }
      }
    } catch (error) {
      console.error(`Erro ao buscar professores do departamento ${deptId}:`, error)
    }
  }

  return Array.from(teacherMap.values())
}

export async function getCoordinatorNotices(): Promise<CoordenadorComunicado[]> {
  try {
    // Tentar buscar comunicados para coordenadores
    const { data } = await api.get<Array<{
      id: string
      title: string
      content: string
      createdAt: string
      priority?: string
    }>>('/notice-board', {
      params: { audience: 'coordinator' }
    }).catch(() => {
      // Se não houver endpoint específico, buscar todos e filtrar
      return api.get<Array<{
        id: string
        title: string
        content: string
        createdAt: string
        priority?: string
      }>>('/notice-board')
    })

    const notices = Array.isArray(data) ? data : []
    
    return notices.slice(0, 5).map(notice => ({
      titulo: notice.title,
      descricao: notice.content || '',
      data: formatDateTimeBR(notice.createdAt),
      prioridade: notice.priority === 'high' ? 'Alta' : notice.priority === 'medium' ? 'Média' : 'Baixa'
    }))
  } catch (error) {
    console.error('Erro ao buscar comunicados:', error)
    return []
  }
}

export async function getCoordinatorDashboardData(coordinatorId: string, semestre?: string): Promise<CoordenadorDashboardData> {
  // Buscar departamentos do coordenador
  const departments = await getCoordinatorDepartments(coordinatorId)
  const departmentIds = departments.map(d => d.id)

  if (departmentIds.length === 0) {
    return {
      totalCursos: 0,
      totalTurmas: 0,
      totalAlunos: 0,
      totalProfessores: 0,
      mediaGeral: 0,
      cursos: [],
      desempenhoData: [],
      professores: [],
      comunicados: []
    }
  }

  // Buscar cursos, professores e comunicados em paralelo
  const [courses, teachers, notices] = await Promise.all([
    getCoursesByDepartments(departmentIds),
    getTeachersByDepartments(departmentIds),
    getCoordinatorNotices()
  ])

  // Calcular estatísticas de cada curso
  const cursosComEstatisticas: CoordenadorCurso[] = []
  const allGrades: number[] = []
  const allFrequencies: number[] = []
  let totalTurmas = 0
  let totalAlunos = 0
  const allTeacherIds = new Set<string>()

  for (const course of courses) {
    const stats = await calculateCourseStatistics(course.id, semestre)
    
    totalTurmas += stats.turmas
    totalAlunos += stats.alunos
    stats.professores.forEach(id => allTeacherIds.add(id))
    
    if (stats.media > 0) {
      // Para média do curso, usar a média calculada
      allGrades.push(stats.media)
    }
    if (stats.frequencia > 0) {
      allFrequencies.push(stats.frequencia)
    }

    const status = getStatusFromMedia(stats.media)
    const cor = getColorFromStatus(status)

    cursosComEstatisticas.push({
      id: course.id,
      nome: course.name,
      turmas: stats.turmas,
      alunos: stats.alunos,
      professores: stats.professores.size,
      media: stats.media,
      frequencia: stats.frequencia,
      status,
      cor
    })
  }

  // Calcular média geral
  const mediaGeral = allGrades.length > 0
    ? allGrades.reduce((sum, g) => sum + g, 0) / allGrades.length
    : 0

  // Preparar dados de desempenho para gráfico
  const desempenhoData: CoordenadorDesempenho[] = cursosComEstatisticas.map(curso => ({
    curso: curso.nome.length > 10 ? curso.nome.substring(0, 10) : curso.nome,
    media: curso.media,
    frequencia: curso.frequencia
  }))

  return {
    totalCursos: courses.length,
    totalTurmas,
    totalAlunos,
    totalProfessores: allTeacherIds.size,
    mediaGeral: Math.round(mediaGeral * 10) / 10,
    cursos: cursosComEstatisticas,
    desempenhoData,
    professores: teachers,
    comunicados: notices
  }
}

/**
 * Obtém a lista de semestres disponíveis para um coordenador
 * @param coordinatorId ID do coordenador
 * @returns Array de objetos com id e nome do semestre
 */
export const getSemestresDisponiveisCoordenador = async (coordinatorId: string): Promise<Array<{ id: string; nome: string; ativo: boolean }>> => {
  try {
    // Buscar departamentos do coordenador
    const departments = await getCoordinatorDepartments(coordinatorId)
    const departmentIds = departments.map(d => d.id)
    
    if (departmentIds.length === 0) {
      return []
    }

    // Buscar cursos dos departamentos
    const courses = await getCoursesByDepartments(departmentIds)
    
    // Buscar turmas de todos os cursos e extrair semestres únicos
    const semestresMap = new Map<string, { id: string; nome: string; ativo: boolean }>()
    
    for (const course of courses) {
      try {
        const classes = await getCourseClasses(course.id)
        
        classes.forEach(classe => {
          // Tentar obter semestre de academicPeriod.period, period ou semester
          let semestreId: string | undefined
          
          if ((classe as any).academicPeriod?.period) {
            semestreId = (classe as any).academicPeriod.period
          } else if (classe.period) {
            // Extrair semestre do formato "2025-1/2025" ou similar
            const periodParts = classe.period.split('/')
            if (periodParts.length > 0) {
              semestreId = periodParts[0].replace('-', '.')
            } else {
              semestreId = classe.period.replace('-', '.')
            }
          } else if (classe.semester) {
            semestreId = classe.semester.replace('-', '.')
          }
          
          if (semestreId) {
            // Normalizar formato para "2025.1"
            const normalized = semestreId.replace('-', '.')
            
            if (!semestresMap.has(normalized)) {
              semestresMap.set(normalized, {
                id: normalized,
                nome: normalized,
                ativo: false
              })
            }
          }
        })
      } catch (error) {
        console.error(`Erro ao buscar turmas do curso ${course.id}:`, error)
      }
    }
    
    // Ordenar semestres (mais recente primeiro) e marcar o primeiro como ativo
    const semestres = Array.from(semestresMap.values()).sort((a, b) => {
      const [yearA, semA] = a.id.split('.').map(Number)
      const [yearB, semB] = b.id.split('.').map(Number)
      if (yearA !== yearB) return yearB - yearA
      return semB - semA
    })
    
    if (semestres.length > 0) {
      semestres[0].ativo = true
    }
    
    return semestres
  } catch (error) {
    console.error("Erro ao buscar semestres disponíveis:", error)
    return []
  }
}

