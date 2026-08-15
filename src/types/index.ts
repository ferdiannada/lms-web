export type Role = 'siswa' | 'guru' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  nip_nik_nisn?: string;
  nisn?: string;
  nip?: string;
  phone?: string;
  rombel?: string;
  rombel_id?: string | null;
  rombel_name?: string;
  avatar_url?: string;
  dapodik_id?: string;
  is_initial_password?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Rombel {
  id: string;
  name: string;
  tingkat: number;
  guru_id?: string;
  student_count?: number;
  created_at?: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  code: string;
  class_code?: string;
  subject?: string;
  rombel: string;
  rombel_id?: string;
  teacher_id: string;
  teacher_name?: string;
  teacher_avatar?: string;
  description?: string;
  banner_color?: string;
  cover_color?: string;
  created_at: string;
  student_count?: number;
  member_count?: number;
  material_count?: number;
  assignment_count?: number;
  quiz_count?: number;
}

export interface ClassMember {
  id: string;
  class_id: string;
  user_id: string;
  name: string;
  email: string;
  role: Role;
  avatar_url?: string;
  nip_nik_nisn?: string;
  nisn?: string;
  joined_at: string;
}

export interface Material {
  id: string;
  class_id: string;
  title: string;
  description?: string;
  type: 'manual' | 'pdf';
  content_html?: string;
  file_url?: string;
  pdf_url?: string;
  pdf_status?: string;
  file_name?: string;
  file_type?: string;
  file_size?: number;
  is_read?: boolean;
  created_by?: string;
  created_at: string;
}

export interface Assignment {
  id: string;
  class_id: string;
  title: string;
  instructions?: string;
  description?: string;
  file_url?: string;
  due_date: string;
  max_score: number;
  created_by?: string;
  submission_count?: number;
  total_students?: number;
  is_submitted?: boolean;
  score?: number | null;
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
  answer_text?: string;
  score?: number | null;
  feedback?: string;
  status?: 'submitted' | 'graded' | string;
  submitted_at: string;
  graded_at?: string;
  updated_at?: string;
}

export interface QuestionOption {
  id?: string;
  question_id?: string;
  label: string;
  text: string;
  is_correct?: boolean;
}

export interface Question {
  id?: string;
  quiz_id?: string;
  type?: 'pilihanGanda' | 'essay';
  question_text: string;
  points: number;
  image_url?: string;
  options?: QuestionOption[];
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  option_e?: string;
  correct_option?: string;
}

export interface Quiz {
  id: string;
  class_id: string;
  title: string;
  description?: string;
  duration_minutes: number;
  start_time?: string | null;
  end_time?: string | null;
  is_randomized?: boolean;
  is_completed?: boolean;
  score?: number | null;
  max_score?: number | null;
  attempt_id?: string | null;
  max_attempts?: number;
  due_date?: string;
  created_by?: string;
  created_at: string;
  questions_count?: number;
  question_count?: number;
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
  status?: string;
  started_at: string;
  completed_at?: string | null;
  submitted_at?: string;
  answers?: Record<string, string>;
}

export interface ForumReaction {
  emoji: string;
  count: number;
  user_reacted?: boolean;
}

export interface ForumComment {
  id: string;
  post_id: string;
  user_id: string;
  user_name: string;
  user_role: Role;
  user_avatar?: string;
  content: string;
  parent_id?: string | null;
  replies?: ForumComment[];
  reply_count?: number;
  created_at: string;
  updated_at?: string;
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
  pinned?: boolean;
  reactions: ForumReaction[];
  comments_count: number;
  comment_count?: number;
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
  grades: Record<string, number | string>;
  average_score: number;
}

export interface GradeHistoryItem {
  type: 'assignment' | 'quiz';
  id: string;
  title: string;
  class_id: string;
  class_name: string;
  score?: number | null;
  max_score: number;
  submitted_at?: string;
  completed_at?: string;
  attempt_id?: string;
  submission_id?: string;
  status?: string;
}

export interface DashboardSummary {
  pending_assignments: Assignment[];
  active_quizzes: Quiz[];
  recent_materials: Material[];
}
