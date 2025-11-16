// Base API client configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://c93a05d2bbc9.ngrok-free.app'
import api from '@/src/services/api'

// Type definitions
export interface Student {
  id: string
  name: string
  email: string
  studentId: string
  course: string
  period: string
}

export interface Schedule {
  id: string
  classId: string
  discipline: string
  professor: string
  room: string
  startTime: string
  endTime: string
  dayOfWeek: number
  type: 'Teórica' | 'Prática'
}

export interface Grade {
  id: string
  discipline: string
  value: number
  date: string
  concept: string
  classId: string
}

export interface Attendance {
  id: string
  classId: string
  date: string
  status: 'present' | 'absent' | 'justified'
  discipline: string
}

export interface Activity {
  id: string
  title: string
  description: string
  discipline: string
  dueDate: string
  status: 'pending' | 'completed'
  classId: string
}

export interface News {
  id: string
  title: string
  date: string
  type: 'Avaliação' | 'Atividade' | 'Evento'
  priority: 'alta' | 'média' | 'baixa'
}

export interface Enrollment {
  id: string
  studentId: string
  classId: string
  disciplineId: string
  status: 'active' | 'completed' | 'cancelled'
}

// Backend enrollment response shape with relations
export interface EnrollmentWithRelations {
  id: string
  student: { id: string }
  class: { id: string; discipline: { id: string; name?: string } }
}

// New types for class/discipline integrations
export interface Notice {
  id: string
  title: string
  content: string
  createdAt: string
  authorName?: string
}

export interface MaterialItem {
  id: string
  title?: string
  name?: string
  type?: string
  sizeBytes?: number
  uploadedAt?: string
  createdAt?: string
  fileUrl: string[]
}

export interface ClassActivity {
  id: string
  title: string
  description: string
  dueDate: string
  status?: 'pending' | 'in_progress' | 'completed'
  grade?: number | null
}

export interface ActivitySubmissionStatus {
  activityId: string
  studentId: string
  status: 'not_submitted' | 'submitted' | 'graded' | 'completed' | 'pending' | 'PENDING' | 'SUBMITTED' | 'GRADED' | 'COMPLETED'
  submittedAt?: string
  grade?: number | null
}

export interface Forum {
  id: string
  title: string
  description: string
  authorName?: string
  createdBy?: { id: string; name: string }
  createdAt: string
  postsCount?: number
}

export interface ForumPost {
  id: string
  forumId: string
  authorName: string
  content: string
  createdAt: string
  parentPostId?: string | null
}

// ---------- Chat ----------
export interface ChatThread {
  id: string
  classId: string
  professorName: string
  discipline: string
  lastMessageAt: string | null
  unreadCount?: number
}

export interface ChatMessage {
  id: string
  author: 'prof' | 'aluno'
  content: string
  sentAt: string
}

export interface VideoLesson {
  id: string
  title: string
  description?: string
  durationSeconds?: number
  watched?: boolean
  videoUrl?: string // Legado - não usar mais
  status?: string
  visibility?: string
  mimeType?: string
  sizeBytes?: number
  createdAt?: string
  teacher?: { id: string; name?: string }
  attachmentUrls?: string[]
}

export interface ClassDetail {
  id: string
  code: string
  semester: string
  year: number
  discipline: { id: string; name: string }
  teacher?: { id: string; name: string } | null
}

