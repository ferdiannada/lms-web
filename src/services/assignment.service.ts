import { Assignment, Submission } from '../types';
import { request } from './client';

export function normalizeSubmission(raw: any): Submission {
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

export function normalizeAssignment(raw: any): Assignment {
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

export const assignmentService = {
  async getAssignments(classId: string, options?: RequestInit): Promise<Assignment[]> {
    const raw = await request<any[]>(`/classes/${classId}/assignments`, options);
    return Array.isArray(raw) ? raw.map(normalizeAssignment) : [];
  },

  async getAssignmentDetail(id: string, options?: RequestInit): Promise<Assignment> {
    const raw = await request<any>(`/assignments/${id}`, options);
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

  async submitAssignment(assignmentId: string, data: { answer_text?: string; notes?: string; file_url?: string; file_name?: string }): Promise<Submission> {
    const raw = await request<any>(`/assignments/${assignmentId}/submit`, {
      method: 'POST',
      body: JSON.stringify({
        answer_text: data.notes || data.answer_text || '',
        file_url: data.file_url || '',
        file_name: data.file_name || '',
      }),
    });
    return normalizeSubmission(raw);
  },

  async deleteAssignment(assignmentId: string): Promise<void> {
    await request(`/assignments/${assignmentId}`, { method: 'DELETE' });
  },

  async getSubmissions(assignmentId: string, options?: RequestInit): Promise<Submission[]> {
    const raw = await request<any[]>(`/assignments/${assignmentId}/submissions`, options);
    return Array.isArray(raw) ? raw.map(normalizeSubmission) : [];
  },

  async getMySubmission(assignmentId: string, options?: RequestInit): Promise<Submission | null> {
    try {
      const raw = await request<any>(`/assignments/${assignmentId}/submission`, options);
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
};
