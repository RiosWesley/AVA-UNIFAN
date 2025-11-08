export interface ClassFromAPI {
  id: string;
  code: string;
  semester: string;
  year: string;
  discipline: {
    id: string;
    name: string;
  };
  teacher: {
    id: string;
    name: string;
  } | null;
}

export interface Disciplina {
  id: number | string;
  nome: string;
  codigo: string;
  professor: string;
}

export interface Semestre {
  id: string;
  nome: string;
  ativo: boolean;
  disciplinas: Disciplina[];
}