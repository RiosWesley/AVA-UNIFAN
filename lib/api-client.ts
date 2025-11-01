// Base API client configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://c93a05d2bbc9.ngrok-free.app'

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

// API client with mock data
export const apiClient = {
  // Student data
  async getCurrentStudent(): Promise<Student> {
    // TODO: Replace with actual API call
    return {
      id: '1',
      name: 'João Silva',
      email: 'joao.silva@email.com',
      studentId: '2024001',
      course: 'Ciência da Computação',
      period: '2024.1'
    }
  },

  // Schedules
  async getStudentSchedules(studentId: string): Promise<Schedule[]> {
    // TODO: Replace with actual API call
    // This should aggregate from enrollments → classes → schedules
    return [
      {
        id: '1',
        classId: 'class-1',
        discipline: 'Matemática',
        professor: 'Prof. Carlos Silva',
        room: 'A-101',
        startTime: '08:00',
        endTime: '09:40',
        dayOfWeek: 1,
        type: 'Teórica'
      },
      {
        id: '2',
        classId: 'class-2',
        discipline: 'Português',
        professor: 'Prof. Ana Santos',
        room: 'B-205',
        startTime: '10:00',
        endTime: '11:40',
        dayOfWeek: 1,
        type: 'Prática'
      },
      {
        id: '3',
        classId: 'class-3',
        discipline: 'História',
        professor: 'Prof. João Costa',
        room: 'C-301',
        startTime: '14:00',
        endTime: '15:40',
        dayOfWeek: 1,
        type: 'Teórica'
      }
    ]
  },

  // Grades
  async getStudentGrades(studentId: string): Promise<Grade[]> {
    // TODO: Replace with actual API call
    return [
      { id: '1', discipline: 'Matemática', value: 8.5, date: '2024-03-15', concept: 'Ótimo', classId: 'class-1' },
      { id: '2', discipline: 'Português', value: 9.2, date: '2024-03-12', concept: 'Excelente', classId: 'class-2' },
      { id: '3', discipline: 'Física', value: 7.8, date: '2024-03-10', concept: 'Bom', classId: 'class-3' },
      { id: '4', discipline: 'Química', value: 8.9, date: '2024-03-08', concept: 'Ótimo', classId: 'class-4' }
    ]
  },

  // Attendance
  async getStudentAttendance(studentId: string): Promise<Attendance[]> {
    // TODO: Replace with actual API call
    return []
  },

  // Activities
  async getStudentActivities(studentId: string): Promise<Activity[]> {
    // TODO: Replace with actual API call - should filter by student's enrollments
    return []
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

  // Enrollments
  async getStudentEnrollments(studentId: string): Promise<Enrollment[]> {
    // TODO: Replace with actual API call
    return []
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