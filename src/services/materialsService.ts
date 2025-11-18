import api from './api';

export interface MaterialDTO {
  id: string;
  class: { id: string };
  title: string;
  description?: string | null;
  fileUrl?: string[] | null;
  uploadedBy?: { id: string };
  uploadedAt: string;
}

export interface CreateMaterialPayload {
  classId: string;
  title: string;
  description?: string;
  fileUrl?: string[];
  uploadedById?: string;
}

export interface UpdateMaterialPayload extends Partial<CreateMaterialPayload> {}

export async function listMaterialsByClass(classId: string): Promise<MaterialDTO[]> {
  const { data } = await api.get(`/materials/class/${classId}`);
  return data;
}

function getUserIdFromToken(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const token = localStorage.getItem('ava:token');
  if (!token) return undefined;
  try {
    const payload = JSON.parse(atob(token.split('.')[1] || ''));
    return payload?.sub as string | undefined;
  } catch {
    return undefined;
  }
}

export async function createMaterial(payload: CreateMaterialPayload): Promise<MaterialDTO> {
  const uploadedById = payload.uploadedById ?? getUserIdFromToken();
  const body = { ...payload, uploadedById };
  const { data } = await api.post('/materials', body);
  return data;
}

export async function updateMaterial(id: string, payload: UpdateMaterialPayload): Promise<MaterialDTO> {
  const { data } = await api.patch(`/materials/${id}`, payload);
  return data;
}

export async function deleteMaterial(id: string): Promise<void> {
  await api.delete(`/materials/${id}`);
}

export async function uploadMaterialAttachments(materialId: string, files: File[], teacherId?: string): Promise<{ fileUrl: string[] }> {
  const effectiveTeacherId = teacherId ?? getUserIdFromToken();
  if (!effectiveTeacherId) {
    throw new Error('Não foi possível identificar o usuário para upload (teacherId). Faça login novamente.');
  }
  const form = new FormData();
  files.forEach((f) => form.append('files', f));
  const { data } = await api.post(`/materials/${materialId}/attachments`, form, {
    params: { teacherId: effectiveTeacherId },
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}


