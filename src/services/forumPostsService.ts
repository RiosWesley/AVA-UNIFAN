import api from './api';

export interface ForumPostDTO {
  id: string;
  forum: { id: string };
  user: { id: string; name: string };
  content: string;
  postedAt: string;
  parentPostId?: string | null;
  replies?: ForumPostDTO[];
}

export interface CreateForumPostPayload {
  forumId: string;
  userId?: string; // backend pode inferir do token; manter opcional
  content: string;
  parentPostId?: string;
}

export async function listPostsByForum(forumId: string): Promise<ForumPostDTO[]> {
  const { data } = await api.get(`/forum-posts/forum/${forumId}`);
  return data;
}

export async function createForumPost(payload: CreateForumPostPayload): Promise<ForumPostDTO> {
  const { data } = await api.post('/forum-posts', payload);
  return data;
}


