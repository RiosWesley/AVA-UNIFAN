import api from './api';

export type AuthUser = { id: string; name: string; email: string; roles: string[] };
export type LoginResponse = { access_token: string; user: AuthUser };

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', { email, password });
  return data;
}

export async function me(): Promise<AuthUser> {
  const { data } = await api.get<AuthUser>('/auth/me');
  return data;
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('ava:token');
    localStorage.removeItem('ava:userId');
    localStorage.removeItem('ava:userRole');
  }
}

