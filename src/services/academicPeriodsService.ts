import api from './api';

export interface AcademicPeriod {
  id: string;
  period: string; // Formato: "YYYY.1" ou "YYYY.2"
  startDate?: string;
  endDate?: string;
}

export interface CreateAcademicPeriodDto {
  period: string; // Formato: "YYYY.1" ou "YYYY.2"
  startDate?: string;
  endDate?: string;
}

export interface UpdateAcademicPeriodDto {
  period?: string;
  startDate?: string;
  endDate?: string;
}

// Converter entrySemester (YYYY-1) para formato do backend (YYYY.1)
export function convertEntrySemesterToPeriod(entrySemester: string): string {
  return entrySemester.replace('-', '.');
}

// Converter período do backend (YYYY.1) para entrySemester (YYYY-1)
export function convertPeriodToEntrySemester(period: string): string {
  return period.replace('.', '-');
}

// Buscar período letivo por string do período
export async function getAcademicPeriodByPeriod(period: string): Promise<AcademicPeriod | null> {
  try {
    const { data } = await api.get<AcademicPeriod>(`/academic-periods/by-period/${period}`);
    return data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

// Buscar ou criar período letivo
export async function getOrCreateAcademicPeriod(entrySemester: string): Promise<AcademicPeriod> {
  // Converter formato YYYY-1 para YYYY.1
  const period = convertEntrySemesterToPeriod(entrySemester);
  
  // Tentar buscar período existente
  let academicPeriod = await getAcademicPeriodByPeriod(period);
  
  if (!academicPeriod) {
    // Se não existir, criar um novo período
    // Nota: O backend pode exigir datas, mas vamos tentar criar sem datas primeiro
    try {
      const { data } = await api.post<AcademicPeriod>('/academic-periods', {
        period,
      } as CreateAcademicPeriodDto);
      academicPeriod = data;
    } catch (error: any) {
      // Se falhar por falta de datas, vamos calcular datas padrão
      if (error.response?.status === 400) {
        const [year, semester] = period.split('.');
        const yearNum = parseInt(year);
        const semesterNum = parseInt(semester);
        
        // Calcular datas: semestre 1 (jan-jun), semestre 2 (jul-dez)
        const startDate = semesterNum === 1 
          ? `${yearNum}-01-01T00:00:00Z`
          : `${yearNum}-07-01T00:00:00Z`;
        const endDate = semesterNum === 1
          ? `${yearNum}-06-30T23:59:59Z`
          : `${yearNum}-12-31T23:59:59Z`;
        
        const { data } = await api.post<AcademicPeriod>('/academic-periods', {
          period,
          startDate,
          endDate,
        } as CreateAcademicPeriodDto);
        academicPeriod = data;
      } else {
        throw error;
      }
    }
  }
  
  if (!academicPeriod) {
    throw new Error(`Não foi possível obter ou criar o período letivo ${period}`);
  }
  
  return academicPeriod;
}

// Listar todos os períodos letivos
export async function getAllAcademicPeriods(): Promise<AcademicPeriod[]> {
  const { data } = await api.get<AcademicPeriod[]>('/academic-periods');
  return data;
}

// Alias para compatibilidade
export const getAcademicPeriods = getAllAcademicPeriods;

// Criar período letivo
export async function createAcademicPeriod(dto: CreateAcademicPeriodDto): Promise<AcademicPeriod> {
  const { data } = await api.post<AcademicPeriod>('/academic-periods', dto);
  return data;
}

// Atualizar período letivo
export async function updateAcademicPeriod(id: string, dto: UpdateAcademicPeriodDto): Promise<AcademicPeriod> {
  const { data } = await api.patch<AcademicPeriod>(`/academic-periods/${id}`, dto);
  return data;
}

// Deletar período letivo
export async function deleteAcademicPeriod(id: string): Promise<void> {
  await api.delete(`/academic-periods/${id}`);
}