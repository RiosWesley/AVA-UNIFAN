import { ClassFromAPI, Semestre } from "../types/Classe";
import api from "./api";


export const getDisciplinasPorAluno = async (alunoId: string): Promise<ClassFromAPI[]> => {
  try {
    const response = await api.get<ClassFromAPI[]>(`/students/${alunoId}/classes`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar disciplinas:", error);
    throw new Error("Não foi possível carregar as disciplinas.");
  }
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
      id: item.discipline.id,
      nome: item.discipline.name,
      codigo: item.code,
      professor: item.teacher?.name || "Professor não definido",
    });

    return acc;
  }, {} as Record<string, Semestre>);

  return Object.values(semestresAgrupados);
};