// API client with mock data
export const apiClient = {
  // Student data
  async getCurrentStudent(): Promise<Student> {
    const meResp = await api.get<{ id: string; email: string; roles: string[] }>('/auth/me')
    const userId = meResp.data.id

    const userResp = await api.get<{ id: string; name: string; email: string }>(`/users/${userId}`)
    const user = userResp.data

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      studentId: '',
      course: '',
      period: ''
    }
  },

  // Schedules
  async getStudentSchedules(studentId: string): Promise<Schedule[]> {
    const { data } = await api.get<Array<{
      id: string
      code: string
      disciplineName: string
      dayOfWeek: string
      startTime: string
      endTime: string
      room: string | null
      date: string
    }>>(`/students/${studentId}/next-classes`)

    return (data || []).map((item) => ({
      id: item.id,
      classId: '',
      discipline: item.disciplineName,
      professor: '',
      room: item.room || '',
      startTime: item.startTime,
      endTime: item.endTime,
      dayOfWeek: 0,
      type: 'Teórica'
    }))
  },

  // Grades
  async getStudentGrades(studentId: string): Promise<Grade[]> {
    const { data } = await api.get<Array<{
      id: string
      activityTitle: string
      disciplineName: string
      score: number
      maxScore: number | null
      gradedAt: string | null
    }>>(`/students/${studentId}/recent-grades`, { params: { limit: 10 } })

    const toConcept = (value: number): string => {
      if (value >= 9) return 'Excelente'
      if (value >= 8) return 'Ótimo'
      if (value >= 6) return 'Bom'
      return 'Regular'
    }

    return (data || []).map((g) => ({
      id: g.id,
      discipline: g.disciplineName || '',
      value: Number(g.score),
      date: g.gradedAt || '',
      concept: toConcept(Number(g.score)),
      classId: ''
    }))
  },

  // Attendance
  async getStudentAttendance(studentId: string): Promise<Attendance[]> {
    const { data } = await api.get<Array<{
      id: string
      date: string
      present: boolean
    }>>(`/attendances/student/${studentId}`)

    return (data || []).map((a) => ({
      id: a.id,
      classId: '',
      date: a.date,
      status: a.present ? 'present' : 'absent',
      discipline: ''
    }))
  },

  // Activities
  async getStudentActivities(studentId: string): Promise<Activity[]> {
    const { data } = await api.get<Array<{
      id: string
      titulo: string
      descricao: string | null
      dataVencimento: string | null
      disciplina: string
      status: 'pendente' | 'concluido' | 'avaliado'
      nota: number | null
      dataConclusao: string | null
    }>>(`/activities/students/${studentId}`)

    const mapStatus = (s: 'pendente' | 'concluido' | 'avaliado'): 'pending' | 'completed' => {
      if (s === 'pendente') return 'pending'
      return 'completed'
    }

    return (data || []).map((a) => ({
      id: a.id,
      title: a.titulo,
      description: a.descricao || '',
      discipline: a.disciplina,
      dueDate: a.dataVencimento ? String(a.dataVencimento) : '',
      status: mapStatus(a.status),
      classId: ''
    }))
  },

  // News
  async getNews(): Promise<News[]> {
    // TODO: Replace with actual API call
    return [
      { id: '1', title: 'Prova de Matemática', date: '2024-03-20', type: 'Avaliação', priority: 'alta' },
      { id: '2', title: 'Entrega do Projeto de História', date: '2024-03-25', type: 'Atividade', priority: 'média' },
      { id: '3', title: 'Reunião de Pais', date: '2024-03-30', type: 'Evento', priority: 'baixa' }
    ]
  },

  async getNewsForStudent(studentId: string): Promise<News[]> {
    const notices = await this.getNoticesForStudent(studentId)
    return (notices || []).map((n) => ({
      id: n.id,
      title: n.title,
      date: n.createdAt,
      type: 'Evento',
      priority: 'média'
    }))
  },

  // Enrollments
  async getStudentEnrollments(studentId: string): Promise<Enrollment[]> {
    const { data } = await api.get<EnrollmentWithRelations[]>(`/enrollments`, {
      params: { studentId }
    })
    // Normalize to simplified type
    return data.map((e) => ({
      id: e.id,
      studentId: e.student?.id,
      classId: e.class?.id,
      disciplineId: e.class?.discipline?.id,
      status: 'active'
    })) as Enrollment[]
  },

  async getStudentEnrollmentsWithRelations(studentId: string): Promise<EnrollmentWithRelations[]> {
    const { data } = await api.get<EnrollmentWithRelations[]>(`/enrollments`, {
      params: { studentId }
    })
    return data
  },

  async resolveClassIdByDisciplineForStudent(disciplineId: string, studentId: string): Promise<string> {
    const enrollments = await this.getStudentEnrollmentsWithRelations(studentId)
    const match = enrollments.find((e) => e.class?.discipline?.id === disciplineId)
    if (!match || !match.class?.id) {
      throw new Error('Nenhuma turma encontrada para a disciplina informada.')
    }
    return match.class.id
  },

  // -------- New: Class/Discipline integrations --------
  async getNoticesByClass(classId: string): Promise<Notice[]> {
    const { data } = await api.get<Notice[]>(`/notice-board/class/${classId}`)
    return data
  },

  async getNoticesForStudent(studentId: string): Promise<Notice[]> {
    // Preferir endpoint agregador do backend
    const { data } = await api.get<Notice[]>(`/notice-board/student/${studentId}`)
    // Garantir ordenação DESC
    return [...data].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
  },

  async getMaterialsByClass(classId: string): Promise<MaterialItem[]> {
    const { data } = await api.get<MaterialItem[]>(`/materials/class/${classId}`)
    return data
  },

  async downloadMaterialAttachment(materialId: string, attachmentUrl: string): Promise<void> {
    try {
      const response = await api.get(`/materials/${materialId}/attachments/download`, {
        params: { attachmentUrl },
        responseType: 'blob',
      })
      
      // Função para extrair o nome original do arquivo (remove timestamp e nanoid)
      const extractOriginalFileName = (fileName: string): string => {
        // Formato: timestamp-nanoid-nomeOriginal
        const parts = fileName.split('-')
        if (parts.length >= 3) {
          // Remove os dois primeiros elementos (timestamp e nanoid)
          return parts.slice(2).join('-')
        }
        return fileName
      }
      
      // Extrai o nome do arquivo do header Content-Disposition ou da URL
      const contentDisposition = response.headers['content-disposition']
      let fileName = 'material'
      
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?(.+?)"?$/i)
        if (fileNameMatch) {
          fileName = decodeURIComponent(fileNameMatch[1])
          fileName = extractOriginalFileName(fileName)
        }
      } else {
        // Fallback: tenta extrair da URL
        try {
          const url = new URL(attachmentUrl)
          const rawFileName = decodeURIComponent(url.pathname.split('/').pop() || 'material')
          fileName = extractOriginalFileName(rawFileName)
        } catch {
          const rawFileName = attachmentUrl.split('/').pop() || 'material'
          fileName = extractOriginalFileName(rawFileName)
        }
      }
      
      // Cria um link temporário para download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao fazer download do anexo:', error)
      throw new Error('Não foi possível fazer download do arquivo.')
    }
  },

  async getActivitiesByClass(classId: string): Promise<ClassActivity[]> {
    const { data } = await api.get<ClassActivity[]>(`/activities/class/${classId}`)
    return data
  },

  async uploadActivitySubmission(params: {
    studentId: string
    activityId: string
    file: File
    comment?: string
  }): Promise<{ id: string; fileName: string }> {
    const formData = new FormData()
    // Backend espera campo 'files' (array); enviar único arquivo também é aceito
    formData.append('files', params.file)
    if (params.comment) formData.append('comment', params.comment)

    const { data } = await api.post<{ id: string; fileName: string }>(
      `/activities/students/${params.studentId}/activities/${params.activityId}/submissions/upload`,
      formData
    )
    return data
  },

  async getActivitySubmissionStatus(activityId: string, studentId: string): Promise<ActivitySubmissionStatus> {
    const { data } = await api.get<any>(`/activities/${activityId}/submissions/students/${studentId}`)
    const normalized: ActivitySubmissionStatus = {
      activityId: data?.activityId || data?.activity?.id || activityId,
      studentId: data?.studentId || data?.student?.id || studentId,
      status: data?.status,
      submittedAt: (data?.submittedAt || data?.submitted_at) ?? undefined,
      grade: data?.grade ?? null,
    }
    return normalized
  },

  async getForumsByClass(classId: string): Promise<Forum[]> {
    const { data } = await api.get<Forum[]>(`/forums/class/${classId}`)
    return data
  },

  async getForumPostsByForumId(forumId: string): Promise<ForumPost[]> {
    const { data } = await api.get<ForumPost[]>(`/forum-posts/forum/${forumId}`)
    return data
  },

  async createForumPost(params: { userId: string; forumId: string; content: string; parentPostId?: string | null }): Promise<ForumPost> {
    const body = {
      userId: params.userId,
      forumId: params.forumId,
      content: params.content,
      ...(params.parentPostId ? { parentPostId: params.parentPostId } : {})
    }
    const { data } = await api.post<ForumPost>(`/forum-posts`, body)
    return data
  },

  async getVideoLessonsByClass(classId: string): Promise<VideoLesson[]> {
    try {
      const { data } = await api.get<VideoLesson[]>(`/video-lessons/classes/${classId}/video-lessons`)
      return data
    } catch (err: any) {
      const status = err?.response?.status
      // Fallback para endpoint legado sem guard
      if (status === 401 || status === 403 || status === 404) {
        const { data } = await api.get<VideoLesson[]>(`/video-lessons/class/${classId}`)
        return data as any
      }
      throw err
    }
  },

  async getVideoLessonStreamUrl(classId: string, videoLessonId: string): Promise<{ url: string; expiresInSeconds: number; mimeType: string }> {
    try {
      const { data } = await api.get<{ url: string; expiresInSeconds: number; mimeType: string }>(
        `/video-lessons/classes/${classId}/video-lessons/${videoLessonId}/stream-url`
      )
      return data
    } catch (err) {
      // Sem fallback direto para stream-url legado; propaga erro
      throw err
    }
  },

  async markVideoLessonWatched(videoId: string, studentId: string): Promise<void> {
    await api.patch<void>(`/video-lessons/${videoId}/watched`, undefined, {
      params: { studentId }
    })
  },

  // -------- Classes --------
  async getClassDetails(classId: string): Promise<ClassDetail> {
    const { data } = await api.get<ClassDetail>(`/classes/${classId}`)
    return data
  },

  // -------- Chats --------
  async getChatThreads(studentId: string): Promise<ChatThread[]> {
    const { data } = await api.get<ChatThread[]>(`/chats/students/${studentId}/threads`)
    return data
  },

  async getChatMessages(studentId: string, classId: string): Promise<ChatMessage[]> {
    const { data } = await api.get<ChatMessage[]>(`/chats/students/${studentId}/classes/${classId}/messages`)
    return data
  },

  async sendChatMessage(params: { studentId: string; classId: string; content: string }): Promise<ChatMessage> {
    const { data } = await api.post<ChatMessage>(`/chats/students/${params.studentId}/classes/${params.classId}/messages`, {
      content: params.content
    })
    return data
  }
}

// Utility functions for calculations
export const calculateStudentMetrics = {
  // Calculate overall attendance percentage
  calculateAttendancePercentage(attendances: Attendance[]): number {
    if (attendances.length === 0) return 0
    const presentCount = attendances.filter(a => a.status === 'present').length
    return Math.round((presentCount / attendances.length) * 100)
  },

  // Calculate overall grade average
  calculateGradeAverage(grades: Grade[]): number {
    if (grades.length === 0) return 0
    const sum = grades.reduce((acc, grade) => acc + grade.value, 0)
    return parseFloat((sum / grades.length).toFixed(1))
  },

  // Count pending activities
  countPendingActivities(activities: Activity[]): number {
    return activities.filter(a => a.status === 'pending').length
  },

  // Get upcoming classes (next 7 days)
  getUpcomingSchedules(schedules: Schedule[]): Schedule[] {
    const now = new Date()
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    // TODO: Implement actual filtering based on date
    // For now, return first 3 schedules
    return schedules.slice(0, 3)
  }
}