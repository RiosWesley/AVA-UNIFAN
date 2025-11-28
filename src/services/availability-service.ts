import api from './api'

export type Turno = 'manha' | 'tarde' | 'noite'

export interface DisponibilidadeTurnos {
  manha: boolean
  tarde: boolean
  noite: boolean
}

export type DayOfWeek = 'domingo' | 'segunda-feira' | 'terca-feira' | 'quarta-feira' | 'quinta-feira' | 'sexta-feira' | 'sabado'
export type ShiftType = 'morning' | 'afternoon' | 'evening'

export interface Shift {
  dayOfWeek: DayOfWeek
  shift: ShiftType
}

export interface DisponibilizacaoHorarios {
  id: string
  teacherId: string
  academicPeriod: { id: string; period: string }
  status: 'draft' | 'submitted' | 'approved'
  shifts: Shift[]
  observations?: string | null
  disciplines?: Array<{
    id: string
    name: string
    code: string
  }>
  createdAt: string
  submittedAt?: string | null
  approvedAt?: string | null
  approvedBy?: string | null
}

export interface CreateAvailabilityRequest {
  teacherId: string
  academicPeriodId: string
  shifts: Shift[]
  observations?: string
  disciplineIds?: string[]
}

export interface UpdateAvailabilityRequest {
  shifts: Shift[]
  observations?: string
}

export interface SemesterOption {
  id: string
  nome: string
  ativo: boolean
}

export async function createOrUpdateAvailability(
  data: CreateAvailabilityRequest
): Promise<DisponibilizacaoHorarios> {
  const { data: response } = await api.post<DisponibilizacaoHorarios>(
    '/teacher-semester-availabilities',
    data
  )
  return response
}

export async function getTeacherAvailabilities(
  teacherId: string
): Promise<DisponibilizacaoHorarios[]> {
  const { data } = await api.get<DisponibilizacaoHorarios[]>(
    `/teacher-semester-availabilities/teacher/${teacherId}`
  )
  return data || []
}

export async function getTeacherAvailabilityBySemester(
  teacherId: string,
  semesterId: string
): Promise<DisponibilizacaoHorarios | null> {
  try {
    const { data } = await api.get<DisponibilizacaoHorarios>(
      `/teacher-semester-availabilities/teacher/${teacherId}/semester/${semesterId}`
    )
    return data
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null
    }
    throw error
  }
}

export async function getAvailableSemesters(
  teacherId: string
): Promise<SemesterOption[]> {
  const { data } = await api.get<SemesterOption[]>(
    `/teacher-semester-availabilities/teacher/${teacherId}/available-semesters`
  )
  return data || []
}

export async function getPendingAvailabilities(): Promise<DisponibilizacaoHorarios[]> {
  const { data } = await api.get<DisponibilizacaoHorarios[]>(
    '/teacher-semester-availabilities/pending'
  )
  return data || []
}

export async function submitAvailability(
  id: string
): Promise<DisponibilizacaoHorarios> {
  const { data } = await api.patch<DisponibilizacaoHorarios>(
    `/teacher-semester-availabilities/${id}/submit`
  )
  return data
}

export async function approveAvailability(
  id: string
): Promise<DisponibilizacaoHorarios> {
  const { data } = await api.patch<DisponibilizacaoHorarios>(
    `/teacher-semester-availabilities/${id}/approve`
  )
  return data
}

export interface CourseAvailabilitySummary {
  course: {
    id: string
    name: string
    code: string
  }
  academicPeriod: {
    id: string
    period: string
  }
  teachers: Array<{
    id: string
    name: string
    email: string
    shifts: Shift[]
    disciplines: Array<{
      id: string
      name: string
      code: string
    }>
    status: 'draft' | 'submitted' | 'approved'
    observations: string | null
    submittedAt: string | null
    approvedAt: string | null
  }>
}

export async function getCourseAvailabilitySummary(
  courseId: string,
  semesterId: string
): Promise<CourseAvailabilitySummary> {
  // Aceita tanto UUID quanto string do período (ex: "2026.2")
  const { data } = await api.get<CourseAvailabilitySummary>(
    `/teacher-semester-availabilities/course/${courseId}/semester/${semesterId}/summary`
  )
  return data
}

