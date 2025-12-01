import api from './api';

export type ActivityType = 'exam' | 'virtual_exam' | 'homework' | 'project';
export type ActivityUnit = '1ª Unidade' | '2ª Unidade' | 'Prova Final';

export interface ActivityDTO {
  id: string;
  class: { id: string };
  title: string;
  description?: string | null;
  type: ActivityType;
  unit: ActivityUnit;
  startDate?: string | null;
  dueDate?: string | null;
  maxScore?: number | null;
}

export interface CreateActivityPayload {
  classId: string;
  title: string;
  unit: ActivityUnit;
  type: ActivityType;
  description?: string;
  startDate?: string;
  dueDate?: string;
  maxScore?: number;
  attachmentUrls?: string[];
}

export interface UpdateActivityPayload extends Partial<CreateActivityPayload> {}

export async function listActivitiesByClass(classId: string): Promise<ActivityDTO[]> {
  const { data } = await api.get(`/activities/class/${classId}`);
  return data;
}

export async function getActivityById(id: string): Promise<ActivityDTO> {
  const { data } = await api.get(`/activities/${id}`);
  return data;
}

export async function createActivity(payload: CreateActivityPayload): Promise<ActivityDTO> {
  try {
    const { data } = await api.post('/activities', payload);
    return data;
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao criar atividade';
    console.error('Erro ao criar atividade:', {
      payload,
      error: error?.response?.data,
      status: error?.response?.status
    });
    throw new Error(Array.isArray(errorMessage) ? errorMessage.join('; ') : errorMessage);
  }
}

export async function updateActivity(id: string, payload: UpdateActivityPayload): Promise<ActivityDTO> {
  try {
    const { data } = await api.patch(`/activities/${id}`, payload);
    return data;
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao atualizar atividade';
    console.error('Erro ao atualizar atividade:', {
      id,
      payload,
      error: error?.response?.data,
      status: error?.response?.status
    });
    throw new Error(Array.isArray(errorMessage) ? errorMessage.join('; ') : errorMessage);
  }
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
  
  // Tenta extrair do header Content-Disposition primeiro
  const disposition = (response.headers?.['content-disposition'] as string) || '';
  const match = disposition.match(/filename="([^"]+)"/i);
  if (match?.[1]) {
    return { blob: response.data as Blob, fileName: decodeURIComponent(match[1]) };
  }
  
  // Fallback: extrai da URL removendo query params e processando o nome
  try {
    const urlWithoutParams = fileUrl.split('?')[0];
    const fileNameWithPath = urlWithoutParams.split('/').pop() || 'arquivo';
    
    // Remove timestamp e nanoid se existirem (formato: timestamp-nanoid-nomeOriginal)
    const parts = fileNameWithPath.split('-');
    if (parts.length >= 3 && /^\d+$/.test(parts[0]) && /^[A-Za-z0-9]+$/.test(parts[1])) {
      const originalName = parts.slice(2).join('-');
      return { blob: response.data as Blob, fileName: originalName };
    }
    
    return { blob: response.data as Blob, fileName: fileNameWithPath };
  } catch {
    return { blob: response.data as Blob, fileName: 'arquivo' };
  }
}


