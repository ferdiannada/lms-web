import { DashboardSummary } from '../types';
import { request } from './client';
import { normalizeAssignment } from './assignment.service';
import { normalizeQuiz } from './quiz.service';
import { normalizeMaterial } from './material.service';

export const dashboardService = {
  async getDashboardSummary(options: { signal?: AbortSignal } = {}): Promise<DashboardSummary> {
    const res = await request<any>('/dashboard/summary', options);
    return {
      pending_assignments: Array.isArray(res.pending_assignments) ? res.pending_assignments.map(normalizeAssignment) : [],
      active_quizzes: Array.isArray(res.active_quizzes) ? res.active_quizzes.map(normalizeQuiz) : [],
      recent_materials: Array.isArray(res.recent_materials) ? res.recent_materials.map(normalizeMaterial) : [],
    };
  },
};
