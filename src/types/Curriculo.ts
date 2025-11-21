export interface CurriculumDiscipline {
  id: string;
  code: string | null;
  name: string;
  academicPeriod: string | null; // período letivo
  status: 'Aprovado' | 'Reprovado' | 'Cursando' | 'Pendente';
  finalGrade?: number;
  absences?: number;
  credits: number;
  workload: number;
  type: 'required' | 'optional';
}

export interface SemesterGroup {
  semester: number | string;
  disciplines: CurriculumDiscipline[];
}

export interface CurriculumSummary {
  totalHours: number;
  completedHours: number;
  requiredDisciplines: {
    completed: number;
    total: number;
  };
  optionalDisciplines: {
    completed: number;
    total: number;
  };
}

export interface StudentCurriculum {
  course: {
    id: string;
    name: string;
    code: string | null;
  };
  summary: CurriculumSummary;
  semesters: SemesterGroup[];
}

