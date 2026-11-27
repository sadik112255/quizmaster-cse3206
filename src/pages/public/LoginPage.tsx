import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { loginSchema, type LoginFormValues } from '../../schemas';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../../components/common/UI';

export const LoginPage: React.FC = () => {
  const { signIn, user, profile } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (user && profile) {
      navigate(profile.role === 'admin' ? '/admin/dashboard' : '/student/dashboard', {
        replace: true,
      });
    }
  }, [user, profile, navigate]);

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      await signIn(values.email, values.password);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      if (msg.toLowerCase().includes('email not confirmed')) {
        setServerError(
          'Email is not confirmed in Supabase. Disable "Confirm email" in Supabase Dashboard -> Authentication -> Providers -> Email, or run supabase/seed_demo_accounts.sql.'
        );
      } else {
        setServerError(msg);
      }
    }
  };

  const fillDemo = (email: string, password: string) => {
    setValue('email', email);
    setValue('password', password);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center">
          <GraduationCap className="h-9 w-9 text-indigo-600" />
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Sign in to QuizMaster</h1>
          <p className="mt-1 text-sm text-slate-500">Enter your credentials to continue</p>
        </div>

        {serverError && (
          <div className="mb-4">
            <Alert type="error" message={serverError} />
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="student@ruet.ac.bd"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register('password')}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-5 border-t border-slate-100 pt-4">
          <p className="mb-2 text-center text-xs font-medium text-slate-500">
            Quick Fill Demo Accounts (after running seed_demo_accounts.sql)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemo('admin@quizmaster.edu', 'Admin@1234')}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Demo Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemo('student@quizmaster.edu', 'Student@1234')}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Demo Student
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-indigo-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};
