import api from "./api";
import { GradebookData } from "../types/Boletim";

export const getStudentGradebook = async (studentId: string): Promise<GradebookData> => {
  try {
    const response = await api.get<GradebookData>(`/users/${studentId}/gradebook`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar boletim:", error);
    throw new Error("Não foi possível carregar o boletim.");
  }
};