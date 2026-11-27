import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, Clock, PlayCircle } from 'lucide-react';
import { quizAdapter } from '../../adapters/quizAdapter';
import { attemptAdapter } from '../../adapters/attemptAdapter';
import type { Quiz } from '../../types';
import { Alert, Spinner } from '../../components/common/UI';

export const QuizInstructionsPage: React.FC = () => {
  const { id: quizId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!quizId) return;
    quizAdapter
      .getQuizById(quizId)
      .then(setQuiz)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load quiz details'))
      .finally(() => setLoading(false));
  }, [quizId]);

  const handleStart = async () => {
    if (!quizId) return;
    setStarting(true);
    setError(null);
    try {
      const attempt = await attemptAdapter.startAttempt(quizId);
      navigate(`/student/attempts/${attempt.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start quiz');
      setStarting(false);
    }
  };

  if (loading) return <Spinner label="Loading quiz instructions..." />;
  if (!quiz) return <Alert type="error" message={error ?? 'Quiz not found'} />;

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">{quiz.title}</h1>
      <p className="mt-2 text-slate-600">{quiz.description}</p>

      {error && (
        <div className="mt-4">
          <Alert type="error" message={error} />
        </div>
      )}

      <div className="mt-6 grid gap-4 rounded-xl bg-slate-50 p-5 sm:grid-cols-3">
        <div>
          <p className="text-xs font-medium uppercase text-slate-500">Duration</p>
          <p className="mt-1 flex items-center gap-1.5 text-base font-semibold text-slate-900">
            <Clock className="h-4 w-4 text-indigo-600" /> {quiz.duration_minutes} mins
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-slate-500">Total Marks</p>
          <p className="mt-1 text-base font-semibold text-slate-900">{quiz.total_marks}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-slate-500">Pass Threshold</p>
          <p className="mt-1 text-base font-semibold text-slate-900">{quiz.pass_percentage}%</p>
        </div>
      </div>

      <div className="mt-6 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <ul className="list-disc space-y-1 pl-4">
          <li>The countdown timer is enforced by the server and starts immediately.</li>
          <li>Your selected answers are saved automatically as you progress.</li>
          <li>
            {quiz.allow_multiple_attempts
              ? 'Multiple attempts are allowed for this quiz.'
              : 'Only one attempt is permitted for this quiz.'}
          </li>
        </ul>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => navigate('/student/quizzes')}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleStart}
          disabled={starting}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          <PlayCircle className="h-4 w-4" />
          {starting ? 'Starting...' : 'Start Quiz'}
        </button>
      </div>
    </div>
  );
};
