import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, FileText } from 'lucide-react';
import { quizAdapter } from '../../adapters/quizAdapter';
import type { Quiz } from '../../types';
import { Alert, EmptyState, Spinner } from '../../components/common/UI';

export const AvailableQuizzesPage: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    quizAdapter
      .getPublishedQuizzes()
      .then(setQuizzes)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load quizzes'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading available quizzes..." />;
  if (error) return <Alert type="error" message={error} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Available Quizzes</h1>
        <p className="mt-1 text-sm text-slate-500">Select a published quiz to view instructions and begin</p>
      </div>

      {quizzes.length === 0 ? (
        <EmptyState
          title="No quizzes available right now"
          description="Check back later when your instructor publishes new quizzes."
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{quiz.title}</h2>
                <p className="mt-2 text-sm text-slate-600">{quiz.description}</p>
                <div className="mt-4 flex items-center gap-4 text-xs font-medium text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {quiz.duration_minutes} mins
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" /> {quiz.total_marks} marks
                  </span>
                </div>
              </div>
              <Link
                to={`/student/quizzes/${quiz.id}/instructions`}
                className="mt-6 block rounded-lg bg-indigo-600 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-700"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
