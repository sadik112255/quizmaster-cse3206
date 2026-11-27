export type UserRole = 'admin' | 'student';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Quiz {
  id: string;
  created_by: string | null;
  title: string;
  description: string;
  duration_minutes: number;
  total_marks: number;
  pass_percentage: number;
  is_published: boolean;
  allow_multiple_attempts: boolean;
  show_answers_after_submit: boolean;
  available_from: string | null;
  available_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuestionOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct?: boolean;
  order_index: number;
}

export interface Question {
  id: string;
  quiz_id: string;
  question_type: 'mcq';
  question_text: string;
  marks: number;
  order_index: number;
  options?: QuestionOption[];
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  student_id: string;
  status: 'in_progress' | 'submitted';
  score: number;
  percentage: number;
  passed: boolean;
  started_at: string;
  expires_at: string;
  submitted_at: string | null;
  quizzes?: Pick<Quiz, 'id' | 'title' | 'total_marks' | 'pass_percentage' | 'duration_minutes'>;
  profiles?: Pick<Profile, 'id' | 'full_name' | 'email'>;
}

export interface StudentAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_option_id: string | null;
  is_correct: boolean | null;
  marks_awarded: number;
}

export interface AttemptReviewQuestion {
  id: string;
  question_text: string;
  marks: number;
  selected_option_id: string | null;
  marks_awarded: number;
  is_correct: boolean | null;
  options: {
    id: string;
    option_text: string;
    is_correct: boolean | null;
  }[];
}

export interface AttemptReview {
  attempt: QuizAttempt;
  quiz: Quiz;
  show_answers: boolean;
  questions: AttemptReviewQuestion[];
}

export interface AdminDashboardStats {
  total_students: number;
  total_quizzes: number;
  published_quizzes: number;
  total_attempts: number;
  average_score: number;
  recent_activity: {
    id: string;
    student_name: string;
    quiz_title: string;
    score: number;
    percentage: number;
    passed: boolean;
    submitted_at: string;
  }[];
}
