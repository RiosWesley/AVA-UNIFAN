import api from './api';

export type BackendDiscipline = {
  id: string;
  name: string;
  code: string;
  workloadHours?: number;
  credits?: number;
  semester?: number;
  type?: 'mandatory' | 'optional';
  status?: 'active' | 'inactive';
  courseId?: string;
  course?: { id: string; name: string } | null;
  teacher?: { id: string; name: string } | null;
};

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
  disciplines?: BackendDiscipline[];
};

export type BackendClass = {
  id: string;
  code: string;
  period?: string;
  schedule?: string;
  room?: string;
  capacity?: number;
  studentsCount?: number;
  status?: 'active' | 'inactive';
  courseId?: string;
  course?: { id: string; name: string } | null;
  discipline?: { id: string; name: string } | null;
  teacher?: { id: string; name: string } | null;
};

export type BackendCourseStudent = {
  id: string;
  name: string;
  email?: string;
  enrollment?: string;
  status?: string;
};

export async function getCourses(departmentId: string): Promise<BackendCourse[]> {
  const { data } = await api.get<BackendCourse[]>('/courses', { params: { departmentId } });
  return data;
}

export async function getCourseById(courseId: string): Promise<BackendCourse> {
  const { data } = await api.get<BackendCourse>(`/courses/${courseId}`);
  return data;
}

export async function getCourseDisciplines(courseId: string): Promise<BackendDiscipline[]> {
  const { data } = await api.get<BackendCourse>(`/courses/${courseId}`);
  return data?.disciplines ?? [];
}

export async function getCourseClasses(courseId: string): Promise<BackendClass[]> {
  const endpoints = [
    `/courses/${courseId}/classes`,
    `/classes?courseId=${courseId}`,
  ];

  let lastError: unknown;
  for (const endpoint of endpoints) {
    try {
      const { data } = await api.get<BackendClass[]>(endpoint);
      return data;
    } catch (error: any) {
      lastError = error;
      if (error?.response?.status !== 404) {
        throw error;
      }
    }
  }
  throw lastError;
}

export async function getCourseStudents(courseId: string): Promise<BackendCourseStudent[]> {
  const { data } = await api.get<BackendCourseStudent[]>(`/courses/${courseId}/students`);
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
