import api from "./api";

export interface FrequenciaItem {
  enrollment_id: string;
  student_id: string;
  date: string; // formato YYYY-MM-DD
  present: boolean;
}

export interface LancarFrequenciaRequest {
  attendances: FrequenciaItem[];
}

export const lancarFrequencia = async (frequencias: FrequenciaItem[]): Promise<void> => {
  try {
    await api.post("/attendances/batch", {
      attendances: frequencias,
    });
  } catch (error) {
    console.error("Erro ao lançar frequência:", error);
    throw new Error("Não foi possível lançar a frequência.");
  }
};

