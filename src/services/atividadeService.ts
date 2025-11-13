import { StudentActivity } from "../Atividade";
import api from "./api";

export const getStudentActivities = async (studentId: string): Promise<StudentActivity[]> => {
  try {
    const response = await api.get<StudentActivity[]>(`/activities/students/${studentId}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar atividades:", error);
    throw new Error("Não foi possível carregar as atividades.");
  }
};

export const completeStudentActivity = async (activityId: string, studentId: string): Promise<void> => {
  try {
    const response = await api.post(
      `/activities/${activityId}/complete`, 
      {},
      { 
        params: { studentId }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Erro ao marcar atividade como concluída:", error);
    throw new Error("Não foi possível concluir a atividade.");
  }
};

export const uploadStudentActivity = async (
  activityId: string,
  studentId: string,
  file: File,
  comment: string,
): Promise<any> => {
  
  const formData = new FormData();
  
  formData.append('files', file); 
  
  // formData.append('comment', comment);

  try {
    const response = await api.post(
      `/activities/students/${studentId}/activities/${activityId}/submissions/upload`,
      formData
    );
    return response.data;
  } catch (error) {
    console.error("Erro ao enviar atividade:", error);
    throw new Error("Não foi possível enviar o arquivo da atividade.");
  }
};