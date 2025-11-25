import api from './api';
import { getStudentCurriculum } from './gradeCurricularService';

export interface UserBrief {
  id: string;
  name: string;
  email: string;
  usuario?: string | null;
  cpf?: string | null;
}

export interface EnrollmentDTO {
  id: string;
  student: UserBrief;
  class: { id: string };
  enrolledAt: string;
}

export interface CreateEnrollmentPayload {
  studentId: string;
  classId: string;
}

export interface EnrollmentResponse {
  id: string;
  student: UserBrief;
  class: { id: string };
  enrolledAt: string;
}

export async function getEnrollmentsByClass(classId: string): Promise<EnrollmentDTO[]> {
  const { data } = await api.get('/enrollments', {
    params: { classId },
  });
  return data;
}

export async function createEnrollment(studentId: string, classId: string): Promise<EnrollmentResponse> {
  const payload: CreateEnrollmentPayload = {
    studentId,
    classId,
  };
  const { data } = await api.post<EnrollmentResponse>('/enrollments', payload);
  return data;
}

export async function checkStudentDisciplineStatus(
  studentId: string,
  disciplineId: string
): Promise<boolean> {
  try {
    const curriculum = await getStudentCurriculum(studentId);
    
    // Busca a disciplina em todos os semestres
    for (const semesterGroup of curriculum.semesters) {
      const discipline = semesterGroup.disciplines.find((d) => d.id === disciplineId);
      if (discipline) {
        // Retorna true se a disciplina está com status "Aprovado"
        return discipline.status === 'Aprovado';
      }
    }
    
    // Se não encontrou a disciplina, não foi concluída
    return false;
  } catch (error) {
    console.error('Erro ao verificar status da disciplina:', error);
    // Em caso de erro, assumimos que não foi concluída para não bloquear a matrícula
    return false;
  }
}


