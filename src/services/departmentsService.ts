import api from './api';

export type Department = {
  id: string;
  name: string;
  coordinator?: { id: string; name: string; email: string } | null;
  teachers?: Teacher[];
  courses?: Array<{ id: string; name: string; code?: string }>;
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

export interface CreateDepartmentDto {
  name: string;
  coordinatorId?: string;
}

export interface UpdateDepartmentDto {
  name?: string;
  coordinatorId?: string;
}

export async function getDepartments(coordinatorId?: string): Promise<Department[]> {
  const params = coordinatorId ? { coordinatorId } : {};
  const { data } = await api.get<Department[]>('/departments', { params });
  return data;
}

export async function getDepartment(id: string): Promise<Department> {
  const { data } = await api.get<Department>(`/departments/${id}`);
  return data;
}

export async function createDepartment(payload: CreateDepartmentDto): Promise<Department> {
  const { data } = await api.post<Department>('/departments', payload);
  return data;
}

export async function updateDepartment(
  id: string,
  payload: UpdateDepartmentDto,
): Promise<Department> {
  const { data } = await api.patch<Department>(`/departments/${id}`, payload);
  return data;
}

export async function deleteDepartment(id: string): Promise<void> {
  await api.delete(`/departments/${id}`);
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

// Get departments for a user (teacher)
export async function getUserDepartments(userId: string): Promise<Department[]> {
  const { data } = await api.get<Department[]>(`/users/${userId}/departments`);
  return data;
}

// Get department where user is coordinator
export async function getCoordinatorDepartment(userId: string): Promise<Department | null> {
  try {
    const departments = await getDepartments();
    const dept = departments.find(d => d.coordinator?.id === userId);
    return dept || null;
  } catch (error) {
    console.error("Erro ao buscar departamento do coordenador:", error);
    return null;
  }
}

