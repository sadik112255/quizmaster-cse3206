import React, { useEffect, useState } from 'react';
import { attemptAdapter } from '../../adapters/attemptAdapter';
import type { QuizAttempt } from '../../types';
import { Alert, EmptyState, Spinner } from '../../components/common/UI';

export const AdminResultsPage: React.FC = () => {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    attemptAdapter
      .getAllAttemptsForAdmin()
      .then(setAttempts)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load results'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading student results..." />;
  if (error) return <Alert type="error" message={error} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Student Results</h1>
        <p className="mt-1 text-sm text-slate-500">All submitted quiz attempts across students</p>
      </div>

      {attempts.length === 0 ? (
        <EmptyState
          title="No submitted attempts"
          description="Student results will appear here after they submit quizzes."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3">Student</th>
                <th className="px-6 py-3">Quiz</th>
                <th className="px-6 py-3">Score</th>
                <th className="px-6 py-3">Percentage</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Submitted At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attempts.map((a) => (
                <tr key={a.id}>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {a.profiles?.full_name ?? 'Student'}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{a.quizzes?.title ?? 'Quiz'}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{a.score}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{a.percentage}%</td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        a.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {a.passed ? 'Passed' : 'Failed'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {a.submitted_at ? new Date(a.submitted_at).toLocaleString() : '-'}
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
