import { API_BASE_URL } from '../config/apiConfig';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

// Multi-tier persistent token storage across Web Worker, Browser Window, Cookies, and localStorage
const memoryStore: Record<string, string> = {};
const TOKEN_KEY = 'pedia_jwt_token';

export const getToken = (): string | null => {
  // 1. Check Cookies (Primary cross-reload persistence mechanism for Web Workers/Iframes)
  try {
    if (typeof document !== 'undefined' && document && document.cookie) {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const c = cookies[i].trim();
        if (c.startsWith(`${TOKEN_KEY}=`)) {
          const val = decodeURIComponent(c.substring(TOKEN_KEY.length + 1));
          if (val && val !== 'null' && val !== 'undefined' && val.trim() !== '') {
            return val;
          }
        }
      }
    }
  } catch (e) {}

  // 2. Check localStorage
  try {
    if (typeof localStorage !== 'undefined' && localStorage) {
      const val = localStorage.getItem(TOKEN_KEY);
      if (val && val !== 'null' && val !== 'undefined' && val.trim() !== '') {
        return val;
      }
    }
  } catch (e) {}

  // 3. Check globalThis.localStorage
  try {
    if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
      const val = (globalThis as any).localStorage.getItem(TOKEN_KEY);
      if (val && val !== 'null' && val !== 'undefined' && val.trim() !== '') {
        return val;
      }
    }
  } catch (e) {}

  // 4. Check window.localStorage
  try {
    if (typeof window !== 'undefined' && (window as any).localStorage) {
      const val = (window as any).localStorage.getItem(TOKEN_KEY);
      if (val && val !== 'null' && val !== 'undefined' && val.trim() !== '') {
        return val;
      }
    }
  } catch (e) {}

  // 5. Memory store fallback
  const memVal = memoryStore[TOKEN_KEY];
  if (memVal && memVal !== 'null' && memVal !== 'undefined' && memVal.trim() !== '') {
    return memVal;
  }

  return null;
};

export const setToken = (token: string): void => {
  if (!token) return;
  memoryStore[TOKEN_KEY] = token;

  // 1. Save to Cookie (30 days max-age)
  try {
    if (typeof document !== 'undefined' && document) {
      const maxAge = 60 * 60 * 24 * 30;
      document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
    }
  } catch (e) {}

  // 2. Save to localStorage
  try {
    if (typeof localStorage !== 'undefined' && localStorage) {
      localStorage.setItem(TOKEN_KEY, token);
    }
  } catch (e) {}

  // 3. Save to globalThis.localStorage
  try {
    if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
      (globalThis as any).localStorage.setItem(TOKEN_KEY, token);
    }
  } catch (e) {}

  // 4. Save to window.localStorage
  try {
    if (typeof window !== 'undefined' && (window as any).localStorage) {
      (window as any).localStorage.setItem(TOKEN_KEY, token);
    }
  } catch (e) {}
};

export const removeToken = (): void => {
  delete memoryStore[TOKEN_KEY];

  // 1. Remove from Cookie
  try {
    if (typeof document !== 'undefined' && document) {
      document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  } catch (e) {}

  // 2. Remove from localStorage
  try {
    if (typeof localStorage !== 'undefined' && localStorage) {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (e) {}

  // 3. Remove from globalThis.localStorage
  try {
    if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
      (globalThis as any).localStorage.removeItem(TOKEN_KEY);
    }
  } catch (e) {}

  // 4. Remove from window.localStorage
  try {
    if (typeof window !== 'undefined' && (window as any).localStorage) {
      (window as any).localStorage.removeItem(TOKEN_KEY);
    }
  } catch (e) {}
};

export async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs = 5000,
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type');
    let data: any = null;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMsg =
        typeof data === 'object' && data?.error
          ? data.error
          : `Request failed with status ${response.status}`;
      throw new ApiError(errorMsg, response.status, data);
    }

    return data as T;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new ApiError('Permintaan ke server tenggat waktu (Timeout)', 408);
    }
    throw error;
  }
}
