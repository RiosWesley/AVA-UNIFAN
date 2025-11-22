// Custom hooks for Dashboard data using React Query
"use client"

import { useQuery } from '@tanstack/react-query'
import { apiClient, calculateStudentMetrics, type Schedule, type Grade, type Activity, type News, type ScheduleWithRelations, type LessonPlanWithRelations } from '@/lib/api-client'

// Key factory for React Query cache
export const queryKeys = {
  student: ['student'] as const,
  schedules: (studentId: string) => ['schedules', studentId] as const,
  grades: (studentId: string) => ['grades', studentId] as const,
  attendance: (studentId: string) => ['attendance', studentId] as const,
  activities: (studentId: string) => ['activities', studentId] as const,
  news: (studentId: string) => ['news', studentId] as const,
  enrollments: (studentId: string) => ['enrollments', studentId] as const,
  agendaSchedules: (studentId: string) => ['agendaSchedules', studentId] as const,
  agendaLessonPlans: (studentId: string) => ['agendaLessonPlans', studentId] as const
}

// Hook to get current student data
export function useCurrentStudent() {
  return useQuery({
    queryKey: queryKeys.student,
    queryFn: () => apiClient.getCurrentStudent(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Hook to get student schedules (aggregated data)
export function useStudentSchedules(studentId: string) {
  return useQuery({
    queryKey: queryKeys.schedules(studentId),
    queryFn: () => apiClient.getStudentSchedules(studentId),
    enabled: !!studentId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

// Hook to get student grades
export function useStudentGrades(studentId: string) {
  return useQuery({
    queryKey: queryKeys.grades(studentId),
    queryFn: () => apiClient.getStudentGrades(studentId),
    enabled: !!studentId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Hook to get student attendance
export function useStudentAttendance(studentId: string) {
  return useQuery({
    queryKey: queryKeys.attendance(studentId),
    queryFn: () => apiClient.getStudentAttendance(studentId),
    enabled: !!studentId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Hook to get student activities
export function useStudentActivities(studentId: string) {
  return useQuery({
    queryKey: queryKeys.activities(studentId),
    queryFn: () => apiClient.getStudentActivities(studentId),
    enabled: !!studentId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

// Hook to get news/announcements for student
export function useNews(studentId: string) {
  return useQuery({
    queryKey: queryKeys.news(studentId),
    queryFn: () => apiClient.getNewsForStudent(studentId),
    enabled: !!studentId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

// Hook to get student enrollments
export function useStudentEnrollments(studentId: string) {
  return useQuery({
    queryKey: queryKeys.enrollments(studentId),
    queryFn: () => apiClient.getStudentEnrollments(studentId),
    enabled: !!studentId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

// Hook to get student schedules for agenda
export function useStudentAgendaSchedules(studentId: string) {
  return useQuery({
    queryKey: queryKeys.agendaSchedules(studentId),
    queryFn: () => apiClient.getStudentSchedulesForAgenda(studentId),
    enabled: !!studentId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

// Hook to get student lesson plans for agenda
export function useStudentAgendaLessonPlans(studentId: string) {
  return useQuery({
    queryKey: queryKeys.agendaLessonPlans(studentId),
    queryFn: () => apiClient.getStudentLessonPlans(studentId),
    enabled: !!studentId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

// Combined hook for Dashboard data
export function useDashboardData(studentId: string) {
  const student = useCurrentStudent()
  const schedules = useStudentSchedules(studentId)
  const grades = useStudentGrades(studentId)
  const attendance = useStudentAttendance(studentId)
  const activities = useStudentActivities(studentId)
  const news = useNews(studentId)

  // Computed values
  const attendancePercentage = attendance.data
    ? calculateStudentMetrics.calculateAttendancePercentage(attendance.data)
    : 0

  const gradeAverage = grades.data
    ? calculateStudentMetrics.calculateGradeAverage(grades.data)
    : 0

  const pendingActivitiesCount = activities.data
    ? calculateStudentMetrics.countPendingActivities(activities.data)
    : 0

  const upcomingSchedules = schedules.data
    ? calculateStudentMetrics.getUpcomingSchedules(schedules.data)
    : []

  // Recent grades (last 4)
  const recentGrades = grades.data?.slice(0, 4) || []

  return {
    // Raw data
    student: student.data,
    schedules: schedules.data,
    grades: grades.data,
    attendance: attendance.data,
    activities: activities.data,
    news: news.data,

    // Computed metrics
    attendancePercentage,
    gradeAverage,
    pendingActivitiesCount,
    upcomingSchedules,
    recentGrades,

    // Loading states
    isLoading: student.isLoading || schedules.isLoading || grades.isLoading ||
               attendance.isLoading || activities.isLoading || news.isLoading,

    // Error states
    error: student.error || schedules.error || grades.error ||
          attendance.error || activities.error || news.error,

    // Refetch functions
    refetchAll: () => {
      student.refetch()
      schedules.refetch()
      grades.refetch()
      attendance.refetch()
      activities.refetch()
      news.refetch()
    }
  }
}