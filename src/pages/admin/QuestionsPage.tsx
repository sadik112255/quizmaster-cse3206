import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { mcqQuestionSchema, type McqQuestionFormValues } from '../../schemas';
import { questionAdapter } from '../../adapters/questionAdapter';
import { quizAdapter } from '../../adapters/quizAdapter';
import type { Question, Quiz } from '../../types';
import { Alert, EmptyState, Spinner } from '../../components/common/UI';

export const QuestionsPage: React.FC = () => {
  const { id: quizId } = useParams<{ id: string }>();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<McqQuestionFormValues>({
    resolver: zodResolver(mcqQuestionSchema),
    defaultValues: {
      question_text: '',
      marks: 2,
      options: [
        { option_text: '', is_correct: true },
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
      ],
    },
  });

  const options = watch('options');

  useEffect(() => {
    if (!quizId) return;
    Promise.all([quizAdapter.getQuizById(quizId), questionAdapter.getQuestionsForAdmin(quizId)])
      .then(([qData, qsData]) => {
        setQuiz(qData);
        setQuestions(qsData);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load questions'))
      .finally(() => setLoading(false));
  }, [quizId]);

  const handleSelectCorrect = (index: number) => {
    options.forEach((_, idx) => {
      setValue(`options.${idx}.is_correct`, idx === index);
    });
  };

  const onSubmit = async (values: McqQuestionFormValues) => {
    if (!quizId) return;
    setError(null);
    try {
      const created = await questionAdapter.createMcqQuestion(quizId, values, questions.length + 1);
      setQuestions((prev) => [...prev, created]);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add question');
    }
  };

  const handleDelete = async (questionId: string) => {
    try {
      await questionAdapter.deleteQuestion(questionId);
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete question');
    }
  };

  if (loading) return <Spinner label="Loading questions..." />;

  return (
    <div className="space-y-8">
      <div>
        <Link
          to="/admin/quizzes"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Quizzes
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          Questions: {quiz?.title ?? 'Quiz'}
        </h1>
      </div>

      {error && <Alert type="error" message={error} />}

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Add MCQ Question</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Question Text</label>
              <textarea
                rows={3}
                {...register('question_text')}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="Enter your question..."
              />
              {errors.question_text && (
                <p className="mt-1 text-xs text-red-600">{errors.question_text.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Marks</label>
              <input
                type="number"
                {...register('marks')}
                className="mt-1 w-28 rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              {errors.marks && <p className="mt-1 text-xs text-red-600">{errors.marks.message}</p>}
            </div>

            <div className="space-y-2.5">
              <label className="block text-sm font-medium text-slate-700">
                Answer Options (select the correct one)
              </label>
              {[0, 1, 2, 3].map((idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctOption"
                    checked={options[idx]?.is_correct ?? false}
                    onChange={() => handleSelectCorrect(idx)}
                    aria-label={`Mark option ${idx + 1} as correct`}
                  />
                  <input
                    type="text"
                    {...register(`options.${idx}.option_text`)}
                    placeholder={`Option ${idx + 1}`}
                    className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                  />
                </div>
              ))}
              {errors.options && (
                <p className="text-xs text-red-600">
                  {errors.options.message || 'All 4 options are required with 1 correct answer.'}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {isSubmitting ? 'Adding...' : 'Add Question'}
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Existing Questions ({questions.length})
          </h2>
          {questions.length === 0 ? (
            <EmptyState
              title="No questions yet"
              description="Use the form on the left to add MCQ questions to this quiz."
            />
          ) : (
            questions.map((q, index) => (
              <div
                key={q.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold uppercase text-indigo-600">
                      Q{index + 1} • {q.marks} Marks
                    </span>
                    <p className="mt-1 font-medium text-slate-900">{q.question_text}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(q.id)}
                    className="rounded p-1 text-red-600 hover:bg-red-50"
                    title="Delete question"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {q.options?.map((opt) => (
                    <li
                      key={opt.id}
                      className={`flex items-center gap-2 rounded-md px-2.5 py-1 ${
                        opt.is_correct ? 'bg-emerald-50 font-medium text-emerald-800' : 'text-slate-600'
                      }`}
                    >
                      {opt.is_correct && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                      <span>{opt.option_text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
