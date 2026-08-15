import { Quiz, QuizAttempt } from '../types';
import { request } from './client';
import { getStoredUser } from './storage';

export function normalizeQuiz(raw: any): Quiz {
  if (!raw) return {} as Quiz;
  const user = getStoredUser();
  const isStudent = user?.role === 'siswa';

  const questions = (raw.questions || []).map((q: any) => {
    let option_a = '';
    let option_b = '';
    let option_c = '';
    let option_d = '';
    let option_e = '';
    let correct_option = '';

    const sanitizedOptions = Array.isArray(q.options)
      ? q.options.map((opt: any) => {
          const lbl = (opt.label || '').toUpperCase();
          if (lbl === 'A') option_a = opt.text;
          else if (lbl === 'B') option_b = opt.text;
          else if (lbl === 'C') option_c = opt.text;
          else if (lbl === 'D') option_d = opt.text;
          else if (lbl === 'E') option_e = opt.text;
          if (!isStudent && opt.is_correct) correct_option = lbl;

          return {
            id: opt.id,
            question_id: opt.question_id,
            label: opt.label,
            text: opt.text,
            is_correct: isStudent ? undefined : opt.is_correct,
          };
        })
      : [];

    return {
      id: q.id,
      quiz_id: q.quiz_id,
      type: q.type || 'pilihanGanda',
      question_text: q.question_text || '',
      points: q.points || 10,
      image_url: q.image_url || '',
      options: sanitizedOptions,
      option_a: option_a || q.option_a || '',
      option_b: option_b || q.option_b || '',
      option_c: option_c || q.option_c || '',
      option_d: option_d || q.option_d || '',
      option_e: option_e || q.option_e || '',
      correct_option: isStudent ? '' : (correct_option || q.correct_option || ''),
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

export const quizService = {
  async getQuizzes(classId: string, options?: RequestInit): Promise<Quiz[]> {
    const raw = await request<any[]>(`/classes/${classId}/quizzes`, options);
    return Array.isArray(raw) ? raw.map(normalizeQuiz) : [];
  },

  async getQuizDetail(id: string): Promise<Quiz> {
    const raw = await request<any>(`/quizzes/${id}`);
    return normalizeQuiz(raw);
  },

  async deleteQuiz(quizId: string): Promise<void> {
    await request(`/quizzes/${quizId}`, { method: 'DELETE' });
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
};
