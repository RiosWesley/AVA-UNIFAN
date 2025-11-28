import api from './api';

export interface AttendanceTableCell {
  attendanceId: string;
  date: string;
  present: boolean;
}

export interface AttendanceTableRow {
  enrollmentId: string;
  studentId?: string;
  studentName?: string;
  attendances?: AttendanceTableCell[];
  // Campos opcionais para compatibilidade com versões antigas
  attendancePercentage?: number;
  presentPercentage?: number;
  frequency?: number;
  percentage?: number;
}

export async function getClassAttendanceTable(classId: string): Promise<AttendanceTableRow[]> {
  const { data } = await api.get(`/attendances/class/${classId}/table`);
  return data;
}


