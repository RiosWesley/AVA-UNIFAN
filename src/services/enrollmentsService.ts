import api from './api';

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

export async function getEnrollmentsByClass(classId: string): Promise<EnrollmentDTO[]> {
  const { data } = await api.get('/enrollments', {
    params: { classId },
  });
  return data;
}


