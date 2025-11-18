import api from './api';

export interface AttendanceTableRow {
  enrollmentId: string;
  studentId?: string;
  studentName?: string;
  attendancePercentage?: number;
  presentPercentage?: number;
  frequency?: number;
  percentage?: number;
}

export async function getClassAttendanceTable(classId: string): Promise<AttendanceTableRow[]> {
  const { data } = await api.get(`/attendances/class/${classId}/table`);
  return data;
}


