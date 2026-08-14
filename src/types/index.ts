export type UserRole = 'admin' | 'guru' | 'siswa';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  nipNikNisn?: string;
  phone?: string;
  avatarUrl?: string;
  isInitialPassword?: boolean;
}

export interface ClassModel {
  id: string;
  name: string;
  code?: string;
  rombelName?: string;
  subjectName?: string;
  teacherName?: string;
  studentCount?: number;
  coverColor?: string;
}

export interface MaterialModel {
  id: string;
  classId: string;
  title: string;
  description: string;
  fileUrl?: string;
  createdAt: string;
}

export interface AssignmentModel {
  id: string;
  classId: string;
  title: string;
  description: string;
  dueDate: string;
  createdAt: string;
}

export interface QuizModel {
  id: string;
  classId: string;
  title: string;
  description: string;
  durationMinutes: number;
  questionCount?: number;
  createdAt: string;
}

export interface ForumPost {
  id: string;
  classId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar?: string;
  content: string;
  isPinned?: boolean;
  createdAt: string;
  commentCount?: number;
}

export interface ForumComment {
  id: string;
  postId: string;
  parentId?: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

export interface EmojiReaction {
  emoji: string;
  count: number;
  mine: boolean;
}

export interface NotificationModel {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  targetType?: string;
  targetId?: string;
}

export interface GradeHistoryItem {
  id: string;
  className: string;
  itemTitle: string;
  itemType: 'assignment' | 'quiz';
  score: number;
  maxScore: number;
  gradedAt: string;
}
