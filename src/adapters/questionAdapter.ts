import { supabase } from './supabaseClient';
import { QuestionFactory } from '../patterns/factory/QuestionFactory';
import type { Question } from '../types';
import type { McqQuestionFormValues } from '../schemas';

/**
 * Adapter Pattern (Structural):
 * Manages question & option persistence while using QuestionFactory for validation/creation.
 */
export const questionAdapter = {
  async getQuestionsForAdmin(quizId: string): Promise<Question[]> {
    const { data, error } = await supabase
      .from('questions')
      .select('*, options:question_options(*)')
      .eq('quiz_id', quizId)
      .order('order_index', { ascending: true });
    if (error) throw new Error(error.message);
    return ((data ?? []) as Question[]).map((q) => ({
      ...q,
      options: (q.options ?? []).sort((a, b) => a.order_index - b.order_index),
    }));
  },

  async createMcqQuestion(
    quizId: string,
    values: McqQuestionFormValues,
    orderIndex: number
  ): Promise<Question> {
    const mcq = QuestionFactory.createQuestion('mcq', {
      questionText: values.question_text,
      marks: values.marks,
      orderIndex,
      options: values.options,
    });

    const { data: qData, error: qError } = await supabase
      .from('questions')
      .insert({
        quiz_id: quizId,
        question_type: mcq.questionType,
        question_text: mcq.questionText,
        marks: mcq.marks,
        order_index: mcq.orderIndex,
      })
      .select('*')
      .single();

    if (qError) throw new Error(qError.message);

    const optionsPayload = mcq.options.map((opt) => ({
      question_id: qData.id,
      option_text: opt.option_text,
      is_correct: opt.is_correct,
      order_index: opt.order_index,
    }));

    const { data: optData, error: optError } = await supabase
      .from('question_options')
      .insert(optionsPayload)
      .select('*');

    if (optError) throw new Error(optError.message);

    return { ...(qData as Question), options: optData };
  },

  async deleteQuestion(questionId: string): Promise<void> {
    const { error } = await supabase.from('questions').delete().eq('id', questionId);
    if (error) throw new Error(error.message);
  },
};
