import api from './api';

export type StudentCourseStatus = 'ACTIVE' | 'INACTIVE';

export interface CreateStudentCoursePayload {
  studentId: string;
  courseId: string;
  entrySemester: string; // YYYY-1|2
  status?: StudentCourseStatus;
}

export async function linkStudentToCourse(payload: CreateStudentCoursePayload): Promise<void> {
  validateEntrySemester(payload.entrySemester);
  await api.post('/student-courses', payload);
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

  await Promise.all(
    uniqueCourseIds.map((courseId) =>
      api.post('/student-courses', {
        studentId,
        courseId,
        entrySemester,
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


