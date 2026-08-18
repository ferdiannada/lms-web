import { getToken, removeToken } from './storage';

export const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const getWsUrl = (path: string): string => {
  const base = import.meta.env.VITE_API_BASE_URL || '/api/v1';
  if (base.startsWith('/')) {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${proto}//${window.location.host}${base}${path}`;
  }
  const proto = base.startsWith('https:') ? 'wss:' : 'ws:';
  const cleanBase = base.replace(/^https?:\/\//, '');
  return `${proto}//${cleanBase}${path}`;
};

// In-Flight GET request deduplication map
const _inFlightRequests = new Map<string, Promise<any>>();

// Generic HTTP fetch helper
export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE}${endpoint}`;
  const isGet = !options.method || options.method.toUpperCase() === 'GET';
  const dedupKey = `${token ? token.slice(-16) : 'anon'}:${url}`;

  // Deduplicate in-flight GET requests if no custom signal or body
  if (isGet && !options.signal) {
    const existing = _inFlightRequests.get(dedupKey);
    if (existing) {
      return existing as Promise<T>;
    }
  }

  const fetchPromise = (async () => {
    try {
      const res = await fetch(url, {
        ...options,
        headers,
      });

      if (res.status === 401) {
        if (endpoint !== '/auth/login') {
          removeToken();
          localStorage.removeItem('pedia_user');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          throw new Error('Sesi telah berakhir. Silakan login kembali.');
        }
      }

      if (res.status === 403) {
        const textClone = await res.clone().text();
        let errData: any = {};
        try { errData = JSON.parse(textClone); } catch {}
        if (errData.error === 'REQUIRE_PASSWORD_CHANGE') {
          if (window.location.pathname !== '/force-change-password') {
             window.location.href = '/force-change-password';
          }
          throw new Error('REQUIRE_PASSWORD_CHANGE');
        }
      }

      const contentType = res.headers.get('content-type') || '';
      const text = await res.text();

      if (!contentType.includes('application/json')) {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: Gagal menghubungi backend API.`);
        }
        throw new Error(
          `Backend API mengembalikan respon non-JSON (HTML). Pastikan backend server API berjalan dan port tidak bertabrakan dengan aplikasi lain.`
        );
      }

      let data: any;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error('Format respon dari server bukan JSON yang valid.');
      }

      if (!res.ok) {
        throw new Error(data.error || data.message || `HTTP Error ${res.status}`);
      }

      // Return empty object for 204 No Content
      if (res.status === 204) {
        return {} as T;
      }

      return data as T;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // Silent on intentional cancellation
        throw err;
      }
      console.warn(`[API] Error on ${endpoint}:`, err.message);
      throw err;
    } finally {
      if (isGet) {
        _inFlightRequests.delete(dedupKey);
      }
    }
  })();

  if (isGet && !options.signal) {
    _inFlightRequests.set(dedupKey, fetchPromise);
  }

  return fetchPromise;
}

export async function uploadFile(file: File): Promise<{ file_name: string; file_url: string }> {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file);

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const contentType = res.headers.get('content-type') || '';
  const text = await res.text();

  let data: any = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    // not JSON
  }

  if (!res.ok) {
    throw new Error(data.error || data.message || `Upload gagal (HTTP ${res.status})`);
  }

  if (!contentType.includes('application/json')) {
    throw new Error(`Upload gagal: respon server non-JSON.`);
  }

  return data;
}
