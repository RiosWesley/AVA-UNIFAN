import api from './api';

// ========== TIPOS ==========

export type ExamQuestionType = 'multiple_choice' | 'essay';

export type ExamAttemptStatus = 'in_progress' | 'submitted' | 'graded';

export interface ExamOption {
  id: string;
  text: string;
  is_correct: boolean;
}

export interface ExamDTO {
  id: string;
  activityId: string;
  activity: {
    id: string;
    title: string;
    description?: string | null;
    type: string;
    startDate?: string | null;
    dueDate?: string | null;
    maxScore?: number | null;
    class: {
      id: string;
    };
  };
  timeLimitMinutes?: number | null;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  autoGrade: boolean;
  instructions?: string | null;
  settings?: Record<string, any> | null;
  questions?: ExamQuestionDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface ExamQuestionDTO {
  id: string;
  examId: string;
  exam?: ExamDTO;
  order: number;
  type: ExamQuestionType;
  questionText: string;
  points: number;
  options?: ExamOption[] | null;
  correctAnswer?: any | null;
  rubric?: Record<string, any> | null;
  metadata?: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExamAttemptDTO {
  id: string;
  examId: string;
  exam?: ExamDTO;
  studentId: string;
  student?: {
    id: string;
    name: string;
    email: string;
  };
  startedAt: string;
  submittedAt?: string | null;
  timeSpentMinutes?: number | null;
  status: ExamAttemptStatus;
  score?: number | null;
  autoGradeScore?: number | null;
  manualGradeScore?: number | null;
  gradedAt?: string | null;
  gradedBy?: {
    id: string;
    name: string;
  } | null;
  answers?: ExamAnswerDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface ExamAnswerDTO {
  id: string;
  attemptId: string;
  attempt?: ExamAttemptDTO;
  questionId: string;
  question?: ExamQuestionDTO;
  answerData: {
    selected_option_id?: string;
    text?: string;
  };
  isCorrect?: boolean | null;
  pointsEarned?: number | null;
  feedback?: string | null;
  gradedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ========== DTOs DE CRIAÇÃO/ATUALIZAÇÃO ==========

export interface CreateExamPayload {
  activityId: string;
  timeLimitMinutes?: number | null;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  autoGrade?: boolean;
  instructions?: string | null;
  settings?: Record<string, any> | null;
}

export interface UpdateExamPayload {
  timeLimitMinutes?: number | null;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  autoGrade?: boolean;
  instructions?: string | null;
  settings?: Record<string, any> | null;
}

export interface CreateExamQuestionPayload {
  examId: string;
  order: number;
  type: ExamQuestionType;
  questionText: string;
  points: number;
  options?: ExamOption[] | null;
  correctAnswer?: any | null;
  rubric?: Record<string, any> | null;
  metadata?: Record<string, any> | null;
}

export interface UpdateExamQuestionPayload {
  order?: number;
  type?: ExamQuestionType;
  questionText?: string;
  points?: number;
  options?: ExamOption[] | null;
  correctAnswer?: any | null;
  rubric?: Record<string, any> | null;
  metadata?: Record<string, any> | null;
}

export interface GradeExamAnswerPayload {
  answerId: string;
  pointsEarned?: number | null;
  feedback?: string | null;
}

export interface SaveExamAnswerPayload {
  questionId: string;
  answerData: {
    selected_option_id?: string;
    text?: string;
  };
}

export interface SubmitExamAttemptPayload {
  attemptId: string;
  answers?: SaveExamAnswerPayload[];
}

// ========== FUNÇÕES DE API ==========

// CRUD de Provas
export async function listExams(): Promise<ExamDTO[]> {
  const { data } = await api.get('/exams');
  return data;
}

export async function getExamById(id: string): Promise<ExamDTO> {
  const { data } = await api.get(`/exams/${id}`);
  return data;
}

export async function createExam(payload: CreateExamPayload): Promise<ExamDTO> {
  const { data } = await api.post('/exams', payload);
  return data;
}

export async function updateExam(id: string, payload: UpdateExamPayload): Promise<ExamDTO> {
  const { data } = await api.patch(`/exams/${id}`, payload);
  return data;
}

export async function deleteExam(id: string): Promise<void> {
  await api.delete(`/exams/${id}`);
}

// CRUD de Questões
export async function listExamQuestions(examId: string): Promise<ExamQuestionDTO[]> {
  const { data } = await api.get(`/exams/${examId}/questions`);
  return data;
}

export async function getExamQuestionById(id: string): Promise<ExamQuestionDTO> {
  const { data } = await api.get(`/exams/questions/${id}`);
  return data;
}

export async function createExamQuestion(payload: CreateExamQuestionPayload): Promise<ExamQuestionDTO> {
  const { data } = await api.post(`/exams/${payload.examId}/questions`, payload);
  return data;
}

export async function updateExamQuestion(id: string, payload: UpdateExamQuestionPayload): Promise<ExamQuestionDTO> {
  const { data } = await api.patch(`/exams/questions/${id}`, payload);
  return data;
}

export async function deleteExamQuestion(id: string): Promise<void> {
  await api.delete(`/exams/questions/${id}`);
}

// Tentativas
export async function listAttemptsByExam(examId: string): Promise<ExamAttemptDTO[]> {
  const { data } = await api.get(`/exams/${examId}/attempts`);
  return data;
}

export async function listAttemptsByStudent(studentId: string): Promise<ExamAttemptDTO[]> {
  const { data } = await api.get(`/exams/students/${studentId}/attempts`);
  return data;
}

export async function getAttemptById(id: string): Promise<ExamAttemptDTO> {
  const { data } = await api.get(`/exams/attempts/${id}`);
  return data;
}

// Ações do Aluno
export async function startExamAttempt(examId: string): Promise<ExamAttemptDTO> {
  const { data } = await api.post(`/exams/${examId}/start`);
  return data;
}

export async function saveExamAnswer(
  attemptId: string,
  questionId: string,
  answerData: { selected_option_id?: string; text?: string }
): Promise<ExamAnswerDTO> {
  const { data } = await api.post(`/exams/attempts/${attemptId}/answers`, {
    questionId,
    answerData,
  });
  return data;
}

export async function submitExamAttempt(
  attemptId: string,
  answers?: SaveExamAnswerPayload[]
): Promise<ExamAttemptDTO> {
  const { data } = await api.post('/exams/attempts/submit', {
    attemptId,
    answers,
  });
  return data;
}

// Correção Manual
export async function gradeExamAnswer(payload: GradeExamAnswerPayload): Promise<ExamAnswerDTO> {
  const { data } = await api.post('/exams/answers/grade', payload);
  return data;
}

