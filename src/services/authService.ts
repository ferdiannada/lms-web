import { request, setToken, removeToken } from './api';
import { ENDPOINTS } from '../config/apiConfig';
import type { User } from '../types';

export interface LoginResponse {
  token: string;
  user: User;
}

export const authService = {
  async login(
    identifier: string,
    passwordHashOrRaw: string,
  ): Promise<LoginResponse> {
    const data = await request<LoginResponse>(ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify({
        identifier,
        email: identifier,
        username: identifier,
        password: passwordHashOrRaw,
      }),
    });
    if (data.token) {
      setToken(data.token);
    }
    return data;
  },

  async getMe(): Promise<User> {
    return request<User>(ENDPOINTS.ME, { method: 'GET' });
  },

  async changePassword(
    oldPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    return request<{ message: string }>(ENDPOINTS.CHANGE_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
      }),
    });
  },

  async logout(): Promise<void> {
    try {
      await request(ENDPOINTS.LOGOUT, { method: 'POST' });
    } catch {
      // Ignore logout request errors
    } finally {
      removeToken();
    }
  },
};
