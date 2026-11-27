# QuizMaster — Online Quiz Management System

**Course:** CSE 3206 – Software Engineering Sessional (22 Series, RUET)  
**Tech Stack:** React, TypeScript, Vite, Tailwind CSS, React Router, React Hook Form, Zod, Recharts, Supabase (PostgreSQL + Auth + RLS + RPC), Vitest, React Testing Library, Selenium, GitHub Actions.

---

## Features (6 Functional Modules)

1. **Authentication & User Management:** Student registration, login/logout, role-based `ProtectedRoute` (`admin` vs `student`), profile management.
2. **Quiz Management (Admin):** Create, edit, delete, publish/unpublish quizzes, configure duration, total marks, pass percentage, and attempt limits.
3. **Question Management (Admin):** Add/delete MCQ questions with 4 options, 1 correct answer, and per-question marks (`QuestionFactory`).
4. **Quiz Participation (Student):** Browse published quizzes, persistent answer saving, server-enforced countdown timer, page-refresh resilience.
5. **Automatic Evaluation & Results:** Transaction-safe server-side grading via PostgreSQL RPC (`submit_quiz_attempt`), pass/fail status, and post-submission answer review.
6. **Dashboards & Reports:** Admin summary metrics & recent activity; Student dashboard with Recharts performance charts and quiz history.

---

## Design Patterns Used

- **Factory Pattern (Creational):** `src/patterns/factory/QuestionFactory.ts`
- **Adapter Pattern (Structural):** `src/adapters/*`
- **Strategy Pattern (Behavioral):** `src/patterns/strategy/ScoringStrategy.ts`

---

## Local Setup (Mac)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Copy `.env.example` to `.env` and add your Supabase URL and publishable key:
   ```bash
   cp .env.example .env
   ```

3. **Set up Supabase Database:**
   In your Supabase Dashboard → **SQL Editor**, run the files in order:
   1. `supabase/migrations/001_initial_schema.sql`
   2. `supabase/migrations/002_rls_policies.sql`
   3. `supabase/migrations/003_rpc_functions.sql`
   4. `supabase/seed.sql` (optional sample quiz)

   To promote a user to Admin, run in Supabase SQL Editor:
   ```sql
   UPDATE public.profiles SET role = 'admin' WHERE email = 'your-admin@email.com';
   ```

4. **Run the app:**
   ```bash
   npm run dev
   ```

---

## Testing & CI

- **Unit Tests (Vitest + RTL with mocked Supabase):**
  ```bash
  npm run test:coverage
  ```
- **Type Check & Lint:**
  ```bash
  npx tsc --noEmit && npm run lint
  ```
- **Selenium E2E Tests:**
  ```bash
  pip3 install selenium
  QUIZMASTER_URL=http://localhost:5173 python3 tests/e2e/quizmaster_e2e.py
  ```
- **CI Pipeline:** Configured in `.github/workflows/ci.yml` to run on every push and Pull Request to `main`.
