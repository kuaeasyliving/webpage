/**
 * Authentication utility functions
 */

export const isAuthenticated = (): boolean => {
  return localStorage.getItem('isAuthenticated') === 'true';
};

export const getAdminUser = (): string | null => {
  return localStorage.getItem('adminUser');
};

export const logout = (): void => {
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('adminUser');
};

export const login = (username: string): void => {
  localStorage.setItem('isAuthenticated', 'true');
  localStorage.setItem('adminUser', username);
};