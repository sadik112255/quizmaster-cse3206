import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { attemptAdapter } from '../../adapters/attemptAdapter';
import { supabase } from '../../adapters/supabaseClient';
import { formatCountdown, getRemainingSeconds } from '../../utils/timer';
import type { Question, QuizAttempt } from '../../types';
import { Alert, ConfirmDialog, Spinner } from '../../components/common/UI';

export const QuizAttemptPage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!attemptId || submitting) return;
    setSubmitting(true);
    setConfirmOpen(false);
    try {
      await attemptAdapter.submitAttempt(attemptId);
      navigate(`/student/results/${attemptId}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit quiz');
      setSubmitting(false);
    }
  }, [attemptId, navigate, submitting]);

  useEffect(() => {
    if (!attemptId) return;
    const load = async () => {
      try {
        const { data: attemptData, error: aErr } = await supabase
          .from('quiz_attempts')
          .select('*')
          .eq('id', attemptId)
          .single();
        if (aErr) throw new Error(aErr.message);

        const typedAttempt = attemptData as QuizAttempt;
        if (typedAttempt.status === 'submitted') {
          navigate(`/student/results/${attemptId}`, { replace: true });
          return;
        }

        const [qs, saved] = await Promise.all([
          attemptAdapter.getQuestionsForAttempt(attemptId),
          attemptAdapter.getSavedAnswers(attemptId),
        ]);

        const ansMap: Record<string, string> = {};
        saved.forEach((s) => {
          if (s.selected_option_id) ansMap[s.question_id] = s.selected_option_id;
        });

        setAttempt(typedAttempt);
        setQuestions(qs);
        setAnswers(ansMap);
        setSecondsLeft(getRemainingSeconds(typedAttempt.expires_at));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load quiz attempt');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [attemptId, navigate]);

  useEffect(() => {
    if (!attempt || attempt.status === 'submitted') return;
    const interval = setInterval(() => {
      const rem = getRemainingSeconds(attempt.expires_at);
      setSecondsLeft(rem);
      if (rem <= 0) {
        clearInterval(interval);
        handleSubmit();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [attempt, handleSubmit]);

  const handleSelectOption = async (questionId: string, optionId: string) => {
    if (!attemptId) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    try {
      await attemptAdapter.saveAnswer(attemptId, questionId, optionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save answer');
    }
  };

  if (loading) return <Spinner label="Loading quiz..." />;
  if (error) return <Alert type="error" message={error} />;
  if (questions.length === 0) return <Alert type="error" message="No questions found for this quiz." />;

  const currentQuestion = questions[currentIdx];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase text-indigo-600">
            Question {currentIdx + 1} of {questions.length}
          </p>
          <p className="text-sm text-slate-500">{currentQuestion.marks} Marks</p>
        </div>
        <div
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-bold ${
            secondsLeft <= 60 ? 'bg-red-50 text-red-700' : 'bg-indigo-50 text-indigo-700'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>{formatCountdown(secondsLeft)}</span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">{currentQuestion.question_text}</h2>

        <div className="mt-5 space-y-3">
          {currentQuestion.options?.map((opt) => {
            const isSelected = answers[currentQuestion.id] === opt.id;
            return (
              <label
                key={opt.id}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/60'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name={`q-${currentQuestion.id}`}
                  checked={isSelected}
                  onChange={() => handleSelectOption(currentQuestion.id, opt.id)}
                  className="h-4 w-4 text-indigo-600"
                />
                <span className="text-sm font-medium text-slate-800">{opt.option_text}</span>
              </label>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
          <button
            type="button"
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx((i) => i - 1)}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            Previous
          </button>

          {currentIdx < questions.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentIdx((i) => i + 1)}
              className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              disabled={submitting}
              className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="mb-3 text-xs font-semibold uppercase text-slate-500">Question Navigator</p>
        <div className="flex flex-wrap gap-2">
          {questions.map((q, idx) => {
            const answered = Boolean(answers[q.id]);
            const active = idx === currentIdx;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentIdx(idx)}
                className={`h-9 w-9 rounded-lg text-xs font-semibold transition ${
                  active
                    ? 'bg-indigo-600 text-white'
                    : answered
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Submit Quiz"
        message={`You have answered ${Object.keys(answers).length} of ${questions.length} questions. Once submitted, you cannot change your answers.`}
        confirmLabel="Submit Now"
        onConfirm={handleSubmit}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};
