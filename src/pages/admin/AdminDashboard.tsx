import React, { useEffect, useState } from 'react';
import { Award, BookOpen, CheckCircle, Users } from 'lucide-react';
import { quizAdapter } from '../../adapters/quizAdapter';
import type { AdminDashboardStats } from '../../types';
import { Alert, EmptyState, Spinner, StatCard } from '../../components/common/UI';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    quizAdapter
      .getAdminDashboardStats()
      .then(setStats)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading admin dashboard..." />;
  if (error) return <Alert type="error" message={error} />;
  if (!stats) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Overview of QuizMaster activity and scores</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Students" value={stats.total_students} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Total Quizzes" value={stats.total_quizzes} icon={<BookOpen className="h-5 w-5" />} />
        <StatCard label="Published Quizzes" value={stats.published_quizzes} icon={<CheckCircle className="h-5 w-5" />} />
        <StatCard label="Total Attempts" value={stats.total_attempts} icon={<Award className="h-5 w-5" />} />
        <StatCard label="Average Score" value={`${stats.average_score}%`} icon={<Award className="h-5 w-5" />} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Recent Student Activity</h2>
        {stats.recent_activity.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="No quiz attempts yet"
              description="Student submissions will appear here once quizzes are completed."
            />
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-3 pr-4">Student</th>
                  <th className="py-3 pr-4">Quiz</th>
                  <th className="py-3 pr-4">Score</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recent_activity.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 pr-4 font-medium text-slate-900">{item.student_name}</td>
                    <td className="py-3 pr-4 text-slate-600">{item.quiz_title}</td>
                    <td className="py-3 pr-4 font-semibold text-slate-900">{item.percentage}%</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          item.passed
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {item.passed ? 'Passed' : 'Failed'}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">
                      {new Date(item.submitted_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
