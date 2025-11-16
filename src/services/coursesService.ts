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

export interface CreateCoursePayload {
  name: string;
  code: string;
  departmentId: string;
  totalHours: number;
  durationSemesters: number;
  status: 'active' | 'inactive';
  description?: string;
}

export type UpdateCoursePayload = Partial<CreateCoursePayload>;

export async function getCourses(filters: {
  departmentId?: string;
  status?: 'active' | 'inactive' | 'todos';
  search?: string;
}): Promise<BackendCourse[]> {

  const rawParams = {
    departmentId: (filters.departmentId && filters.departmentId !== 'todos') ? filters.departmentId : undefined,
    status: (filters.status && filters.status !== 'todos') ? filters.status : undefined,
    search: filters.search || undefined,
  };

  const params: Record<string, any> = {};
  Object.keys(rawParams).forEach(key => {
    const value = rawParams[key as keyof typeof rawParams];
    if (value) {
      params[key] = value;
    }
  });

  try {
    const { data } = await api.get<BackendCourse[]>('/courses', { params });
    console.log(data)
    return data;
  } catch (error) {
    console.error("Erro ao buscar cursos:", error);
    throw error;
  }
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


export async function updateCourse(id: string, payload: UpdateCoursePayload): Promise<BackendCourse> {
  const { data } = await api.patch<BackendCourse>(`/courses/${id}`, payload);
  return data;
}

export async function deleteCourse(id: string): Promise<void> {
  await api.delete(`/courses/${id}`);
}

export interface Department {
  id: string;
  name: string;
}

export async function getDepartments(): Promise<Department[]> {
  const { data } = await api.get<Department[]>('/departments');
  return data;
}