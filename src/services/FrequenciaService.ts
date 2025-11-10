import { AttendanceData } from "../types/Frequencia";
import api from "./api";

export const getStudentFrequencia = async (studentId: string, semestre: string): Promise<AttendanceData> => {
  try {
    console.log("Teste para ver os parametros")
    console.log(semestre)
    console.log(studentId)
    const response = await api.get<AttendanceData>(`/users/${studentId}/attendance`, {
      params: { semestre },
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar dados de frequência:", error);
    throw new Error("Não foi possível carregar os dados de frequência.");
  }
};
