/**
 * Authentication utility functions
 */

export interface AuthUser {
  id: string;
  username: string;
  role: 'Administrador' | 'Agente externo' | 'Editor';
  firstName: string;
  lastName: string;
}

export const isAuthenticated = (): boolean => {
  return localStorage.getItem('isAuthenticated') === 'true';
};

export const getAuthUser = (): AuthUser | null => {
  const userStr = localStorage.getItem('authUser');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const getAdminUser = (): string | null => {
  const user = getAuthUser();
  return user?.username || null;
};

export const getUserRole = (): string | null => {
  const user = getAuthUser();
  return user?.role || null;
};

export const isAdmin = (): boolean => {
  const user = getAuthUser();
  return user?.role === 'Administrador';
};

export const logout = (): void => {
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('authUser');
  // Mantener compatibilidad con código antiguo
  localStorage.removeItem('adminUser');
};

export const login = (user: AuthUser): void => {
  localStorage.setItem('isAuthenticated', 'true');
  localStorage.setItem('authUser', JSON.stringify(user));
  // Mantener compatibilidad con código antiguo
  localStorage.setItem('adminUser', user.username);
};