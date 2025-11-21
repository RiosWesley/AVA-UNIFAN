import { StudentCurriculum } from "../types/Curriculo";
import api from "./api";

export const getStudentCurriculum = async (studentId: string): Promise<StudentCurriculum> => {
  try {
    const response = await api.get<StudentCurriculum>(`/users/${studentId}/curriculum`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar grade curricular:", error);
    throw new Error("Não foi possível carregar a grade curricular.");
  }
};

