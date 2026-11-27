import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Eye, EyeOff, ListChecks, Plus, Trash2 } from 'lucide-react';
import { quizAdapter } from '../../adapters/quizAdapter';
import type { Quiz } from '../../types';
import { Alert, ConfirmDialog, EmptyState, Spinner } from '../../components/common/UI';

export const ManageQuizzesPage: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Quiz | null>(null);

  const loadQuizzes = () => {
    setLoading(true);
    quizAdapter
      .getAllQuizzes()
      .then(setQuizzes)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load quizzes'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  const handleTogglePublish = async (quiz: Quiz) => {
    try {
      const updated = await quizAdapter.togglePublish(quiz.id, !quiz.is_published);
      setQuizzes((prev) => prev.map((q) => (q.id === quiz.id ? updated : q)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update publish status');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await quizAdapter.deleteQuiz(deleteTarget.id);
      setQuizzes((prev) => prev.filter((q) => q.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete quiz');
    }
  };

  if (loading) return <Spinner label="Loading quizzes..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Quizzes</h1>
          <p className="mt-1 text-sm text-slate-500">Create, edit, publish, and add questions</p>
        </div>
        <Link
          to="/admin/quizzes/new"
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Create Quiz
        </Link>
      </div>

      {error && <Alert type="error" message={error} />}

      {quizzes.length === 0 ? (
        <EmptyState
          title="No quizzes created yet"
          description="Create your first quiz to start adding MCQ questions."
          action={
            <Link
              to="/admin/quizzes/new"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Create Quiz
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold text-slate-900">{quiz.title}</h2>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      quiz.is_published
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {quiz.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{quiz.description}</p>
                <div className="mt-4 flex flex-wrap gap-3 text-xs font-medium text-slate-500">
                  <span>{quiz.duration_minutes} mins</span>
                  <span>•</span>
                  <span>{quiz.total_marks} marks</span>
                  <span>•</span>
                  <span>Pass: {quiz.pass_percentage}%</span>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                <Link
                  to={`/admin/quizzes/${quiz.id}/questions`}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                >
                  <ListChecks className="h-3.5 w-3.5" />
                  Questions
                </Link>
                <Link
                  to={`/admin/quizzes/${quiz.id}/edit`}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Edit className="h-3.5 w-3.5" />
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleTogglePublish(quiz)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  {quiz.is_published ? (
                    <>
                      <EyeOff className="h-3.5 w-3.5" /> Unpublish
                    </>
                  ) : (
                    <>
                      <Eye className="h-3.5 w-3.5" /> Publish
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(quiz)}
                  className="ml-auto flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Quiz"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? All questions and attempts will be removed.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
