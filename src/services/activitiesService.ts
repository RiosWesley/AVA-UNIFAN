import api from './api';

export type ActivityType = 'exam' | 'homework' | 'project';
export type ActivityUnit = '1ª Unidade' | '2ª Unidade' | 'Prova Final';

export interface ActivityDTO {
  id: string;
  class: { id: string };
  title: string;
  description?: string | null;
  type: ActivityType;
  unit: ActivityUnit;
  dueDate?: string | null;
  maxScore?: number | null;
}

export interface CreateActivityPayload {
  classId: string;
  title: string;
  unit: ActivityUnit;
  type: ActivityType;
  description?: string;
  dueDate?: string;
  maxScore?: number;
  attachmentUrls?: string[];
}

export interface UpdateActivityPayload extends Partial<CreateActivityPayload> {}

export async function listActivitiesByClass(classId: string): Promise<ActivityDTO[]> {
  const { data } = await api.get(`/activities/class/${classId}`);
  return data;
}

export async function createActivity(payload: CreateActivityPayload): Promise<ActivityDTO> {
  const { data } = await api.post('/activities', payload);
  return data;
}

export async function updateActivity(id: string, payload: UpdateActivityPayload): Promise<ActivityDTO> {
  const { data } = await api.patch(`/activities/${id}`, payload);
  return data;
}

export async function deleteActivity(id: string): Promise<void> {
  await api.delete(`/activities/${id}`);
}

export interface ActivitySubmissionDTO {
  id: string;
  student: { id: string; name: string };
  activity: { id: string };
  files?: string[];
  fileUrls?: string[];
  submittedAt?: string;
}

export async function listSubmissionsByActivity(activityId: string): Promise<ActivitySubmissionDTO[]> {
  const { data } = await api.get(`/activities/${activityId}/submissions`);
  return data;
}

export async function completeActivityForStudent(activityId: string, studentId: string): Promise<void> {
  await api.post(`/activities/${activityId}/complete`, {}, { params: { studentId } });
}

export async function downloadSubmissionFile(submissionId: string, fileUrl: string): Promise<{ blob: Blob; fileName: string }> {
  const response = await api.get(`/activities/submissions/${submissionId}/files/download`, {
    params: { fileUrl },
    responseType: 'blob',
  });
  const disposition = (response.headers?.['content-disposition'] as string) || '';
  const match = disposition.match(/filename="([^"]+)"/i);
  const fileName = match?.[1] || (fileUrl.split('/').pop() || 'arquivo');
  return { blob: response.data as Blob, fileName };
}


