import {
  User,
  ClassRoom,
  ClassMember,
  Material,
  Assignment,
  Submission,
  Quiz,
  QuizAttempt,
  Question,
  ForumPost,
  ForumComment,
  GradebookEntry
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

// Token Management
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

// Generic HTTP fetch helper with mock fallback
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      removeToken();
      localStorage.removeItem('pedia_user');
      window.location.href = '/login';
      throw new Error('Sesi berakhir. Silakan login kembali.');
    }

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || errJson.error || `HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    console.warn(`[API] Connection error on ${endpoint}:`, err.message);
    throw err;
  }
}

// MOCK DATA GENERATOR FOR FALLBACK / OFFLINE DEV MODE (Guru & Siswa only)
export const MOCK_USERS: Record<string, User> = {
  guru: {
    id: 'user-guru-1',
    name: 'Bpk. Ahmad Subagja, M.Kom',
    email: 'guru@smk.sch.id',
    role: 'guru',
    nip: '198503122010011004',
    rombel: 'Rekayasa Perangkat Lunak (RPL)',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    is_initial_password: false,
  },
  siswa: {
    id: 'user-siswa-1',
    name: 'Bagas Aditya Pratama',
    email: 'siswa@smk.sch.id',
    role: 'siswa',
    nisn: '0067812345',
    rombel: 'XII RPL 1',
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80',
    is_initial_password: false,
  },
};

export const MOCK_CLASSES: ClassRoom[] = [
  {
    id: 'cls-1',
    name: 'Pemrograman Web & Perangkat Bergerak',
    code: 'PWPB-XII-RPL1',
    subject: 'Pemrograman Web (PWPB)',
    rombel: 'XII RPL 1',
    teacher_id: 'user-guru-1',
    teacher_name: 'Bpk. Ahmad Subagja, M.Kom',
    description: 'Pembelajaran React JS, REST API Go Gin, dan arsitektur web modern untuk siswa SMK jurusan Rekayasa Perangkat Lunak.',
    banner_color: 'from-indigo-600 to-violet-700',
    created_at: '2026-01-10T08:00:00Z',
    student_count: 36,
    material_count: 12,
    assignment_count: 5,
  },
  {
    id: 'cls-2',
    name: 'Basis Data & Query Advanced SQL',
    code: 'BD-XII-RPL1',
    subject: 'Basis Data (BD)',
    rombel: 'XII RPL 1',
    teacher_id: 'user-guru-1',
    teacher_name: 'Bpk. Ahmad Subagja, M.Kom',
    description: 'PostgreSQL optimization, indexing, stored procedures, dan migrasi database Dapodik.',
    banner_color: 'from-emerald-600 to-teal-700',
    created_at: '2026-01-12T08:00:00Z',
    student_count: 36,
    material_count: 8,
    assignment_count: 3,
  },
  {
    id: 'cls-3',
    name: 'Pemrograman Berorientasi Objek',
    code: 'PBO-XII-RPL2',
    subject: 'Pemrograman Objek (PBO)',
    rombel: 'XII RPL 2',
    teacher_id: 'user-guru-1',
    teacher_name: 'Bpk. Ahmad Subagja, M.Kom',
    description: 'Konsep OOP, Design Patterns, dan Clean Architecture untuk aplikasi enterprise.',
    banner_color: 'from-blue-600 to-cyan-700',
    created_at: '2026-01-15T08:00:00Z',
    student_count: 34,
    material_count: 9,
    assignment_count: 4,
  },
];

export const MOCK_MATERIALS: Material[] = [
  {
    id: 'mat-1',
    class_id: 'cls-1',
    title: 'Modul 1: Integrasi React JS dengan Backend RESTful API Go Gin',
    description: 'Panduan step-by-step membuat client web modern menggunakan React, TypeScript, dan Axios yang terhubung ke server Go Gin.',
    file_name: 'modul-1-react-gogin-smk.pdf',
    file_url: '/uploads/modul-1-react-gogin-smk.pdf',
    file_size: 2450000,
    file_type: 'application/pdf',
    created_by: 'user-guru-1',
    created_at: '2026-02-01T10:00:00Z',
  },
  {
    id: 'mat-2',
    class_id: 'cls-1',
    title: 'Modul 2: State Management & Realtime WebSocket Forum',
    description: 'Implementasi WebSocket untuk realtime chat discussion, mention @user, dan emoji spring reaction di LMS Web.',
    file_name: 'modul-2-websocket-react.pdf',
    file_url: '/uploads/modul-2-websocket-react.pdf',
    file_size: 1890000,
    file_type: 'application/pdf',
    created_by: 'user-guru-1',
    created_at: '2026-02-08T10:00:00Z',
  },
];

export const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg-1',
    class_id: 'cls-1',
    title: 'Tugas 1: Pengembangan Web Portal SMK berbasis React JS',
    instructions: 'Buatlah aplikasi web single-page menggunakan React JS dan Tailwind CSS yang menampilkan dashboard siswa, materi, serta tugas. Unggah link repo GitHub dan file ZIP project.',
    due_date: '2026-08-20T23:59:00Z',
    max_score: 100,
    created_by: 'user-guru-1',
    created_at: '2026-08-01T09:00:00Z',
    pending_grading_count: 2,
    submission: {
      id: 'sub-1',
      assignment_id: 'asg-1',
      student_id: 'user-siswa-1',
      student_name: 'Bagas Aditya Pratama',
      file_name: 'tugas-lms-web-bagas.zip',
      file_url: '/uploads/tugas-lms-web-bagas.zip',
      notes: 'Pak, ini tugas web React JS saya yang sudah terintegrasi dengan backend Go.',
      score: 95,
      feedback: 'Kerja sangat bagus! Tampilan clean dan fitur responsif.',
      submitted_at: '2026-08-05T14:20:00Z',
      graded_at: '2026-08-06T10:00:00Z',
    },
  },
  {
    id: 'asg-2',
    class_id: 'cls-1',
    title: 'Tugas 2: Implementasi Authentication & JWT Middleware',
    instructions: 'Koneksikan form login React JS dengan endpoint POST /api/v1/auth/login dan simpan Bearer Token di localStorage.',
    due_date: '2026-08-25T23:59:00Z',
    max_score: 100,
    created_by: 'user-guru-1',
    created_at: '2026-08-10T09:00:00Z',
    pending_grading_count: 4,
  },
];

export const MOCK_QUIZZES: Quiz[] = [
  {
    id: 'qz-1',
    class_id: 'cls-1',
    title: 'Ujian Tengah Semester: Pemrograman Web React & Go API',
    description: 'Ujian evaluasi teori dan praktik konsep React JS components, state, hooks, serta API Go Gin.',
    duration_minutes: 45,
    max_attempts: 1,
    due_date: '2026-08-30T23:59:00Z',
    created_by: 'user-guru-1',
    created_at: '2026-08-05T08:00:00Z',
    questions_count: 5,
    attempts_count: 28,
    questions: [
      {
        id: 'q-1',
        quiz_id: 'qz-1',
        question_text: 'Komponen utama dalam React JS yang digunakan untuk mengelola state lokal pada Functional Component adalah...',
        option_a: 'useEffect',
        option_b: 'useState',
        option_c: 'useContext',
        option_d: 'useReducer',
        option_e: 'useRef',
        correct_option: 'B',
        points: 20,
      },
      {
        id: 'q-2',
        quiz_id: 'qz-1',
        question_text: 'Di dalam framework Go Gin backend LMS SMK, middleware apakah yang bertugas memverifikasi Bearer JWT Token?',
        option_a: 'RateLimiterMiddleware',
        option_b: 'AuthMiddleware',
        option_c: 'CORSMiddleware',
        option_d: 'AccessLogMiddleware',
        option_e: 'GzipMiddleware',
        correct_option: 'B',
        points: 20,
      },
      {
        id: 'q-3',
        quiz_id: 'qz-1',
        question_text: 'Fitur apakah di React yang memfasilitasi navigasi antar halaman tanpa perlu reload seluruh dokumen browser?',
        option_a: 'React Router DOM',
        option_b: 'Axios Interceptor',
        option_c: 'Vite Plugin',
        option_d: 'Tailwind JIT Engine',
        option_e: 'Web Worker API',
        correct_option: 'A',
        points: 20,
      },
      {
        id: 'q-4',
        quiz_id: 'qz-1',
        question_text: 'Method HTTP manakah yang paling sesuai digunakan untuk mengirimkan data login (email dan password)?',
        option_a: 'GET',
        option_b: 'POST',
        option_c: 'PUT',
        option_d: 'DELETE',
        option_e: 'PATCH',
        correct_option: 'B',
        points: 20,
      },
      {
        id: 'q-5',
        quiz_id: 'qz-1',
        question_text: 'Apakah keunggulan utama penggunaan TypeScript dibanding JavaScript biasa dalam pengembangan Web LMS skala besar?',
        option_a: 'Ukuran file bundle menjadi 50% lebih kecil',
        option_b: 'Static Type Checking yang mencegah runtime error tipe data',
        option_c: 'Otomatis membuat database PostgreSQL di backend',
        option_d: 'Menghilangkan kebutuhan styling CSS',
        option_e: 'Menggantikan fungsi web browser',
        correct_option: 'B',
        points: 20,
      },
    ],
  },
];

export const MOCK_POSTS: ForumPost[] = [
  {
    id: 'post-1',
    class_id: 'cls-1',
    user_id: 'user-guru-1',
    user_name: 'Bpk. Ahmad Subagja, M.Kom',
    user_role: 'guru',
    user_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    title: 'Pengumuman Persiapan Sertifikasi Keahlian Web Dev SMK 2026',
    content: 'Selamat pagi siswa-siswi XII RPL 1. Mohon pastikan seluruh Tugas 1 dan Tugas 2 di LMS ini sudah diselesaikan. Minggu depan kita mulai sesi simulasi project berbasis React JS & Go Gin API.',
    is_pinned: true,
    reactions: [
      { emoji: '👍', count: 18, user_reacted: true },
      { emoji: '🔥', count: 12, user_reacted: true },
      { emoji: '🙌', count: 7, user_reacted: false },
    ],
    comments_count: 2,
    created_at: '2026-08-12T08:30:00Z',
    comments: [
      {
        id: 'c-1',
        post_id: 'post-1',
        user_id: 'user-siswa-1',
        user_name: 'Bagas Aditya Pratama',
        user_role: 'siswa',
        user_avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80',
        content: 'Siap Pak! Terima kasih infonya. Apakah untuk ujian UTS minggu depan boleh membuka dokumentasi React?',
        created_at: '2026-08-12T09:00:00Z',
        replies: [
          {
            id: 'c-2',
            post_id: 'post-1',
            user_id: 'user-guru-1',
            user_name: 'Bpk. Ahmad Subagja, M.Kom',
            user_role: 'guru',
            user_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
            parent_id: 'c-1',
            content: 'Boleh @Bagas Aditya Pratama, ujian bersifat open-doc untuk cheatsheet API.',
            created_at: '2026-08-12T09:15:00Z',
          },
        ],
      },
    ],
  },
];

export const MOCK_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-1',
    assignment_id: 'asg-1',
    student_id: 'user-siswa-1',
    student_name: 'Bagas Aditya Pratama',
    file_name: 'tugas-lms-web-bagas.zip',
    file_url: '/uploads/tugas-lms-web-bagas.zip',
    notes: 'Pak, ini tugas web React JS saya yang sudah terintegrasi dengan backend Go.',
    score: 95,
    feedback: 'Kerja sangat bagus! Tampilan clean dan fitur responsif.',
    submitted_at: '2026-08-05T14:20:00Z',
    graded_at: '2026-08-06T10:00:00Z',
  },
  {
    id: 'sub-2',
    assignment_id: 'asg-1',
    student_id: 'user-siswa-2',
    student_name: 'Dinda Putri Rahayu',
    file_name: 'tugas-lms-dinda.zip',
    file_url: '/uploads/tugas-lms-dinda.zip',
    notes: 'Sudah selesai Pak.',
    submitted_at: '2026-08-07T11:00:00Z',
  },
  {
    id: 'sub-3',
    assignment_id: 'asg-1',
    student_id: 'user-siswa-3',
    student_name: 'Fikri Haikal',
    file_name: 'tugas-lms-fikri.zip',
    file_url: '/uploads/tugas-lms-fikri.zip',
    notes: 'Tugas React PWPB Fikri XII RPL 1.',
    submitted_at: '2026-08-08T09:15:00Z',
  },
];

// API Functions for Guru & Siswa
export const api = {
  // Auth
  async login(email: string, pass: string): Promise<{ token: string; user: User }> {
    try {
      const res = await request<{ token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: pass }),
      });
      setToken(res.token);
      setStoredUser(res.user);
      return res;
    } catch {
      // Mock Fallback for Guru & Siswa
      let mockRole: 'guru' | 'siswa' = 'siswa';
      if (email.includes('guru')) mockRole = 'guru';

      const user = MOCK_USERS[mockRole] || {
        id: `user-${Date.now()}`,
        name: email.split('@')[0].toUpperCase(),
        email,
        role: mockRole,
      };
      const token = `mock-token-${Date.now()}`;
      setToken(token);
      setStoredUser(user);
      return { token, user };
    }
  },

  async getMe(): Promise<User> {
    try {
      return await request<User>('/auth/me');
    } catch {
      return getStoredUser() || MOCK_USERS.siswa;
    }
  },

  async changePassword(current: string, next: string): Promise<{ message: string }> {
    try {
      return await request<{ message: string }>('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ current_password: current, new_password: next }),
      });
    } catch {
      return { message: 'Kata sandi berhasil diperbarui.' };
    }
  },

  // Classes (Guru & Siswa)
  async getClasses(): Promise<ClassRoom[]> {
    try {
      return await request<ClassRoom[]>('/classes');
    } catch {
      return MOCK_CLASSES;
    }
  },

  async getClassDetail(id: string): Promise<ClassRoom> {
    try {
      return await request<ClassRoom>(`/classes/${id}`);
    } catch {
      return MOCK_CLASSES.find((c) => c.id === id) || MOCK_CLASSES[0];
    }
  },

  async joinClass(code: string): Promise<ClassRoom> {
    try {
      return await request<ClassRoom>('/classes/join', {
        method: 'POST',
        body: JSON.stringify({ code }),
      });
    } catch {
      const cls = MOCK_CLASSES.find((c) => c.code.toLowerCase() === code.toLowerCase());
      if (!cls) throw new Error('Kode kelas tidak ditemukan. Periksa kembali kode dari Guru.');
      return cls;
    }
  },

  async createClass(data: Partial<ClassRoom>): Promise<ClassRoom> {
    try {
      return await request<ClassRoom>('/classes', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      const newCls: ClassRoom = {
        id: `cls-${Date.now()}`,
        name: data.name || 'Kelas Baru SMK',
        code: `KLS-${Math.floor(1000 + Math.random() * 9000)}`,
        subject: data.subject || 'Mata Pelajaran',
        rombel: data.rombel || 'XII RPL 1',
        teacher_id: data.teacher_id || 'user-guru-1',
        teacher_name: 'Bpk. Ahmad Subagja, M.Kom',
        description: data.description || '',
        banner_color: 'from-violet-600 to-indigo-800',
        created_at: new Date().toISOString(),
        student_count: 0,
        material_count: 0,
        assignment_count: 0,
      };
      MOCK_CLASSES.unshift(newCls);
      return newCls;
    }
  },

  async getClassMembers(classId: string): Promise<ClassMember[]> {
    try {
      return await request<ClassMember[]>(`/classes/${classId}/members`);
    } catch {
      return [
        {
          id: 'mem-1',
          class_id: classId,
          user_id: 'user-guru-1',
          name: 'Bpk. Ahmad Subagja, M.Kom',
          email: 'guru@smk.sch.id',
          role: 'guru',
          joined_at: '2026-01-10T08:00:00Z',
        },
        {
          id: 'mem-2',
          class_id: classId,
          user_id: 'user-siswa-1',
          name: 'Bagas Aditya Pratama',
          email: 'siswa@smk.sch.id',
          role: 'siswa',
          nisn: '0067812345',
          joined_at: '2026-01-11T09:00:00Z',
        },
        {
          id: 'mem-3',
          class_id: classId,
          user_id: 'user-siswa-2',
          name: 'Dinda Putri Rahayu',
          email: 'dinda@smk.sch.id',
          role: 'siswa',
          nisn: '0067812346',
          joined_at: '2026-01-11T09:05:00Z',
        },
        {
          id: 'mem-4',
          class_id: classId,
          user_id: 'user-siswa-3',
          name: 'Fikri Haikal',
          email: 'fikri@smk.sch.id',
          role: 'siswa',
          nisn: '0067812347',
          joined_at: '2026-01-12T10:00:00Z',
        },
      ];
    }
  },

  // Materials (Modul & Pembelajaran)
  async getMaterials(classId: string): Promise<Material[]> {
    try {
      return await request<Material[]>(`/classes/${classId}/materials`);
    } catch {
      return MOCK_MATERIALS.filter((m) => m.class_id === classId);
    }
  },

  async createMaterial(classId: string, data: Partial<Material>): Promise<Material> {
    try {
      return await request<Material>(`/classes/${classId}/materials`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      const mat: Material = {
        id: `mat-${Date.now()}`,
        class_id: classId,
        title: data.title || 'Materi Pembelajaran Baru',
        description: data.description || '',
        file_name: data.file_name,
        file_url: data.file_url,
        file_type: data.file_type,
        file_size: data.file_size,
        created_by: 'user-guru-1',
        created_at: new Date().toISOString(),
      };
      MOCK_MATERIALS.unshift(mat);
      return mat;
    }
  },

  // Assignments & Submissions
  async getAssignments(classId: string): Promise<Assignment[]> {
    try {
      return await request<Assignment[]>(`/classes/${classId}/assignments`);
    } catch {
      return MOCK_ASSIGNMENTS.filter((a) => a.class_id === classId);
    }
  },

  async createAssignment(classId: string, data: Partial<Assignment>): Promise<Assignment> {
    try {
      return await request<Assignment>(`/classes/${classId}/assignments`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      const asg: Assignment = {
        id: `asg-${Date.now()}`,
        class_id: classId,
        title: data.title || 'Tugas Baru',
        instructions: data.instructions || '',
        due_date: data.due_date || new Date(Date.now() + 86400000 * 7).toISOString(),
        max_score: data.max_score || 100,
        created_by: 'user-guru-1',
        created_at: new Date().toISOString(),
      };
      MOCK_ASSIGNMENTS.unshift(asg);
      return asg;
    }
  },

  async getSubmissions(assignmentId: string): Promise<Submission[]> {
    try {
      return await request<Submission[]>(`/assignments/${assignmentId}/submissions`);
    } catch {
      return MOCK_SUBMISSIONS.filter((s) => s.assignment_id === assignmentId);
    }
  },

  async submitAssignment(assignmentId: string, data: { file_name?: string; file_url?: string; notes?: string }): Promise<Submission> {
    try {
      return await request<Submission>(`/assignments/${assignmentId}/submit`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      const user = getStoredUser();
      const sub: Submission = {
        id: `sub-${Date.now()}`,
        assignment_id: assignmentId,
        student_id: user?.id || 'user-siswa-1',
        student_name: user?.name || 'Bagas Aditya Pratama',
        file_name: data.file_name || 'tugas-jawaban.pdf',
        file_url: data.file_url || '#',
        notes: data.notes || '',
        submitted_at: new Date().toISOString(),
      };
      const asg = MOCK_ASSIGNMENTS.find((a) => a.id === assignmentId);
      if (asg) asg.submission = sub;
      MOCK_SUBMISSIONS.unshift(sub);
      return sub;
    }
  },

  async gradeSubmission(submissionId: string, score: number, feedback: string): Promise<Submission> {
    try {
      return await request<Submission>(`/submissions/${submissionId}/grade`, {
        method: 'POST',
        body: JSON.stringify({ score, feedback }),
      });
    } catch {
      const sub = MOCK_SUBMISSIONS.find((s) => s.id === submissionId);
      if (sub) {
        sub.score = score;
        sub.feedback = feedback;
        sub.graded_at = new Date().toISOString();
        return sub;
      }
      return {
        id: submissionId,
        assignment_id: 'asg-1',
        student_id: 'user-siswa-1',
        student_name: 'Bagas Aditya Pratama',
        score,
        feedback,
        submitted_at: new Date().toISOString(),
        graded_at: new Date().toISOString(),
      };
    }
  },

  // Quizzes & Exam Player
  async getQuizzes(classId: string): Promise<Quiz[]> {
    try {
      return await request<Quiz[]>(`/classes/${classId}/quizzes`);
    } catch {
      return MOCK_QUIZZES.filter((q) => q.class_id === classId);
    }
  },

  async createQuiz(classId: string, data: Partial<Quiz>): Promise<Quiz> {
    try {
      return await request<Quiz>(`/classes/${classId}/quizzes`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      const qz: Quiz = {
        id: `qz-${Date.now()}`,
        class_id: classId,
        title: data.title || 'Kuis Baru',
        description: data.description || '',
        duration_minutes: data.duration_minutes || 30,
        max_attempts: 1,
        due_date: data.due_date || new Date(Date.now() + 86400000 * 7).toISOString(),
        created_by: 'user-guru-1',
        created_at: new Date().toISOString(),
        questions_count: data.questions?.length || 0,
        questions: data.questions || [],
      };
      MOCK_QUIZZES.unshift(qz);
      return qz;
    }
  },

  async getQuizDetail(id: string): Promise<Quiz> {
    try {
      return await request<Quiz>(`/quizzes/${id}`);
    } catch {
      return MOCK_QUIZZES.find((q) => q.id === id) || MOCK_QUIZZES[0];
    }
  },

  async submitQuiz(quizId: string, answers: Record<string, string>): Promise<{ score: number; total: number; attempt: QuizAttempt }> {
    try {
      return await request(`/quizzes/${quizId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers }),
      });
    } catch {
      const quiz = MOCK_QUIZZES.find((q) => q.id === quizId) || MOCK_QUIZZES[0];
      let score = 0;
      const total = (quiz.questions || []).reduce((acc, q) => acc + q.points, 0);

      (quiz.questions || []).forEach((q) => {
        if (answers[q.id] === q.correct_option) {
          score += q.points;
        }
      });

      const attempt: QuizAttempt = {
        id: `att-${Date.now()}`,
        quiz_id: quizId,
        student_id: 'user-siswa-1',
        score,
        max_score: total,
        started_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        submitted_at: new Date().toISOString(),
        answers,
      };

      quiz.attempt = attempt;
      return { score, total, attempt };
    }
  },

  // Forum / Stream Posts
  async getForumPosts(classId: string): Promise<ForumPost[]> {
    try {
      return await request<ForumPost[]>(`/classes/${classId}/forum`);
    } catch {
      return MOCK_POSTS.filter((p) => p.class_id === classId);
    }
  },

  async createForumPost(classId: string, content: string, title?: string): Promise<ForumPost> {
    try {
      return await request<ForumPost>(`/classes/${classId}/forum`, {
        method: 'POST',
        body: JSON.stringify({ content, title }),
      });
    } catch {
      const user = getStoredUser() || MOCK_USERS.guru;
      const post: ForumPost = {
        id: `post-${Date.now()}`,
        class_id: classId,
        user_id: user.id,
        user_name: user.name,
        user_role: user.role,
        user_avatar: user.avatar_url,
        title,
        content,
        is_pinned: false,
        reactions: [
          { emoji: '👍', count: 0, user_reacted: false },
          { emoji: '🔥', count: 0, user_reacted: false },
        ],
        comments_count: 0,
        comments: [],
        created_at: new Date().toISOString(),
      };
      MOCK_POSTS.unshift(post);
      return post;
    }
  },

  async addComment(postId: string, content: string, parentId?: string): Promise<ForumComment> {
    try {
      return await request<ForumComment>(`/forum/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content, parent_id: parentId }),
      });
    } catch {
      const user = getStoredUser() || MOCK_USERS.siswa;
      const comment: ForumComment = {
        id: `c-${Date.now()}`,
        post_id: postId,
        user_id: user.id,
        user_name: user.name,
        user_role: user.role,
        user_avatar: user.avatar_url,
        content,
        parent_id: parentId,
        created_at: new Date().toISOString(),
      };
      const post = MOCK_POSTS.find((p) => p.id === postId);
      if (post) {
        if (!post.comments) post.comments = [];
        if (parentId) {
          const parent = post.comments.find((c) => c.id === parentId);
          if (parent) {
            if (!parent.replies) parent.replies = [];
            parent.replies.push(comment);
          }
        } else {
          post.comments.push(comment);
        }
        post.comments_count += 1;
      }
      return comment;
    }
  },

  // Gradebook / Riwayat Nilai
  async getGradebook(classId: string): Promise<GradebookEntry[]> {
    try {
      return await request<GradebookEntry[]>(`/classes/${classId}/gradebook`);
    } catch {
      return [
        {
          student_id: 'user-siswa-1',
          student_name: 'Bagas Aditya Pratama',
          nisn: '0067812345',
          grades: { 'Tugas 1': 95, 'Tugas 2': 90, 'UTS PWPB': 85 },
          average_score: 90.0,
        },
        {
          student_id: 'user-siswa-2',
          student_name: 'Dinda Putri Rahayu',
          nisn: '0067812346',
          grades: { 'Tugas 1': 88, 'Tugas 2': 92, 'UTS PWPB': 90 },
          average_score: 90.0,
        },
        {
          student_id: 'user-siswa-3',
          student_name: 'Fikri Haikal',
          nisn: '0067812347',
          grades: { 'Tugas 1': 80, 'Tugas 2': 85, 'UTS PWPB': 78 },
          average_score: 81.0,
        },
      ];
    }
  },
};
