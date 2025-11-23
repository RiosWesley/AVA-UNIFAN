import api from './api';

export interface LiveSessionDTO {
  id: string;
  class: { id: string };
  title: string;
  startAt: string;
  endAt: string;
  meetingUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLiveSessionPayload {
  classId: string;
  title: string;
  startAt: string; // ISO
  endAt: string;   // ISO
  meetingUrl?: string;
}

export interface UpdateLiveSessionPayload {
  classId?: string;
  title?: string;
  startAt?: string; // ISO
  endAt?: string;   // ISO
  meetingUrl?: string;
}

export async function listLiveSessionsByClass(classId: string): Promise<LiveSessionDTO[]> {
  const { data } = await api.get(`/live-sessions/class/${classId}`);
  return data;
}

export async function createLiveSession(payload: CreateLiveSessionPayload): Promise<LiveSessionDTO> {
  const { data } = await api.post('/live-sessions', payload);
  return data;
}

export async function getLiveSessionById(id: string): Promise<LiveSessionDTO> {
  const { data } = await api.get(`/live-sessions/${id}`);
  return data;
}

export async function updateLiveSession(id: string, payload: UpdateLiveSessionPayload): Promise<LiveSessionDTO> {
  const { data } = await api.patch(`/live-sessions/${id}`, payload);
  return data;
}

export async function deleteLiveSession(id: string): Promise<void> {
  await api.delete(`/live-sessions/${id}`);
}

