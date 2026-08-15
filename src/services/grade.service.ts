import { GradebookEntry, GradeHistoryItem } from '../types';
import { request } from './client';

export const gradeService = {
  async getGradebook(classId: string): Promise<GradebookEntry[]> {
    try {
      const res = await request<any>(`/classes/${classId}/gradebook`);
      if (!res || !res.students) return [];

      return res.students.map((st: any) => {
        const grades: Record<string, number | string> = {};
        if (st.assignments) {
          Object.entries(st.assignments).forEach(([asgId, val]: [string, any]) => {
            const asgObj = (res.assignments || []).find((a: any) => a.id === asgId);
            const label = asgObj ? asgObj.title : asgId;
            grades[label] = val.score != null ? val.score : (val.status === 'submitted' ? 'Diserahkan' : '-');
          });
        }
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
};
