import { User } from '../types';
import { request } from './client';
import { setToken, removeToken, setStoredUser } from './storage';

export function normalizeUser(raw: any): User {
  if (!raw) return {} as User;
  const role = raw.role || 'siswa';
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    role,
    nip_nik_nisn: raw.nip_nik_nisn || '',
    nisn: role === 'siswa' ? (raw.nip_nik_nisn || raw.nisn) : undefined,
    nip: role === 'guru' ? (raw.nip_nik_nisn || raw.nip) : undefined,
    phone: raw.phone || '',
    rombel: raw.rombel_name || (raw.rombel && typeof raw.rombel === 'object' ? raw.rombel.name : raw.rombel) || '',
    rombel_id: raw.rombel_id || (raw.rombel && typeof raw.rombel === 'object' ? raw.rombel.id : null),
    avatar_url: raw.avatar_url || '',
    dapodik_id: raw.dapodik_id || '',
    is_initial_password: raw.is_initial_password ?? false,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
  };
}

export const authService = {
  async login(identifier: string, pass: string): Promise<{ token: string; user: User }> {
    const res = await request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password: pass }),
    });

    const normalizedUser = normalizeUser(res.user);
    setToken(res.token);
    setStoredUser(normalizedUser);
    return { token: res.token, user: normalizedUser };
  },

  async getMe(): Promise<User> {
    const res = await request<any>('/auth/me');
    const user = normalizeUser(res);
    setStoredUser(user);
    return user;
  },

  async changePassword(currentPass: string, nextPass: string): Promise<{ message: string; token?: string }> {
    const res = await request<{ message: string; token?: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ old_password: currentPass, new_password: nextPass }),
    });
    
    if (res.token) {
      setToken(res.token);
    }
    
    return res;
  },

  async updateProfile(data: { name?: string; phone?: string; avatar_url?: string }): Promise<User> {
    const res = await request<{ message: string; user: any }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    const user = normalizeUser(res.user);
    setStoredUser(user);
    return user;
  },

  async logout(): Promise<void> {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network error on logout
    } finally {
      removeToken();
      localStorage.removeItem('pedia_user');
    }
  },
};
