import api from './api';

export interface CreateActivityGradePayload {
  enrollmentId: string;
  score: number;
  gradedAt?: string;
}

export async function createGradeForActivity(activityId: string, payload: CreateActivityGradePayload): Promise<void> {
  try {
    await api.post(`/activities/${activityId}/grades`, payload);
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || 'Falha ao lançar nota';
    throw new Error(Array.isArray(msg) ? msg.join('; ') : msg);
  }
}

export interface ClassGradebookActivity {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  due_date?: string | null;
  max_score?: number | null;
}

export interface ClassGradebookEntry {
  enrollmentId: string;
  student?: { id: string; name: string; email: string } | null;
  grades: { activityId: string; grade: { id: string; score: number; gradedAt: string | null } | null }[];
}

export interface ClassGradebookDTO {
  class: {
    id: string;
    code?: string;
    semester?: string;
    year?: number;
    discipline?: { id: string; name: string } | null;
    teacher?: { id: string; name: string; email: string } | null;
  };
  activities: ClassGradebookActivity[];
  entries: ClassGradebookEntry[];
}

export async function getClassGradebook(classId: string): Promise<ClassGradebookDTO> {
  const { data } = await api.get(`/classes/${classId}/gradebook`);
  return data;
}

export interface ActivityGradebookEntryDTO {
  enrollmentId: string;
  student?: { id: string; name: string; email: string } | null;
  grade?: { id: string; score: number; gradedAt: string | null } | null;
}

export interface ActivityGradebookDTO {
  activity: {
    id: string;
    title: string;
    description?: string | null;
    type: string;
    due_date?: string | null;
    max_score?: number | null;
    classId: string;
  };
  entries: ActivityGradebookEntryDTO[];
}

export async function getActivityGradebook(activityId: string): Promise<ActivityGradebookDTO> {
  const { data } = await api.get(`/activities/${activityId}/grades`);
  return data;
}

export interface GradeDTO {
  id: string;
  enrollment: { id: string };
  activity: { id: string };
  score: number;
  gradedAt: string | null;
}

export async function findGrades(params: { enrollmentId?: string; activityId?: string }): Promise<GradeDTO[]> {
  const { data } = await api.get('/grades', { params });
  return data;
}

export async function updateGrade(id: string, payload: Partial<CreateActivityGradePayload> & { activityId?: string; enrollmentId?: string }): Promise<void> {
  await api.patch(`/grades/${id}`, payload);
}


