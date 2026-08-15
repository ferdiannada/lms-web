import { User } from '../types';

export const getToken = (): string | null => localStorage.getItem('pedia_token');
export const setToken = (token: string) => localStorage.setItem('pedia_token', token);
export const removeToken = () => localStorage.removeItem('pedia_token');

export const getStoredUser = (): User | null => {
  const raw = localStorage.getItem('pedia_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setStoredUser = (user: User) => {
  localStorage.setItem('pedia_user', JSON.stringify(user));
};
