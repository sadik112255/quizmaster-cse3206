import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { quizSchema, type QuizFormValues } from '../../schemas';
import { quizAdapter } from '../../adapters/quizAdapter';
import { useAuth } from '../../context/AuthContext';
import { Alert, Spinner } from '../../components/common/UI';

export const QuizEditorPage: React.FC = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      duration_minutes: 15,
      total_marks: 10,
      pass_percentage: 50,
      allow_multiple_attempts: false,
      show_answers_after_submit: true,
      is_published: false,
    },
  });

  useEffect(() => {
    if (!id) return;
    quizAdapter
      .getQuizById(id)
      .then((quiz) => {
        reset({
          title: quiz.title,
          description: quiz.description,
          duration_minutes: quiz.duration_minutes,
          total_marks: quiz.total_marks,
          pass_percentage: quiz.pass_percentage,
          allow_multiple_attempts: quiz.allow_multiple_attempts,
          show_answers_after_submit: quiz.show_answers_after_submit,
          is_published: quiz.is_published,
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load quiz'))
      .finally(() => setLoading(false));
  }, [id, reset]);

  const onSubmit = async (values: QuizFormValues) => {
    setError(null);
    try {
      if (isEdit && id) {
        await quizAdapter.updateQuiz(id, values);
      } else if (user) {
        await quizAdapter.createQuiz(values, user.id);
      }
      navigate('/admin/quizzes');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save quiz');
    }
  };

  if (loading) return <Spinner label="Loading quiz..." />;

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">
        {isEdit ? 'Edit Quiz' : 'Create New Quiz'}
      </h1>
      <p className="mt-1 text-sm text-slate-500">Configure quiz details, timing, and rules</p>

      {error && (
        <div className="mt-4">
          <Alert type="error" message={error} />
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700">Title</label>
          <input
            type="text"
            {...register('title')}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Description</label>
          <textarea
            rows={3}
            {...register('description')}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-slate-700">Duration (mins)</label>
            <input
              type="number"
              {...register('duration_minutes')}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            {errors.duration_minutes && (
              <p className="mt-1 text-xs text-red-600">{errors.duration_minutes.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Total Marks</label>
            <input
              type="number"
              {...register('total_marks')}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            {errors.total_marks && (
              <p className="mt-1 text-xs text-red-600">{errors.total_marks.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Pass %</label>
            <input
              type="number"
              {...register('pass_percentage')}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            {errors.pass_percentage && (
              <p className="mt-1 text-xs text-red-600">{errors.pass_percentage.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-3 rounded-lg bg-slate-50 p-4">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" {...register('allow_multiple_attempts')} className="rounded" />
            Allow multiple attempts per student
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" {...register('show_answers_after_submit')} className="rounded" />
            Show correct answers after submission
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" {...register('is_published')} className="rounded" />
            Publish quiz immediately
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/quizzes')}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Quiz'}
          </button>
        </div>
      </form>
    </div>
  );
};
