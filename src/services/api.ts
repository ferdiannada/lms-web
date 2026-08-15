import {
  User,
  Rombel,
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
  GradebookEntry,
  GradeHistoryItem,
  DashboardSummary,
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

function normalizeUser(raw: any): User {
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

function normalizeClass(raw: any): ClassRoom {
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

function normalizeMaterial(raw: any): Material {
  if (!raw) return {} as Material;
  return {
    id: raw.id,
    class_id: raw.class_id,
    title: raw.title,
    description: raw.description || '',
    type: raw.type || (raw.pdf_url ? 'pdf' : 'manual'),
    content_html: raw.content_html || '',
    file_url: raw.pdf_url || raw.file_url || '',
    pdf_url: raw.pdf_url || raw.file_url || '',
    pdf_status: raw.pdf_status || 'none',
    file_name: raw.title ? `${raw.title}.pdf` : 'modul.pdf',
    file_type: 'application/pdf',
    is_read: raw.is_read ?? false,
    created_by: raw.created_by || '',
    created_at: raw.created_at || new Date().toISOString(),
  };
}

function normalizeAssignment(raw: any): Assignment {
  if (!raw) return {} as Assignment;
  return {
    id: raw.id,
    class_id: raw.class_id,
    title: raw.title,
    instructions: raw.description || raw.instructions || '',
    description: raw.description || raw.instructions || '',
    file_url: raw.file_url || '',
    due_date: raw.due_date || new Date().toISOString(),
    max_score: raw.max_score || 100,
    created_by: raw.created_by || '',
    submission_count: raw.submission_count ?? 0,
    total_students: raw.total_students ?? 0,
    is_submitted: raw.is_submitted ?? false,
    score: raw.score ?? null,
    created_at: raw.created_at || new Date().toISOString(),
    submission: raw.submission ? normalizeSubmission(raw.submission) : undefined,
    pending_grading_count: raw.pending_grading_count ?? 0,
  };
}

function normalizeSubmission(raw: any): Submission {
  if (!raw) return {} as Submission;
  const student = raw.student || {};
  return {
    id: raw.id,
    assignment_id: raw.assignment_id,
    student_id: raw.student_id,
    student_name: student.name || raw.student_name || 'Siswa',
    file_url: raw.file_url || '',
    file_name: raw.file_name || (raw.file_url ? raw.file_url.split('/').pop() : 'lampiran.zip'),
    notes: raw.answer_text || raw.notes || '',
    answer_text: raw.answer_text || raw.notes || '',
    score: raw.score ?? null,
    feedback: raw.feedback || '',
    status: raw.status || (raw.score != null ? 'graded' : 'submitted'),
    submitted_at: raw.submitted_at || new Date().toISOString(),
    graded_at: raw.graded_at || (raw.status === 'graded' ? raw.updated_at : undefined),
    updated_at: raw.updated_at,
  };
}

function normalizeQuiz(raw: any): Quiz {
  if (!raw) return {} as Quiz;
  const questions = (raw.questions || []).map((q: any) => {
    // Map options array to flat option_a, option_b, etc. if available
    let option_a = '';
    let option_b = '';
    let option_c = '';
    let option_d = '';
    let option_e = '';
    let correct_option = '';

    if (Array.isArray(q.options)) {
      q.options.forEach((opt: any) => {
        const lbl = (opt.label || '').toUpperCase();
        if (lbl === 'A') option_a = opt.text;
        else if (lbl === 'B') option_b = opt.text;
        else if (lbl === 'C') option_c = opt.text;
        else if (lbl === 'D') option_d = opt.text;
        else if (lbl === 'E') option_e = opt.text;
        if (opt.is_correct) correct_option = lbl;
      });
    }

    return {
      id: q.id,
      quiz_id: q.quiz_id,
      type: q.type || 'pilihanGanda',
      question_text: q.question_text || '',
      points: q.points || 10,
      image_url: q.image_url || '',
      options: q.options || [],
      option_a: option_a || q.option_a || '',
      option_b: option_b || q.option_b || '',
      option_c: option_c || q.option_c || '',
      option_d: option_d || q.option_d || '',
      option_e: option_e || q.option_e || '',
      correct_option: correct_option || q.correct_option || '',
    };
  });

  return {
    id: raw.id,
    class_id: raw.class_id,
    title: raw.title,
    description: raw.description || '',
    duration_minutes: raw.duration_minutes || 30,
    start_time: raw.start_time,
    end_time: raw.end_time,
    is_randomized: raw.is_randomized ?? false,
    is_completed: raw.is_completed ?? false,
    score: raw.score ?? null,
    max_score: raw.max_score ?? null,
    attempt_id: raw.attempt_id ?? null,
    max_attempts: raw.max_attempts || 1,
    due_date: raw.end_time || raw.due_date || new Date().toISOString(),
    created_by: raw.created_by || '',
    created_at: raw.created_at || new Date().toISOString(),
    questions_count: raw.question_count || raw.questions_count || questions.length,
    question_count: raw.question_count || raw.questions_count || questions.length,
    questions,
    attempt: raw.attempt ? {
      id: raw.attempt.id || raw.attempt_id || '',
      quiz_id: raw.id,
      student_id: raw.attempt.student_id || '',
      score: raw.score ?? raw.attempt.score ?? 0,
      max_score: raw.max_score ?? raw.attempt.max_score ?? 100,
      started_at: raw.attempt.started_at || new Date().toISOString(),
      completed_at: raw.attempt.completed_at,
      submitted_at: raw.attempt.completed_at || raw.attempt.submitted_at,
    } : undefined,
    attempts_count: raw.attempts_count ?? 0,
  };
}

function normalizeForumPost(raw: any): ForumPost {
  if (!raw) return {} as ForumPost;
  const user = raw.user || {};
  const rawComments = Array.isArray(raw.comments) ? raw.comments : [];
  return {
    id: raw.id,
    class_id: raw.class_id,
    user_id: raw.user_id,
    user_name: user.name || raw.user_name || 'Pengguna',
    user_role: user.role || raw.user_role || 'siswa',
    user_avatar: user.avatar_url || raw.user_avatar || '',
    title: raw.title || '',
    content: raw.content || '',
    is_pinned: raw.pinned ?? raw.is_pinned ?? false,
    pinned: raw.pinned ?? raw.is_pinned ?? false,
    reactions: raw.reactions || [
      { emoji: '👍', count: 0, user_reacted: false },
      { emoji: '🔥', count: 0, user_reacted: false },
    ],
    comments_count: raw.comment_count ?? raw.comments_count ?? rawComments.length,
    comments: rawComments.map(normalizeForumComment),
    created_at: raw.created_at || new Date().toISOString(),
    updated_at: raw.updated_at,
  };
}

function normalizeForumComment(raw: any): ForumComment {
  if (!raw) return {} as ForumComment;
  const user = raw.user || {};
  return {
    id: raw.id,
    post_id: raw.post_id,
    user_id: raw.user_id,
    user_name: user.name || raw.user_name || 'Pengguna',
    user_role: user.role || raw.user_role || 'siswa',
    user_avatar: user.avatar_url || raw.user_avatar || '',
    content: raw.content || '',
    parent_id: raw.parent_id || null,
    replies: Array.isArray(raw.replies) ? raw.replies.map(normalizeForumComment) : [],
    reply_count: raw.reply_count || 0,
    created_at: raw.created_at || new Date().toISOString(),
    updated_at: raw.updated_at,
  };
}

// Generic HTTP fetch helper
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE}${endpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      removeToken();
      localStorage.removeItem('pedia_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      throw new Error('Sesi telah berakhir. Silakan login kembali.');
    }

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || errJson.message || `HTTP Error ${res.status}`);
    }

    // Return empty object for 204 No Content
    if (res.status === 204) {
      return {} as T;
    }

    return await res.json();
  } catch (err: any) {
    console.warn(`[API] Error on ${endpoint}:`, err.message);
    throw err;
  }
}

