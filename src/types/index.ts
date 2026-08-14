export type Role = 'siswa' | 'guru';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  nisn?: string;
  nip?: string;
  rombel?: string;
  avatar_url?: string;
  is_initial_password?: boolean;
  created_at?: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  code: string;
  subject: string;
  rombel: string;
  teacher_id: string;
  teacher_name?: string;
  teacher_avatar?: string;
  description?: string;
  banner_color?: string;
  created_at: string;
  student_count?: number;
  material_count?: number;
  assignment_count?: number;
}

export interface ClassMember {
  id: string;
  class_id: string;
  user_id: string;
  name: string;
  email: string;
  role: Role;
  avatar_url?: string;
  nisn?: string;
  joined_at: string;
}

export interface Material {
  id: string;
  class_id: string;
  title: string;
  description?: string;
  file_url?: string;
  file_name?: string;
  file_type?: string;
  file_size?: number;
  created_by: string;
  created_at: string;
}

export interface Assignment {
  id: string;
  class_id: string;
  title: string;
  instructions?: string;
  due_date: string;
  max_score: number;
  created_by: string;
  created_at: string;
  submission?: Submission;
  pending_grading_count?: number;
}

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  student_name?: string;
  file_url?: string;
  file_name?: string;
  notes?: string;
  score?: number;
  feedback?: string;
  submitted_at: string;
  graded_at?: string;
}

export interface Question {
  id: string;
  quiz_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e?: string;
  correct_option?: string;
  points: number;
}

export interface Quiz {
  id: string;
  class_id: string;
  title: string;
  description?: string;
  duration_minutes: number;
  max_attempts: number;
  due_date: string;
  created_by: string;
  created_at: string;
  questions_count?: number;
  questions?: Question[];
  attempt?: QuizAttempt;
  attempts_count?: number;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  student_id: string;
  student_name?: string;
  score?: number;
  max_score?: number;
  started_at: string;
  submitted_at?: string;
  answers?: Record<string, string>;
}

export interface ForumComment {
  id: string;
  post_id: string;
  user_id: string;
  user_name: string;
  user_role: Role;
  user_avatar?: string;
  content: string;
  parent_id?: string;
  replies?: ForumComment[];
  created_at: string;
  updated_at?: string;
}

export interface ForumReaction {
  emoji: string;
  count: number;
  user_reacted?: boolean;
}

export interface ForumPost {
  id: string;
  class_id: string;
  user_id: string;
  user_name: string;
  user_role: Role;
  user_avatar?: string;
  title?: string;
  content: string;
  is_pinned: boolean;
  reactions: ForumReaction[];
  comments_count: number;
  comments?: ForumComment[];
  created_at: string;
  updated_at?: string;
}

export interface GradeItem {
  id: string;
  title: string;
  type: 'tugas' | 'kuis';
  score?: number;
  max_score: number;
  date: string;
}

export interface GradebookEntry {
  student_id: string;
  student_name: string;
  nisn: string;
  grades: Record<string, number>;
  average_score: number;
}
