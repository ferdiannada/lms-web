import { ClassRoom, ClassMember, Rombel } from '../types';
import { request } from './client';

// In-Memory Cache Store for fast UI rendering
let _classesCache: { data: ClassRoom[]; timestamp: number } | null = null;
let _rombelsCache: { data: Rombel[]; timestamp: number } | null = null;

export function normalizeClass(raw: any): ClassRoom {
  if (!raw) return {} as ClassRoom;
  const guru = raw.guru || {};
  const rombelObj = raw.rombel || {};
  return {
    id: raw.id,
    name: raw.name,
    code: raw.class_code || raw.code || '',
    class_code: raw.class_code || raw.code || '',
    subject: raw.subject || raw.name || '',
    rombel: rombelObj.name || raw.rombel_name || raw.rombel || 'Semua Rombel',
    rombel_id: raw.rombel_id,
    teacher_id: raw.guru_id || raw.teacher_id || guru.id || '',
    teacher_name: guru.name || raw.teacher_name || 'Guru Pengajar',
    teacher_avatar: guru.avatar_url || raw.teacher_avatar || '',
    description: raw.description || '',
    banner_color: raw.cover_color || raw.banner_color || 'from-indigo-600 to-violet-700',
    cover_color: raw.cover_color,
    created_at: raw.created_at || new Date().toISOString(),
    student_count: raw.member_count ?? raw.student_count ?? 0,
    member_count: raw.member_count ?? raw.student_count ?? 0,
    material_count: raw.material_count ?? 0,
    assignment_count: raw.assignment_count ?? 0,
    quiz_count: raw.quiz_count ?? 0,
  };
}

export const classService = {
  getCachedClasses(): ClassRoom[] | null {
    if (_classesCache && Date.now() - _classesCache.timestamp < 120000) {
      return _classesCache.data;
    }
    try {
      const stored = sessionStorage.getItem('pedia_classes_cache');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return null;
  },

  async getClasses(forceRefresh: boolean = false, options: { signal?: AbortSignal } = {}): Promise<ClassRoom[]> {
    if (!forceRefresh && _classesCache && Date.now() - _classesCache.timestamp < 60000) {
      return _classesCache.data;
    }

    const raw = await request<any[]>('/classes', options);
    const data = Array.isArray(raw) ? raw.map(normalizeClass) : [];
    _classesCache = { data, timestamp: Date.now() };
    try {
      sessionStorage.setItem('pedia_classes_cache', JSON.stringify(data));
    } catch {}
    return data;
  },

  async getClassDetail(id: string, options: { signal?: AbortSignal } = {}): Promise<ClassRoom> {
    const raw = await request<any>(`/classes/${id}`, options);
    return normalizeClass(raw);
  },

  async getRombels(forceRefresh: boolean = false, options: { signal?: AbortSignal } = {}): Promise<Rombel[]> {
    if (!forceRefresh && _rombelsCache && Date.now() - _rombelsCache.timestamp < 300000) {
      return _rombelsCache.data;
    }
    const raw = await request<Rombel[]>('/classes/rombels', options);
    const list = Array.isArray(raw) ? raw : [];

    const excludedKeywords = [
      'bahasa jepang',
      'jepang',
      'tsm',
      'dkv',
      'perbankan',
      'syariah',
      'pbs',
    ];

    const filtered = list.filter((r) => {
      const name = (r.name || '').toLowerCase();
      return !excludedKeywords.some((keyword) => name.includes(keyword));
    });

    const rombelMap = new Map<string, Rombel>();
    filtered.forEach((r) => {
      const key = (r.name || '').trim().toUpperCase();
      const existing = rombelMap.get(key);

      if (!existing) {
        rombelMap.set(key, r);
      } else {
        const existingCount = existing.student_count || 0;
        const currentCount = r.student_count || 0;
        if (currentCount > existingCount) {
          rombelMap.set(key, r);
        }
      }
    });

    const cleanRombels = Array.from(rombelMap.values()).sort((a, b) => {
      if ((a.tingkat || 0) !== (b.tingkat || 0)) {
        return (a.tingkat || 0) - (b.tingkat || 0);
      }
      return (a.name || '').localeCompare(b.name || '');
    });

    _rombelsCache = { data: cleanRombels, timestamp: Date.now() };
    return cleanRombels;
  },

  async createClass(data: { name: string; description?: string; rombel_id: string; cover_color?: string }): Promise<ClassRoom> {
    _classesCache = null;
    try {
      sessionStorage.removeItem('pedia_classes_cache');
    } catch {}
    const raw = await request<any>('/classes', {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        description: data.description || '',
        rombel_id: data.rombel_id,
        cover_color: data.cover_color || '#6366F1',
      }),
    });
    return normalizeClass(raw);
  },

  async joinClass(code: string): Promise<ClassRoom> {
    _classesCache = null;
    try {
      sessionStorage.removeItem('pedia_classes_cache');
    } catch {}
    const res = await request<{ message: string; class: any }>('/classes/join', {
      method: 'POST',
      body: JSON.stringify({ class_code: code.trim().toUpperCase() }),
    });
    return normalizeClass(res.class);
  },

  async getClassMembers(classId: string, options?: RequestInit): Promise<ClassMember[]> {
    const raw = await request<any[]>(`/classes/${classId}/members`, options);
    if (!Array.isArray(raw)) return [];
    return raw.map((u) => ({
      id: u.id,
      class_id: classId,
      user_id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatar_url: u.avatar_url,
      nip_nik_nisn: u.nip_nik_nisn,
      nisn: u.role === 'siswa' ? u.nip_nik_nisn : undefined,
      joined_at: u.created_at || new Date().toISOString(),
    }));
  },

  async deleteClass(classId: string): Promise<{ success: boolean; message?: string }> {
    _classesCache = null;
    try {
      sessionStorage.removeItem('pedia_classes_cache');
    } catch {}
    return await request<{ success: boolean; message?: string }>(`/classes/${classId}`, {
      method: 'DELETE',
    });
  },
};