// API Functions connecting to Go Gin Backend & PostgreSQL
export const api = {
  // ── Auth ─────────────────────────────────────────────────────────────
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

  async changePassword(currentPass: string, nextPass: string): Promise<{ message: string }> {
    return await request<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ old_password: currentPass, new_password: nextPass }),
    });
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

  // ── Classes & Rombels ────────────────────────────────────────────────
  async getClasses(): Promise<ClassRoom[]> {
    const raw = await request<any[]>('/classes');
    return Array.isArray(raw) ? raw.map(normalizeClass) : [];
  },

  async getClassDetail(id: string): Promise<ClassRoom> {
    const raw = await request<any>(`/classes/${id}`);
    return normalizeClass(raw);
  },

  async getRombels(): Promise<Rombel[]> {
    const raw = await request<Rombel[]>('/classes/rombels');
    return Array.isArray(raw) ? raw : [];
  },

  async createClass(data: { name: string; description?: string; rombel_id: string; cover_color?: string }): Promise<ClassRoom> {
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
    const res = await request<{ message: string; class: any }>('/classes/join', {
      method: 'POST',
      body: JSON.stringify({ class_code: code.trim().toUpperCase() }),
    });
    return normalizeClass(res.class);
  },

  async getClassMembers(classId: string): Promise<ClassMember[]> {
    const raw = await request<any[]>(`/classes/${classId}/members`);
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

  // ── Materials ────────────────────────────────────────────────────────
  async getMaterials(classId: string): Promise<Material[]> {
    const raw = await request<any[]>(`/classes/${classId}/materials`);
    return Array.isArray(raw) ? raw.map(normalizeMaterial) : [];
  },

  async getMaterialDetail(id: string): Promise<Material> {
    const raw = await request<any>(`/materials/${id}`);
    return normalizeMaterial(raw);
  },

  async createMaterial(classId: string, data: { title: string; description?: string; file_url?: string; content_html?: string; type?: string }): Promise<Material> {
    const raw = await request<any>(`/classes/${classId}/materials`, {
      method: 'POST',
      body: JSON.stringify({
        title: data.title,
        description: data.description || '',
        type: data.type || (data.file_url ? 'pdf' : 'manual'),
        content_html: data.content_html || '',
        pdf_url: data.file_url || '',
      }),
    });
    return normalizeMaterial(raw);
  },

  async deleteMaterial(id: string): Promise<void> {
    await request(`/materials/${id}`, { method: 'DELETE' });
  },

  // ── Assignments & Submissions ─────────────────────────────────────────
  async getAssignments(classId: string): Promise<Assignment[]> {
    const raw = await request<any[]>(`/classes/${classId}/assignments`);
    return Array.isArray(raw) ? raw.map(normalizeAssignment) : [];
  },

  async getAssignmentDetail(id: string): Promise<Assignment> {
    const raw = await request<any>(`/assignments/${id}`);
    return normalizeAssignment(raw);
  },

  async createAssignment(classId: string, data: { title: string; instructions?: string; description?: string; file_url?: string; due_date: string; max_score?: number }): Promise<Assignment> {
    const raw = await request<any>(`/classes/${classId}/assignments`, {
      method: 'POST',
      body: JSON.stringify({
        title: data.title,
        description: data.instructions || data.description || '',
        file_url: data.file_url || '',
        due_date: data.due_date,
        max_score: data.max_score || 100,
      }),
    });
    return normalizeAssignment(raw);
  },

  async submitAssignment(assignmentId: string, data: { answer_text?: string; notes?: string; file_url?: string }): Promise<Submission> {
    const raw = await request<any>(`/assignments/${assignmentId}/submit`, {
      method: 'POST',
      body: JSON.stringify({
        answer_text: data.notes || data.answer_text || '',
        file_url: data.file_url || '',
      }),
    });
    return normalizeSubmission(raw);
  },

  async getSubmissions(assignmentId: string): Promise<Submission[]> {
    const raw = await request<any[]>(`/assignments/${assignmentId}/submissions`);
    return Array.isArray(raw) ? raw.map(normalizeSubmission) : [];
  },

  async getMySubmission(assignmentId: string): Promise<Submission | null> {
    try {
      const raw = await request<any>(`/assignments/${assignmentId}/submission`);
      return normalizeSubmission(raw);
    } catch {
      return null;
    }
  },

  async gradeSubmission(submissionId: string, score: number, feedback: string): Promise<void> {
    await request(`/submissions/${submissionId}/grade`, {
      method: 'POST',
      body: JSON.stringify({ score, feedback }),
    });
  },

  // ── Quizzes & Exam Player ────────────────────────────────────────────
  async getQuizzes(classId: string): Promise<Quiz[]> {
    const raw = await request<any[]>(`/classes/${classId}/quizzes`);
    return Array.isArray(raw) ? raw.map(normalizeQuiz) : [];
  },

  async getQuizDetail(id: string): Promise<Quiz> {
    const raw = await request<any>(`/quizzes/${id}`);
    return normalizeQuiz(raw);
  },

  async createQuiz(classId: string, data: Partial<Quiz>): Promise<Quiz> {
    const questionsPayload = (data.questions || []).map((q) => {
      let options = q.options;
      if (!options || options.length === 0) {
        options = [];
        if (q.option_a) options.push({ label: 'A', text: q.option_a, is_correct: q.correct_option === 'A' });
        if (q.option_b) options.push({ label: 'B', text: q.option_b, is_correct: q.correct_option === 'B' });
        if (q.option_c) options.push({ label: 'C', text: q.option_c, is_correct: q.correct_option === 'C' });
        if (q.option_d) options.push({ label: 'D', text: q.option_d, is_correct: q.correct_option === 'D' });
        if (q.option_e) options.push({ label: 'E', text: q.option_e, is_correct: q.correct_option === 'E' });
      }
      return {
        type: q.type || 'pilihanGanda',
        question_text: q.question_text,
        points: q.points || 10,
        image_url: q.image_url || '',
        options,
      };
    });

    const raw = await request<any>(`/classes/${classId}/quizzes`, {
      method: 'POST',
      body: JSON.stringify({
        title: data.title,
        description: data.description || '',
        duration_minutes: data.duration_minutes || 30,
        start_time: data.start_time,
        end_time: data.end_time || data.due_date,
        is_randomized: data.is_randomized ?? false,
        mcq_option_count: 4,
        questions: questionsPayload,
      }),
    });
    return normalizeQuiz(raw);
  },

  async startQuiz(quizId: string): Promise<any> {
    return await request(`/quizzes/${quizId}/start`, { method: 'POST' });
  },

  async submitQuiz(quizId: string, answers: Record<string, string>): Promise<{ score: number; total: number; attempt: QuizAttempt }> {
    const formattedAnswers = Object.entries(answers).map(([qid, val]) => {
      // If val is a UUID option ID or option letter
      return {
        question_id: qid,
        option_id: val,
        text_answer: val,
      };
    });

    const res = await request<{ message: string; score: number; max_score: number }>(`/quizzes/${quizId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers: formattedAnswers }),
    });

    const user = getStoredUser();
    const attempt: QuizAttempt = {
      id: `att-${Date.now()}`,
      quiz_id: quizId,
      student_id: user?.id || '',
      score: res.score,
      max_score: res.max_score,
      started_at: new Date().toISOString(),
      submitted_at: new Date().toISOString(),
      answers,
    };

    return {
      score: res.score,
      total: res.max_score,
      attempt,
    };
  },

  async getQuizAttempts(quizId: string): Promise<any[]> {
    return await request<any[]>(`/quizzes/${quizId}/attempts`);
  },

  // ── Forum & Comments ─────────────────────────────────────────────────
  async getForumPosts(classId: string): Promise<ForumPost[]> {
    const raw = await request<any[]>(`/classes/${classId}/forum`);
    return Array.isArray(raw) ? raw.map(normalizeForumPost) : [];
  },

  async createForumPost(classId: string, content: string, title?: string): Promise<ForumPost> {
    const raw = await request<any>(`/classes/${classId}/forum`, {
      method: 'POST',
      body: JSON.stringify({ content, title }),
    });
    return normalizeForumPost(raw);
  },

  async getComments(postId: string): Promise<ForumComment[]> {
    const raw = await request<any[]>(`/forum/posts/${postId}/comments`);
    return Array.isArray(raw) ? raw.map(normalizeForumComment) : [];
  },

  async addComment(postId: string, content: string, parentId?: string): Promise<ForumComment> {
    const raw = await request<any>(`/forum/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, parent_id: parentId }),
    });
    return normalizeForumComment(raw);
  },

  async toggleReaction(targetType: 'post' | 'comment', targetId: string, emoji: string, classId?: string): Promise<any> {
    return await request('/reactions', {
      method: 'POST',
      body: JSON.stringify({
        target_type: targetType,
        target_id: targetId,
        emoji,
        class_id: classId,
      }),
    });
  },

  // ── Gradebook & Grade History ────────────────────────────────────────
  async getGradebook(classId: string): Promise<GradebookEntry[]> {
    try {
      const res = await request<any>(`/classes/${classId}/gradebook`);
      if (!res || !res.students) return [];

      return res.students.map((st: any) => {
        const grades: Record<string, number | string> = {};
        // Map assignments
        if (st.assignments) {
          Object.entries(st.assignments).forEach(([asgId, val]: [string, any]) => {
            const asgObj = (res.assignments || []).find((a: any) => a.id === asgId);
            const label = asgObj ? asgObj.title : asgId;
            grades[label] = val.score != null ? val.score : (val.status === 'submitted' ? 'Diserahkan' : '-');
          });
        }
        // Map quizzes
        if (st.quizzes) {
          Object.entries(st.quizzes).forEach(([qzId, val]: [string, any]) => {
            const qzObj = (res.quizzes || []).find((q: any) => q.id === qzId);
            const label = qzObj ? qzObj.title : qzId;
            grades[label] = val.score != null ? val.score : '-';
          });
        }

        return {
          student_id: st.student_id,
          student_name: st.student_name,
          nisn: st.nis || '',
          grades,
          average_score: Math.round(st.average_score * 10) / 10,
        };
      });
    } catch (err) {
      console.warn('[Gradebook] Failed to load gradebook from backend:', err);
      return [];
    }
  },

  async getMyGradeHistory(classId?: string): Promise<GradeHistoryItem[]> {
    const url = `/me/grade-history${classId ? `?class_id=${classId}` : ''}`;
    const res = await request<{ items: GradeHistoryItem[] }>(url);
    return res.items || [];
  },

  // ── Dashboard Summary ────────────────────────────────────────────────
  async getDashboardSummary(): Promise<DashboardSummary> {
    const res = await request<any>('/dashboard/summary');
    return {
      pending_assignments: Array.isArray(res.pending_assignments) ? res.pending_assignments.map(normalizeAssignment) : [],
      active_quizzes: Array.isArray(res.active_quizzes) ? res.active_quizzes.map(normalizeQuiz) : [],
      recent_materials: Array.isArray(res.recent_materials) ? res.recent_materials.map(normalizeMaterial) : [],
    };
  },

  // ── File Upload ──────────────────────────────────────────────────────
  async uploadFile(file: File): Promise<{ file_name: string; file_url: string }> {
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

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `Upload gagal (HTTP ${res.status})`);
    }

    return await res.json();
  },
};
