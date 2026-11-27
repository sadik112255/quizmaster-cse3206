import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, GraduationCap, ShieldCheck, Timer } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-indigo-600" />
            <span className="text-xl font-bold text-slate-900">QuizMaster</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-16 text-center">
        <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
          CSE 3206 Software Engineering Project
        </span>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Online Quiz Management, <span className="text-indigo-600">Built for Clarity</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
          Create timed assessments, manage question banks, and evaluate student performance
          automatically with server-side security.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/register"
            className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            Register as Student
          </Link>
          <Link
            to="/login"
            className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Sign In
          </Link>
        </div>

        <div className="mt-16 grid gap-6 text-left sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <ShieldCheck className="h-8 w-8 text-indigo-600" />
            <h3 className="mt-4 text-base font-semibold text-slate-900">Server-Side Grading</h3>
            <p className="mt-1 text-sm text-slate-600">
              Correct answers are never exposed before submission; PostgreSQL RPCs grade atomically.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <Timer className="h-8 w-8 text-indigo-600" />
            <h3 className="mt-4 text-base font-semibold text-slate-900">Persistent Attempts</h3>
            <p className="mt-1 text-sm text-slate-600">
              Countdown timers and saved answers survive page refreshes without losing progress.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <CheckCircle2 className="h-8 w-8 text-indigo-600" />
            <h3 className="mt-4 text-base font-semibold text-slate-900">Actionable Analytics</h3>
            <p className="mt-1 text-sm text-slate-600">
              Role-specific dashboards track scores, pass rates, and student performance trends.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
