import api from './api';

export type BackendCourse = {
  id: string;
  name: string;
  code: string;
  totalHours: number;
  durationSemesters: number;
  description?: string;
  status: 'active' | 'inactive';
  studentsCount: number;
  disciplinesCount: number;
  classesCount: number;
  department?: { id: string; name: string };
};

export async function getCourses(departmentId: string): Promise<BackendCourse[]> {
  const { data } = await api.get<BackendCourse[]>('/courses', { params: { departmentId } });
  return data;
}

export async function createCourse(payload: {
  name: string;
  code: string;
  totalHours: number;
  durationSemesters: number;
  description?: string;
  departmentId: string;
  status?: 'active' | 'inactive';
}): Promise<BackendCourse> {
  const body = { ...payload, code: payload.code.toUpperCase() };
  const { data } = await api.post<BackendCourse>('/courses', body);
  return data;
}


