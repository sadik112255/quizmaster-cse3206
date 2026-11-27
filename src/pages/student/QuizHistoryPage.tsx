import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { attemptAdapter } from '../../adapters/attemptAdapter';
import type { QuizAttempt } from '../../types';
import { Alert, EmptyState, Spinner } from '../../components/common/UI';

export const QuizHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    attemptAdapter
      .getStudentHistory(user.id)
      .then(setAttempts)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load history'))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <Spinner label="Loading quiz history..." />;
  if (error) return <Alert type="error" message={error} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Quiz History</h1>
        <p className="mt-1 text-sm text-slate-500">All your past and in-progress quiz attempts</p>
      </div>

      {attempts.length === 0 ? (
        <EmptyState
          title="No quiz attempts yet"
          description="Take your first quiz to build your history."
          action={
            <Link
              to="/student/quizzes"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Browse Quizzes
            </Link>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3">Quiz</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Score</th>
                <th className="px-6 py-3">Result</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attempts.map((a) => (
                <tr key={a.id}>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {a.quizzes?.title ?? 'Quiz'}
                  </td>
                  <td className="px-6 py-4 capitalize text-slate-600">
                    {a.status.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {a.status === 'submitted' ? `${a.percentage}%` : '-'}
                  </td>
                  <td className="px-6 py-4">
                    {a.status === 'submitted' ? (
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          a.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {a.passed ? 'Passed' : 'Failed'}
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                        In Progress
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(a.started_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {a.status === 'submitted' ? (
                      <Link
                        to={`/student/results/${a.id}`}
                        className="font-semibold text-indigo-600 hover:underline"
                      >
                        View Result
                      </Link>
                    ) : (
                      <Link
                        to={`/student/attempts/${a.id}`}
                        className="font-semibold text-indigo-600 hover:underline"
                      >
                        Resume
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
