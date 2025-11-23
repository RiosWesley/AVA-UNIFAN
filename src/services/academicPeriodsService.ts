import api from './api';

export interface AcademicPeriod {
  id: string;
  period: string; // Formato: "YYYY.1" ou "YYYY.2" (ex: "2025.1")
  createdAt: string;
}

export interface CreateAcademicPeriodDto {
  period: string; // Formato: "YYYY.1" ou "YYYY.2"
}

export interface UpdateAcademicPeriodDto {
  period?: string; // Formato: "YYYY.1" ou "YYYY.2"
}

export async function getAcademicPeriods(): Promise<AcademicPeriod[]> {
  try {
    const { data } = await api.get<AcademicPeriod[]>('/academic-periods');
    return data;
  } catch (error) {
    console.error('Erro ao buscar períodos letivos:', error);
    throw error;
  }
}

export async function getAcademicPeriod(id: string): Promise<AcademicPeriod> {
  try {
    const { data } = await api.get<AcademicPeriod>(`/academic-periods/${id}`);
    return data;
  } catch (error) {
    console.error('Erro ao buscar período letivo:', error);
    throw error;
  }
}

export async function createAcademicPeriod(
  payload: CreateAcademicPeriodDto,
): Promise<AcademicPeriod> {
  try {
    const { data } = await api.post<AcademicPeriod>('/academic-periods', payload);
    return data;
  } catch (error: any) {
    console.error('Erro ao criar período letivo:', error);
    const message = error.response?.data?.message || error.message || 'Não foi possível criar o período letivo.';
    throw new Error(message);
  }
}

export async function updateAcademicPeriod(
  id: string,
  payload: UpdateAcademicPeriodDto,
): Promise<AcademicPeriod> {
  try {
    const { data } = await api.patch<AcademicPeriod>(`/academic-periods/${id}`, payload);
    return data;
  } catch (error: any) {
    console.error('Erro ao atualizar período letivo:', error);
    const message = error.response?.data?.message || error.message || 'Não foi possível atualizar o período letivo.';
    throw new Error(message);
  }
}

export async function deleteAcademicPeriod(id: string): Promise<void> {
  try {
    await api.delete(`/academic-periods/${id}`);
  } catch (error: any) {
    console.error('Erro ao excluir período letivo:', error);
    const message = error.response?.data?.message || error.message || 'Não foi possível excluir o período letivo.';
    throw new Error(message);
  }
}

