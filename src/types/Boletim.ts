interface DisciplinaBoletim {
  disciplina: string;
  codigo: string;
  media: number;
  frequencia: number;
  situacao: string;
  notas: {
    unidade: string;
    nota: number | null;
  }[];
  cor: string;
}

interface GradebookData {
  geral: {
    mediaGeral: number;
    frequenciaGeral: number;
    disciplinasAprovadas: number;
    totalDisciplinas: number;
  };
  disciplinas: DisciplinaBoletim[];
}