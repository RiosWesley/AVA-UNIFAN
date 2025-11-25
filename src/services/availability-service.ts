import api from './api'

export type Turno = 'manha' | 'tarde' | 'noite'

export interface DisponibilidadeTurnos {
  manha: boolean
  tarde: boolean
  noite: boolean
}

export interface DisponibilizacaoHorarios {
  id: string
  teacherId: string
  semesterId: string
  status: 'draft' | 'submitted' | 'approved'
  morning: boolean
  afternoon: boolean
  evening: boolean
  observations?: string | null
  createdAt: string
  submittedAt?: string | null
  approvedAt?: string | null
  approvedBy?: string | null
}

export interface CreateAvailabilityRequest {
  semesterId: string
  morning: boolean
  afternoon: boolean
  evening: boolean
  observations?: string
}

export interface UpdateAvailabilityRequest {
  morning: boolean
  afternoon: boolean
  evening: boolean
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

export function mapBackendToFrontendTurnos(
  availability: DisponibilizacaoHorarios
): DisponibilidadeTurnos {
  return {
    manha: availability.morning,
    tarde: availability.afternoon,
    noite: availability.evening,
  }
}

export function mapFrontendToBackendTurnos(
  turnos: DisponibilidadeTurnos
): Pick<CreateAvailabilityRequest, 'morning' | 'afternoon' | 'evening'> {
  return {
    morning: turnos.manha,
    afternoon: turnos.tarde,
    evening: turnos.noite,
  }
}

