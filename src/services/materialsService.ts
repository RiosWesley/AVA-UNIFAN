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
}

export interface UpdateMaterialPayload extends Partial<CreateMaterialPayload> {}

export async function listMaterialsByClass(classId: string): Promise<MaterialDTO[]> {
  const { data } = await api.get(`/materials/class/${classId}`);
  return data;
}

export async function createMaterial(payload: CreateMaterialPayload): Promise<MaterialDTO> {
  const { data } = await api.post('/materials', payload);
  return data;
}

export async function updateMaterial(id: string, payload: UpdateMaterialPayload): Promise<MaterialDTO> {
  const { data } = await api.patch(`/materials/${id}`, payload);
  return data;
}

export async function deleteMaterial(id: string): Promise<void> {
  await api.delete(`/materials/${id}`);
}


