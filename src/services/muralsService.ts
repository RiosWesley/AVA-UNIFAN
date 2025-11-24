import api from './api';

export type MuralTargetRole = 'aluno' | 'professor' | 'ambos';

export interface Mural {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  targetRole: MuralTargetRole;
  order: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMuralDto {
  title: string;
  description?: string;
  targetRole: MuralTargetRole;
  order?: number;
  isActive?: boolean;
}

export interface UpdateMuralDto {
  title?: string;
  description?: string;
  targetRole?: MuralTargetRole;
  order?: number;
  isActive?: boolean;
}

export async function getMurals(targetRole?: MuralTargetRole): Promise<Mural[]> {
  try {
    const params = targetRole ? { targetRole } : {};
    const { data } = await api.get<Mural[]>('/murals', { params });
    return data;
  } catch (error) {
    console.error('Erro ao buscar murais:', error);
    throw error;
  }
}

export async function getMural(id: string): Promise<Mural> {
  try {
    const { data } = await api.get<Mural>(`/murals/${id}`);
    return data;
  } catch (error) {
    console.error('Erro ao buscar mural:', error);
    throw error;
  }
}

export async function createMural(
  payload: CreateMuralDto,
  imageFile: File,
): Promise<Mural> {
  try {
    const formData = new FormData();
    formData.append('title', payload.title);
    if (payload.description) {
      formData.append('description', payload.description);
    }
    formData.append('targetRole', payload.targetRole);
    if (payload.order !== undefined) {
      formData.append('order', payload.order.toString());
    }
    if (payload.isActive !== undefined) {
      formData.append('isActive', payload.isActive.toString());
    }
    formData.append('image', imageFile);

    const { data } = await api.post<Mural>('/murals', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  } catch (error: any) {
    console.error('Erro ao criar mural:', error);
    const message = error.response?.data?.message || error.message || 'Não foi possível criar o mural.';
    throw new Error(message);
  }
}

export async function updateMural(
  id: string,
  payload: UpdateMuralDto,
  imageFile?: File,
): Promise<Mural> {
  try {
    const formData = new FormData();
    if (payload.title !== undefined) {
      formData.append('title', payload.title);
    }
    if (payload.description !== undefined) {
      formData.append('description', payload.description || '');
    }
    if (payload.targetRole !== undefined) {
      formData.append('targetRole', payload.targetRole);
    }
    if (payload.order !== undefined) {
      formData.append('order', payload.order.toString());
    }
    if (payload.isActive !== undefined) {
      formData.append('isActive', payload.isActive.toString());
    }
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const { data } = await api.patch<Mural>(`/murals/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  } catch (error: any) {
    console.error('Erro ao atualizar mural:', error);
    const message = error.response?.data?.message || error.message || 'Não foi possível atualizar o mural.';
    throw new Error(message);
  }
}

export async function deleteMural(id: string): Promise<void> {
  try {
    await api.delete(`/murals/${id}`);
  } catch (error: any) {
    console.error('Erro ao excluir mural:', error);
    const message = error.response?.data?.message || error.message || 'Não foi possível excluir o mural.';
    throw new Error(message);
  }
}

