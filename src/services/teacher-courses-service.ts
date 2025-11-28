export type TeacherCourse = {
  course: {
    id: string
    name: string
    code: string
  }
}

export async function getTeacherCourses(teacherId: string): Promise<TeacherCourse[]> {
  // TODO: Implement API call to get teacher courses
  return []
}



