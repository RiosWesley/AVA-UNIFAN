import { PerformanceData } from "../types/Desempenho";
import api from "./api"; 

export const getStudentPerformance = async (studentId: string): Promise<PerformanceData> => {
  try {
    const response = await api.get<PerformanceData>(`/users/${studentId}/performance`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar dados de desempenho:", error);
    throw new Error("Não foi possível carregar os dados de desempenho.");
  }
};