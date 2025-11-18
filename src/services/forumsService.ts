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
  userId?: string;
}

export interface UpdateForumPayload extends Partial<CreateForumPayload> {}

export async function listForumsByClass(classId: string): Promise<ForumDTO[]> {
  const { data } = await api.get(`/forums/class/${classId}`);
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

export async function createForum(payload: CreateForumPayload): Promise<ForumDTO> {
  const userId = payload.userId ?? getUserIdFromToken();
  const body = {
    classId: payload.classId,
    title: payload.title,
    description: typeof payload.description === 'string' ? payload.description : '',
    userId,
  };
  const { data } = await api.post('/forums', body);
  return data;
}

export async function updateForum(id: string, payload: UpdateForumPayload): Promise<ForumDTO> {
  const { data } = await api.patch(`/forums/${id}`, payload);
  return data;
}

export async function deleteForum(id: string): Promise<void> {
  await api.delete(`/forums/${id}`);
}


