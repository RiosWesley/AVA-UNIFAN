import api from './api';
import { getOrCreateAcademicPeriod } from './academicPeriodsService';

export type StudentCourseStatus = 'ACTIVE' | 'INACTIVE';

export interface CreateStudentCoursePayload {
  studentId: string;
  courseId: string;
  entryAcademicPeriodId: string; // UUID do período letivo
  status?: StudentCourseStatus;
}

export async function linkStudentToCourse(
  studentId: string,
  courseId: string,
  entrySemester: string, // YYYY-1|2
  status?: StudentCourseStatus
): Promise<void> {
  validateEntrySemester(entrySemester);
  
  // Buscar ou criar período letivo
  const academicPeriod = await getOrCreateAcademicPeriod(entrySemester);
  
  await api.post('/student-courses', {
    studentId,
    courseId,
    entryAcademicPeriodId: academicPeriod.id,
    status,
  } as CreateStudentCoursePayload);
}

export async function linkStudentToCourses(
  studentId: string,
  courseIds: string[],
  entrySemester: string,
  status?: StudentCourseStatus
): Promise<void> {
  validateEntrySemester(entrySemester);
  const uniqueCourseIds = Array.from(new Set(courseIds.filter(Boolean)));
  if (uniqueCourseIds.length === 0) return;

  // Buscar ou criar período letivo uma vez para todos os cursos
  const academicPeriod = await getOrCreateAcademicPeriod(entrySemester);

  await Promise.all(
    uniqueCourseIds.map((courseId) =>
      api.post('/student-courses', {
        studentId,
        courseId,
        entryAcademicPeriodId: academicPeriod.id,
        status,
      } as CreateStudentCoursePayload)
    )
  );
}

function validateEntrySemester(entrySemester: string) {
  const regex = /^\d{4}-(1|2)$/;
  if (!regex.test(entrySemester)) {
    throw new Error("Semestre de ingresso inválido. Use o formato 'YYYY-1' ou 'YYYY-2'.");
  }
}

export interface StudentCourseLink {
  id: string; // ID do link (StudentCourse)
  courseId: string;
  courseName: string;
  entrySemester?: string;
  status: StudentCourseStatus;
}

// Get student courses with link information (com IDs dos links)
export async function getStudentCourses(studentId: string): Promise<StudentCourseLink[]> {
  try {
    // Buscar links completos do aluno (com IDs)
    const { data: links } = await api.get<any[]>(`/student-courses/users/${studentId}/links`);
    
    return links.map((link: any) => ({
      id: link.id, // ID do link StudentCourse
      courseId: link.course?.id || link.courseId,
      courseName: link.course?.name || link.courseName || 'Curso sem nome',
      entrySemester: link.entryAcademicPeriod?.period?.replace('.', '-') || link.entrySemester,
      status: link.status || 'ACTIVE' as StudentCourseStatus,
    }));
  } catch (error: any) {
    // Se o endpoint não existir, tentar o endpoint antigo
    if (error.response?.status === 404) {
      try {
        const { data: courses } = await api.get<any[]>(`/users/${studentId}/courses`);
        return courses.map((course: any) => ({
          id: course.id, // Usar course ID como fallback
          courseId: course.id,
          courseName: course.name || course.code || 'Curso sem nome',
          entrySemester: undefined,
          status: 'ACTIVE' as StudentCourseStatus,
        }));
      } catch (fallbackError) {
        console.error("Erro ao buscar cursos do aluno:", fallbackError);
        throw new Error("Não foi possível carregar os cursos do aluno.");
      }
    }
    console.error("Erro ao buscar cursos do aluno:", error);
    throw new Error("Não foi possível carregar os cursos do aluno.");
  }
}

// Remover vínculo aluno-curso por studentId e courseId
export async function removeStudentCourse(studentId: string, courseId: string): Promise<void> {
  try {
    // Tentar o novo endpoint primeiro
    await api.delete(`/student-courses/users/${studentId}/courses/${courseId}`);
  } catch (error: any) {
    // Se o endpoint não existir (404), tentar buscar o link ID primeiro
    if (error.response?.status === 404) {
      // Buscar todos os links do aluno através do endpoint de cursos
      // e tentar encontrar o link específico
      try {
        // Buscar links através do endpoint de links (se existir)
        const { data: links } = await api.get<any[]>(`/student-courses/users/${studentId}/links`);
        const link = links.find((l: any) => 
          (l.course?.id === courseId || l.courseId === courseId)
        );
        if (link && link.id) {
          // Remover usando o link ID
          await api.delete(`/student-courses/${link.id}`);
          return;
        }
      } catch (linkError) {
        // Se não conseguir buscar links, lançar erro original
      }
      // Se não encontrou o link, lançar erro informativo
      throw new Error(`Não foi possível remover o vínculo. O endpoint de remoção pode não estar disponível no servidor.`);
    }
    throw error;
  }
}

// Remover vínculo aluno-curso por link ID (método alternativo)
export async function removeStudentCourseLink(linkId: string): Promise<void> {
  await api.delete(`/student-courses/${linkId}`);
}



