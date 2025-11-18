import api from './api';

export interface ForumDTO {
  id: string;
  class: { id: string };
  title: string;
  description?: string | null;
  createdAt?: string;
  createdBy?: { id: string; name?: string };
}

export interface CreateForumPayload {
  classId: string;
  title: string;
  description?: string;
}

export interface UpdateForumPayload extends Partial<CreateForumPayload> {}

export async function listForumsByClass(classId: string): Promise<ForumDTO[]> {
  const { data } = await api.get(`/forums/class/${classId}`);
  return data;
}

export async function createForum(payload: CreateForumPayload): Promise<ForumDTO> {
  const { data } = await api.post('/forums', payload);
  return data;
}

export async function updateForum(id: string, payload: UpdateForumPayload): Promise<ForumDTO> {
  const { data } = await api.patch(`/forums/${id}`, payload);
  return data;
}

export async function deleteForum(id: string): Promise<void> {
  await api.delete(`/forums/${id}`);
}


