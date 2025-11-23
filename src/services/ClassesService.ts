import api from './api';

export interface ClassDiscipline {
  id: string;
  name: string;
}

export interface TeacherBrief {
  id: string;
  name: string;
  email: string;
}

export interface ClassDTO {
  id: string;
  code?: string;
  semester?: string;
  year?: number;
  discipline?: ClassDiscipline | null;
  teacher?: TeacherBrief | null;
}

export async function getClassById(id: string): Promise<ClassDTO> {
  const { data } = await api.get(`/classes/${id}`);
  return data;
}

// ===== Compatibilidade com página do aluno (disciplinas) =====
import { ClassFromAPI, Semestre } from "../types/Classe";

export const getDisciplinasPorAluno = async (alunoId: string): Promise<ClassFromAPI[]> => {
  const response = await api.get<ClassFromAPI[]>(`/students/${alunoId}/classes`);
  return response.data;
};

export const transformarDadosParaComponente = (dadosApi: ClassFromAPI[]): Semestre[] => {
  const semestresAgrupados = dadosApi.reduce((acc, item) => {
    const semestreId = item.semester;

    if (!acc[semestreId]) {
      acc[semestreId] = {
        id: semestreId,
        nome: semestreId,
        ativo: semestreId === "2025.2",
        disciplinas: [],
      };
    }
    
    acc[semestreId].disciplinas.push({
      id: item.id,
      nome: item.discipline.name,
      codigo: item.code,
      professor: item.teacher?.name || "Professor não definido",
    });

    return acc;
  }, {} as Record<string, Semestre>);

  return Object.values(semestresAgrupados);
};

/**
 * Obtém a lista de semestres disponíveis para um aluno
 * @param alunoId ID do aluno
 * @returns Array de objetos com id e nome do semestre
 */
export const getSemestresDisponiveis = async (alunoId: string): Promise<Array<{ id: string; nome: string; ativo: boolean }>> => {
  try {
    const dadosDaApi = await getDisciplinasPorAluno(alunoId);
    const dadosTransformados = transformarDadosParaComponente(dadosDaApi);
    
    return dadosTransformados.map(s => ({
      id: s.id,
      nome: s.nome,
      ativo: s.ativo
    }));
  } catch (error) {
    console.error("Erro ao buscar semestres disponíveis:", error);
    return [];
  }
};

 