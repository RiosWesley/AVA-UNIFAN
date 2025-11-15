import api from './api';

export type Department = {
  id: string;
  name: string;
  coordinator?: { id: string; name: string; email: string } | null;
};

export type Teacher = {
  id: string;
  name: string;
  email: string;
  usuario?: string;
  telefone?: string;
  cpf?: string;
  roles?: Array<{ id: string; name: string }>;
};

export async function getDepartments(coordinatorId?: string): Promise<Department[]> {
  const params = coordinatorId ? { coordinatorId } : {};
  const { data } = await api.get<Department[]>('/departments', { params });
  return data;
}

export async function getDepartmentTeachers(departmentId: string): Promise<Teacher[]> {
  const { data } = await api.get<Teacher[]>(`/departments/${departmentId}/teachers`);
  return data;
}

export async function addTeachersToDepartment(
  departmentId: string,
  userIds: string[],
): Promise<Department> {
  const { data } = await api.post<Department>(`/departments/${departmentId}/teachers`, {
    userIds,
  });
  return data;
}

export async function removeTeacherFromDepartment(
  departmentId: string,
  userIdId: string,
): Promise<void> {
  await api.delete(`/departments/${departmentId}/teachers/${userIdId}`);
}

export async function setDepartmentCoordinator(
  departmentId: string,
  coordinatorId: string | null,
): Promise<Department> {
  const { data } = await api.put<Department>(`/departments/${departmentId}/coordinator`, {
    coordinatorId,
  });
  return data;
}

