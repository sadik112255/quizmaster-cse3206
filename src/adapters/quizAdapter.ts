import { supabase } from './supabaseClient';
import type { AdminDashboardStats, Quiz } from '../types';
import type { QuizFormValues } from '../schemas';

/**
 * Adapter Pattern (Structural):
 * Translates quiz domain operations into Supabase PostgreSQL calls.
 */
export const quizAdapter = {
  async getPublishedQuizzes(): Promise<Quiz[]> {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Quiz[];
  },

  async getAllQuizzes(): Promise<Quiz[]> {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Quiz[];
  },

  async getQuizById(quizId: string): Promise<Quiz> {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .single();
    if (error) throw new Error(error.message);
    return data as Quiz;
  },

  async createQuiz(values: QuizFormValues, createdBy: string): Promise<Quiz> {
    const { data, error } = await supabase
      .from('quizzes')
      .insert({ ...values, created_by: createdBy })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return data as Quiz;
  },

  async updateQuiz(quizId: string, values: Partial<QuizFormValues>): Promise<Quiz> {
    const { data, error } = await supabase
      .from('quizzes')
      .update(values)
      .eq('id', quizId)
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return data as Quiz;
  },

  async deleteQuiz(quizId: string): Promise<void> {
    const { error } = await supabase.from('quizzes').delete().eq('id', quizId);
    if (error) throw new Error(error.message);
  },

  async togglePublish(quizId: string, isPublished: boolean): Promise<Quiz> {
    return this.updateQuiz(quizId, { is_published: isPublished });
  },

  async getAdminDashboardStats(): Promise<AdminDashboardStats> {
    const { data, error } = await supabase.rpc('get_admin_dashboard_stats');
    if (error) throw new Error(error.message);
    return data as AdminDashboardStats;
  },
};
