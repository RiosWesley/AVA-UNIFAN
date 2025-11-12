export interface StudentActivity {
  id: string;
  titulo: string;
  descricao: string | null;
  dataVencimento: string | null;
  disciplina: string;
  status: 'pendente' | 'concluido' | 'avaliado';
  nota: number | null;
  dataConclusao: string | null;
}