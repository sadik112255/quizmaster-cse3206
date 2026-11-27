import { supabase } from './supabaseClient';
import type { AttemptReview, Question, QuizAttempt, StudentAnswer } from '../types';

/**
 * Adapter Pattern (Structural):
 * Isolates student quiz attempt, answer saving, and server-side RPC grading.
 */
export const attemptAdapter = {
  async startAttempt(quizId: string): Promise<QuizAttempt> {
    const { data, error } = await supabase.rpc('start_quiz_attempt', { p_quiz_id: quizId });
    if (error) throw new Error(error.message);
    return data as QuizAttempt;
  },

  async getQuestionsForAttempt(attemptId: string): Promise<Question[]> {
    const { data, error } = await supabase.rpc('get_quiz_questions_for_attempt', {
      p_attempt_id: attemptId,
    });
    if (error) throw new Error(error.message);
    return (data ?? []) as Question[];
  },

  async getSavedAnswers(attemptId: string): Promise<StudentAnswer[]> {
    const { data, error } = await supabase
      .from('student_answers')
      .select('*')
      .eq('attempt_id', attemptId);
    if (error) throw new Error(error.message);
    return (data ?? []) as StudentAnswer[];
  },

  async saveAnswer(attemptId: string, questionId: string, selectedOptionId: string): Promise<void> {
    const { error } = await supabase.from('student_answers').upsert(
      {
        attempt_id: attemptId,
        question_id: questionId,
        selected_option_id: selectedOptionId,
      },
      { onConflict: 'attempt_id,question_id' }
    );
    if (error) throw new Error(error.message);
  },

  async submitAttempt(attemptId: string): Promise<QuizAttempt> {
    const { data, error } = await supabase.rpc('submit_quiz_attempt', {
      p_attempt_id: attemptId,
    });
    if (error) throw new Error(error.message);
    return data as QuizAttempt;
  },

  async getAttemptReview(attemptId: string): Promise<AttemptReview> {
    const { data, error } = await supabase.rpc('get_attempt_review', {
      p_attempt_id: attemptId,
    });
    if (error) throw new Error(error.message);
    return data as AttemptReview;
  },

  async getStudentHistory(studentId: string): Promise<QuizAttempt[]> {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('*, quizzes(id, title, total_marks, pass_percentage, duration_minutes)')
      .eq('student_id', studentId)
      .order('started_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as QuizAttempt[];
  },

  async getAllAttemptsForAdmin(): Promise<QuizAttempt[]> {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select(
        '*, quizzes(id, title, total_marks, pass_percentage, duration_minutes), profiles(id, full_name, email)'
      )
      .eq('status', 'submitted')
      .order('submitted_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as QuizAttempt[];
  },
};
