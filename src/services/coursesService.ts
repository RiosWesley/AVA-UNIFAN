import api from './api';

export type BackendDiscipline = {
  id: string;
  name: string;
  code?: string;
  workLoad?: number;
  workload?: number;
  workloadHours?: number;
  credits?: number;
  courseId?: string;
  course?: { id: string; name?: string } | null;
  teacher?: { id: string; name: string } | null;
  courses?: { id: string; name: string }[];
  classes?: BackendClass[];
  status?: 'active' | 'inactive';
  type?: 'mandatory' | 'optional';
  semester?: number;
};

export type BackendCourse = {
  id: string;
  name: string;
  code: string;
  totalHours: number;
  durationSemesters: number;
  description?: string;
  status: 'active' | 'inactive';
  studentsCount?: number;
  disciplinesCount?: number;
  classesCount?: number;
  department?: { id: string; name: string };
  disciplines?: BackendDiscipline[];
};

export type BackendClass = {
  id: string;
  code: string;
  year?: number;
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
  academicPeriod?: { id: string; period: string } | null;
  schedules?: Array<{
    id: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    room?: string | null;
  }>;
};

export type BackendCourseStudent = {
  id: string;
  name: string;
  email?: string;
  enrollment?: string;
  status?: string;
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

export interface CreateDisciplinePayload {
  name: string;
  courseId: string;
  credits: number;
  workload: number;
}

export interface CreateClassPayload {
  code: string;
  academicPeriodId: string;
  year: number;
  disciplineId: string;
  teacherId?: string;
  // Campos opcionais para criação automática de schedule e lesson plans
  dayOfWeek?: string;
  startTime?: string;
  endTime?: string;
  room?: string;
}

export type UpdateClassPayload = Partial<CreateClassPayload>;

export interface UpdateDisciplinePayload {
  name?: string;
  credits?: number;
  workload?: number;
}

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
    return data;
  } catch (error) {
    console.error("Erro ao buscar cursos:", error);
    throw error;
  }
}

export async function getCourseById(courseId: string): Promise<BackendCourse> {
  const { data } = await api.get<BackendCourse>(`/courses/${courseId}`);
  // Garante compatibilidade se a API retornar classesCount somente no endpoint de listagem
  if (data && typeof (data as any).course_classesCount !== 'undefined') {
    (data as any).classesCount = Number((data as any).course_classesCount) || 0;
  }
  return data;
}

export async function getCourseDisciplines(courseId: string): Promise<BackendDiscipline[]> {
  const { data } = await api.get<BackendCourse>(`/courses/${courseId}`);
  // normaliza classesCount caso venha na mesma resposta
  if (data && typeof (data as any).course_classesCount !== 'undefined') {
    (data as any).classesCount = Number((data as any).course_classesCount) || 0;
  }
  return data?.disciplines ?? [];
}

export async function getCourseClasses(courseId: string): Promise<BackendClass[]> {
  const { data } = await api.get<BackendClass[]>(`/courses/${courseId}/classes`);
  return data;
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

export async function createDiscipline(payload: CreateDisciplinePayload): Promise<BackendDiscipline> {
  const body = {
    name: payload.name,
    credits: payload.credits,
    workload: payload.workload,
    courseIds: [payload.courseId],
  };
  const { data } = await api.post<BackendDiscipline>('/disciplines', body);
  return data;
}

export async function updateDiscipline(id: string, payload: UpdateDisciplinePayload): Promise<BackendDiscipline> {
  const { data } = await api.patch<BackendDiscipline>(`/disciplines/${id}`, payload);
  return data;
}

export async function toggleDisciplineStatus(
  courseId: string,
  disciplineId: string,
  status: 'active' | 'inactive',
): Promise<BackendCourse> {
  const { data } = await api.patch<BackendCourse>(
    `/courses/${courseId}/disciplines/${disciplineId}/status`,
    { status },
  );
  return data;
}

export async function updateDisciplineSemester(
  courseId: string,
  disciplineId: string,
  semester?: number,
): Promise<BackendCourse> {
  const { data } = await api.patch<BackendCourse>(
    `/courses/${courseId}/disciplines/${disciplineId}/semester`,
    { semester },
  );
  return data;
}

export async function createClass(payload: CreateClassPayload): Promise<BackendClass> {
  const { data } = await api.post<BackendClass>('/classes', payload);
  return data;
}

export async function updateClass(id: string, payload: UpdateClassPayload): Promise<BackendClass> {
  const { data } = await api.patch<BackendClass>(`/classes/${id}`, payload);
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

export async function getAllDisciplines(): Promise<BackendDiscipline[]> {
  const { data } = await api.get<BackendDiscipline[]>('/disciplines');
  return data;
}

export async function associateDisciplineToCourse(
  courseId: string,
  disciplineId: string,
  semester?: number,
): Promise<BackendCourse> {
  const { data } = await api.post<BackendCourse>(
    `/courses/${courseId}/disciplines`,
    { disciplineId, semester },
  );
  return data;
}

export interface Department {
  id: string;
  name: string;
}

export async function getDepartments(): Promise<Department[]> {
  const { data } = await api.get<Department[]>('/departments');
  return data;
}
