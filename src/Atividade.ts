export interface StudentActivity {
  id: string;
  titulo: string;
  descricao: string | null;
  dataVencimento: string | null;
  disciplina: string;
  status: 'pendente' | 'concluido' | 'avaliado';
  nota: number | null;
  dataConclusao: string | null;
  semestre?: string; // Adicionado para filtro por semestre
  classId?: string; // Adicionado para referência à classe
  type?: string; // Tipo da atividade (ex: virtual_exam, homework, etc.)
}