import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Award, CheckCircle2, XCircle } from 'lucide-react';
import { attemptAdapter } from '../../adapters/attemptAdapter';
import type { AttemptReview } from '../../types';
import { Alert, Spinner } from '../../components/common/UI';

export const ResultPage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const [review, setReview] = useState<AttemptReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!attemptId) return;
    attemptAdapter
      .getAttemptReview(attemptId)
      .then(setReview)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load results'))
      .finally(() => setLoading(false));
  }, [attemptId]);

  if (loading) return <Spinner label="Evaluating results..." />;
  if (error) return <Alert type="error" message={error} />;
  if (!review) return null;

  const { attempt, quiz, show_answers, questions } = review;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <Award
          className={`mx-auto h-12 w-12 ${
            attempt.passed ? 'text-emerald-600' : 'text-red-500'
          }`}
        />
        <h1 className="mt-3 text-2xl font-bold text-slate-900">{quiz.title}</h1>
        <p className="mt-1 text-sm text-slate-500">Quiz Result Summary</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase text-slate-500">Score</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{attempt.score}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase text-slate-500">Percentage</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{attempt.percentage}%</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase text-slate-500">Status</p>
            <p
              className={`mt-1 text-2xl font-bold ${
                attempt.passed ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {attempt.passed ? 'Passed' : 'Failed'}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-3">
          <Link
            to="/student/dashboard"
            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Back to Dashboard
          </Link>
          <Link
            to="/student/history"
            className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            View History
          </Link>
        </div>
      </div>

      {show_answers && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Answer Review</h2>
          {questions.map((q, idx) => (
            <div key={q.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-slate-900">
                  {idx + 1}. {q.question_text}
                </p>
                <span className="shrink-0 text-xs font-semibold text-slate-500">
                  {q.marks_awarded}/{q.marks}
                </span>
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                {q.options.map((opt) => {
                  const isSelected = opt.id === q.selected_option_id;
                  const isCorrect = opt.is_correct === true;
                  return (
                    <li
                      key={opt.id}
                      className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
                        isCorrect
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                          : isSelected
                            ? 'border-red-300 bg-red-50 text-red-900'
                            : 'border-slate-200 text-slate-700'
                      }`}
                    >
                      <span>{opt.option_text}</span>
                      <span className="flex items-center gap-1 text-xs font-semibold">
                        {isCorrect && (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Correct
                          </>
                        )}
                        {!isCorrect && isSelected && (
                          <>
                            <XCircle className="h-4 w-4 text-red-600" /> Your Choice
                          </>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
