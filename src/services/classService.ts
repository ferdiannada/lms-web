import { request } from './api';
import { ENDPOINTS } from '../config/apiConfig';
import type {
  ClassModel,
  MaterialModel,
  AssignmentModel,
  QuizModel,
  ForumPost,
  ForumComment,
  NotificationModel,
  GradeHistoryItem,
} from '../types';

export const classService = {
  // Classes
  async getClasses(): Promise<ClassModel[]> {
    return request<ClassModel[]>(ENDPOINTS.CLASSES, { method: 'GET' });
  },

  async getClassDetail(classId: string): Promise<ClassModel> {
    return request<ClassModel>(`${ENDPOINTS.CLASSES}/${classId}`, {
      method: 'GET',
    });
  },

  async joinClass(code: string): Promise<{ message: string }> {
    return request<{ message: string }>(ENDPOINTS.JOIN_CLASS, {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },

  async createClass(
    name: string,
    rombelId?: string,
    subjectId?: string,
  ): Promise<ClassModel> {
    return request<ClassModel>(ENDPOINTS.CLASSES, {
      method: 'POST',
      body: JSON.stringify({
        name,
        rombel_id: rombelId,
        subject_id: subjectId,
      }),
    });
  },

  async getGradebook(classId: string): Promise<any> {
    return request<any>(`${ENDPOINTS.CLASSES}/${classId}/gradebook`, {
      method: 'GET',
    });
  },

  // Materials
  async getMaterials(classId: string): Promise<MaterialModel[]> {
    return request<MaterialModel[]>(ENDPOINTS.MATERIALS(classId), {
      method: 'GET',
    });
  },

  async createMaterial(
    classId: string,
    title: string,
    description: string,
    fileUrl?: string,
  ): Promise<MaterialModel> {
    return request<MaterialModel>(ENDPOINTS.MATERIALS(classId), {
      method: 'POST',
      body: JSON.stringify({ title, description, file_url: fileUrl }),
    });
  },

  // Assignments
  async getAssignments(classId: string): Promise<AssignmentModel[]> {
    return request<AssignmentModel[]>(ENDPOINTS.ASSIGNMENTS(classId), {
      method: 'GET',
    });
  },

  async createAssignment(
    classId: string,
    title: string,
    description: string,
    dueDate: string,
  ): Promise<AssignmentModel> {
    return request<AssignmentModel>(ENDPOINTS.ASSIGNMENTS(classId), {
      method: 'POST',
      body: JSON.stringify({ title, description, due_date: dueDate }),
    });
  },

  async submitAssignment(
    assignmentId: string,
    content: string,
    fileUrl?: string,
  ): Promise<any> {
    return request<any>(`/assignments/${assignmentId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ content, file_url: fileUrl }),
    });
  },

  async getSubmissions(assignmentId: string): Promise<any[]> {
    return request<any[]>(`/assignments/${assignmentId}/submissions`, {
      method: 'GET',
    });
  },

  async gradeSubmission(
    submissionId: string,
    score: number,
    feedback?: string,
  ): Promise<any> {
    return request<any>(`/submissions/${submissionId}/grade`, {
      method: 'POST',
      body: JSON.stringify({ score, feedback }),
    });
  },

  // Quizzes
  async getQuizzes(classId: string): Promise<QuizModel[]> {
    return request<QuizModel[]>(ENDPOINTS.QUIZZES(classId), { method: 'GET' });
  },

  async createQuiz(
    classId: string,
    title: string,
    description: string,
    durationMinutes: number,
    questions: any[],
  ): Promise<QuizModel> {
    return request<QuizModel>(ENDPOINTS.QUIZZES(classId), {
      method: 'POST',
      body: JSON.stringify({
        title,
        description,
        duration_minutes: durationMinutes,
        questions,
      }),
    });
  },

  async startQuiz(quizId: string): Promise<any> {
    return request<any>(`/quizzes/${quizId}/start`, { method: 'POST' });
  },

  async saveQuizAnswer(
    attemptId: string,
    questionId: string,
    selectedOption?: string,
    essayAnswer?: string,
  ): Promise<any> {
    return request<any>(`/quizzes/attempts/${attemptId}/answers`, {
      method: 'POST',
      body: JSON.stringify({
        question_id: questionId,
        selected_option: selectedOption,
        essay_answer: essayAnswer,
      }),
    });
  },

  async submitQuiz(quizId: string, attemptId: string): Promise<any> {
    return request<any>(`/quizzes/${quizId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ attempt_id: attemptId }),
    });
  },

  async getQuizAttempts(quizId: string): Promise<any[]> {
    return request<any[]>(`/quizzes/${quizId}/attempts`, { method: 'GET' });
  },

  async gradeQuizAttempt(
    attemptId: string,
    score: number,
    feedback?: string,
  ): Promise<any> {
    return request<any>(`/quizzes/attempts/${attemptId}/grade`, {
      method: 'POST',
      body: JSON.stringify({ score, feedback }),
    });
  },

  // Forum & Reactions
  async getForumPosts(classId: string): Promise<ForumPost[]> {
    return request<ForumPost[]>(ENDPOINTS.FORUM_POSTS(classId), {
      method: 'GET',
    });
  },

  async createForumPost(classId: string, content: string): Promise<ForumPost> {
    return request<ForumPost>(ENDPOINTS.FORUM_POSTS(classId), {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  async pinPost(postId: string): Promise<any> {
    return request<any>(`/forum/posts/${postId}/pin`, { method: 'POST' });
  },

  async getForumComments(postId: string): Promise<ForumComment[]> {
    return request<ForumComment[]>(ENDPOINTS.FORUM_COMMENTS(postId), {
      method: 'GET',
    });
  },

  async createForumComment(
    postId: string,
    content: string,
    parentId?: string,
  ): Promise<ForumComment> {
    return request<ForumComment>(ENDPOINTS.FORUM_COMMENTS(postId), {
      method: 'POST',
      body: JSON.stringify({ content, parent_id: parentId }),
    });
  },

  async toggleReaction(
    targetType: 'post' | 'comment',
    targetId: string,
    emoji: string,
  ): Promise<any> {
    return request<any>(ENDPOINTS.REACTIONS, {
      method: 'POST',
      body: JSON.stringify({
        target_type: targetType,
        target_id: targetId,
        emoji,
      }),
    });
  },

  async getReactionSummary(
    targetType: 'post' | 'comment',
    targetId: string,
  ): Promise<any> {
    return request<any>(
      `${ENDPOINTS.REACTIONS_SUMMARY}?target_type=${targetType}&target_id=${targetId}`,
      {
        method: 'GET',
      },
    );
  },

  async getReactionActors(
    targetType: 'post' | 'comment',
    targetId: string,
    emoji: string,
  ): Promise<any[]> {
    return request<any[]>(
      `${ENDPOINTS.REACTIONS_ACTORS}?target_type=${targetType}&target_id=${targetId}&emoji=${emoji}`,
      {
        method: 'GET',
      },
    );
  },

  // Notifications
  async getNotifications(): Promise<NotificationModel[]> {
    return request<NotificationModel[]>(ENDPOINTS.NOTIFICATIONS, {
      method: 'GET',
    });
  },

  async getUnreadCount(): Promise<{ unread_count: number }> {
    return request<{ unread_count: number }>(ENDPOINTS.NOTIFICATIONS_UNREAD, {
      method: 'GET',
    });
  },

  async markAllNotificationsRead(): Promise<any> {
    return request<any>(ENDPOINTS.NOTIFICATIONS_READ_ALL, { method: 'POST' });
  },

  async markNotificationRead(id: string): Promise<any> {
    return request<any>(`/notifications/${id}/read`, { method: 'POST' });
  },

  // Profile & Grade History
  async updateProfile(name: string, phone?: string): Promise<any> {
    return request<any>(ENDPOINTS.UPDATE_PROFILE, {
      method: 'PUT',
      body: JSON.stringify({ name, phone }),
    });
  },

  async getMyGradeHistory(): Promise<GradeHistoryItem[]> {
    return request<GradeHistoryItem[]>(ENDPOINTS.GRADE_HISTORY, {
      method: 'GET',
    });
  },
};
