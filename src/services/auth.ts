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

/**
 * Verifica se o usuário está autenticado (tem token válido)
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('ava:token');
}

/**
 * Obtém o token de autenticação
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('ava:token');
}

/**
 * Obtém a role do usuário armazenada no localStorage
 */
export function getStoredUserRole(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('ava:userRole');
}

/**
 * Verifica se o usuário tem uma role específica
 */
export async function hasRole(role: string): Promise<boolean> {
  try {
    const user = await me();
    return (user.roles || []).includes(role);
  } catch {
    return false;
  }
}

