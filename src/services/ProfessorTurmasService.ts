import api from "./api";

export interface Aluno {
  id: string;
  nome: string;
  matricula: string;
  enrollmentId: string;
}

export interface Aula {
  id: string;
  data: Date;
  horario: string;
  sala: string;
  status: 'agendada' | 'lancada' | 'retificada';
  alunosPresentes?: string[];
  dataLancamento?: Date;
  aulaIndex?: number;
}

export interface Turma {
  id: string;
  nome: string;
  disciplina: string;
  alunos: number;
  mediaGeral: number;
  frequenciaMedia: number;
  proximaAula: string;
  sala: string;
  atividades: number;
  avaliacoes: number;
  listaAlunos: Aluno[];
  aulas: Aula[];
}

export const getTurmasProfessor = async (teacherId: string): Promise<Turma[]> => {
  try {
    const response = await api.get<Turma[]>(`/classes/teacher/${teacherId}/details`);
    // Converter datas de string para Date (evitando problema de fuso horário)
    return response.data.map(turma => ({
      ...turma,
      aulas: turma.aulas.map(aula => {
        // Converter data YYYY-MM-DD para Date local (não UTC)
        let data: Date;
        if (typeof aula.data === 'string') {
          const [year, month, day] = aula.data.split('-').map(Number);
          data = new Date(year, month - 1, day); // month é 0-indexed
        } else {
          data = new Date(aula.data);
        }
        
        return {
          ...aula,
          data,
          dataLancamento: aula.dataLancamento 
            ? (typeof aula.dataLancamento === 'string' 
                ? new Date(aula.dataLancamento) 
                : new Date(aula.dataLancamento))
            : undefined,
        };
      }),
    }));
  } catch (error) {
    console.error("Erro ao buscar turmas do professor:", error);
    throw new Error("Não foi possível carregar as turmas.");
  }
};

