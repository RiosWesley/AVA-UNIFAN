import api from './api'

export type TeacherCourse = {
  id: string
  teacherId: string
  courseId: string
  course: {
    id: string
    name: string
    code: string
    department?: {
      id: string
      name: string
    }
  }
  createdAt: string
}

export interface CreateTeacherCoursePayload {
  teacherId: string
  courseId: string
}

export async function getTeacherCourses(teacherId: string): Promise<TeacherCourse[]> {
  const { data } = await api.get<TeacherCourse[]>(`/teacher-courses`, {
    params: { teacherId }
  })
  return data || []
}

export async function createTeacherCourse(
  payload: CreateTeacherCoursePayload
): Promise<TeacherCourse> {
  const { data } = await api.post<TeacherCourse>('/teacher-courses', payload)
  return data
}

export async function deleteTeacherCourse(teacherCourseId: string): Promise<void> {
  await api.delete(`/teacher-courses/${teacherCourseId}`)
}



