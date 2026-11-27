import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, BookOpen, CheckCircle2, TrendingUp } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { quizAdapter } from '../../adapters/quizAdapter';
import { attemptAdapter } from '../../adapters/attemptAdapter';
import type { Quiz, QuizAttempt } from '../../types';
import { Alert, EmptyState, Spinner, StatCard } from '../../components/common/UI';

export const StudentDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [history, setHistory] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([quizAdapter.getPublishedQuizzes(), attemptAdapter.getStudentHistory(user.id)])
      .then(([qData, hData]) => {
        setQuizzes(qData);
        setHistory(hData);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <Spinner label="Loading your dashboard..." />;
  if (error) return <Alert type="error" message={error} />;

  const submitted = history.filter((a) => a.status === 'submitted');
  const avgScore =
    submitted.length > 0
      ? (submitted.reduce((sum, a) => sum + Number(a.percentage), 0) / submitted.length).toFixed(1)
      : '0';
  const passedCount = submitted.filter((a) => a.passed).length;

  const chartData = submitted
    .slice(0, 6)
    .reverse()
    .map((a) => ({
      name: a.quizzes?.title ? a.quizzes.title.slice(0, 14) : 'Quiz',
      percentage: Number(a.percentage),
    }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome, {profile?.full_name ?? 'Student'}!
        </h1>
        <p className="mt-1 text-sm text-slate-500">Track your quizzes and performance</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Available Quizzes"
          value={quizzes.length}
          icon={<BookOpen className="h-5 w-5" />}
        />
        <StatCard
          label="Completed Quizzes"
          value={submitted.length}
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <StatCard
          label="Quizzes Passed"
          value={passedCount}
          icon={<Award className="h-5 w-5" />}
        />
        <StatCard
          label="Average Score"
          value={`${avgScore}%`}
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Performance Chart</h2>
          {chartData.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title="No completed quizzes yet"
                description="Complete a quiz to see your score trends here."
                action={
                  <Link
                    to="/student/quizzes"
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    Browse Quizzes
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="mt-4 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="percentage" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recent Attempts</h2>
            <Link to="/student/history" className="text-sm font-medium text-indigo-600 hover:underline">
              View All
            </Link>
          </div>
          {submitted.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">You have not submitted any quizzes yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {submitted.slice(0, 5).map((attempt) => (
                <li key={attempt.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-slate-900">{attempt.quizzes?.title ?? 'Quiz'}</p>
                    <p className="text-xs text-slate-500">
                      {attempt.submitted_at ? new Date(attempt.submitted_at).toLocaleDateString() : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-900">
                      {attempt.percentage}%
                    </span>
                    <Link
                      to={`/student/results/${attempt.id}`}
                      className="text-xs font-semibold text-indigo-600 hover:underline"
                    >
                      Details
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
