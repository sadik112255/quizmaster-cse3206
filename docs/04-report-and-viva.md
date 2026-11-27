# Phase 7 & 8: CI/CD Report, Reflection Essay, Demo Plan & Viva Q&A

---

## 1. New Self-Directed Tool: GitHub Actions (CI)

### What is CI/CD?
**Continuous Integration (CI)** is the practice of automatically building and testing code every time a developer pushes commits or opens a Pull Request. **Continuous Deployment (CD)** automates releasing verified builds to production. In QuizMaster, we implemented **CI** (no automated deployment is configured).

### Why GitHub Actions?
- **Native GitHub Integration:** Runs directly on Pull Requests and shows pass/fail checks before merging.
- **Zero Server Maintenance:** Uses managed `ubuntu-latest` runners instead of self-hosting.
- **Alternative Rejected:** **Jenkins**, which requires managing a separate Java server, plugins, and webhooks—overkill for a university sessional project.

### Problems Encountered & Quality Impact
- **Problem:** Early TypeScript compilation failed because `tsconfig.json` overrode `vite/client` types, hiding `import.meta.env`. Adding `src/vite-env.d.ts` resolved it.
- **Quality Impact:** Every PR is automatically verified for TypeScript types, ESLint rules, Vitest unit tests, coverage, and Vite production build before reaching `main`.

---

## 2. Learning Log

| Date | Topic Learned | Resource Used | Key Takeaway |
| :--- | :--- | :--- | :--- |
| Session 1 | Supabase RLS & RPC | Supabase Official Docs | RLS is row-level; hiding `is_correct` requires `SECURITY DEFINER` RPCs. |
| Session 2 | Design Patterns in TS | Refactoring Guru | Adapter isolates DB queries; Strategy & Factory keep quiz logic extensible. |
| Session 3 | TDD with Vitest & Mocks | Vitest & RTL Docs | `vi.mock()` isolates Supabase so unit tests run fast and offline. |
| Session 4 | GitHub Actions CI | GitHub Actions Docs | Automating `tsc`, `lint`, `test:coverage`, and `build` catches regressions early. |

---

## 3. Reflection Essay (Approx. 580 Words)

Developing **QuizMaster** for CSE 3206 taught me how software engineering principles transform a basic web app into a maintainable, secure system. At the beginning, I considered building a simple React frontend that queried the database directly from components. However, applying the **Incremental SDLC** and three software design patterns—**Adapter**, **Factory**, and **Strategy**—forced me to separate concerns cleanly. Isolating all Supabase calls inside adapter modules (`src/adapters/`) meant my React pages stayed focused on user interaction, while `QuestionFactory` and `ScoringStrategy` encapsulated question creation and grading rules so future features like negative marking or True/False questions can be added without rewriting existing UI code.

One of the toughest technical challenges was securing quiz evaluation. Initially, it is tempting to fetch all question options to the browser and calculate the score in JavaScript. During system design, I realized a student could inspect network traffic and read `is_correct` before submitting. To solve this, I restricted direct `SELECT` access on `question_options` using PostgreSQL **Row Level Security (RLS)** and moved question fetching and grading into `SECURITY DEFINER` PostgreSQL **RPC functions** (`get_quiz_questions_for_attempt` and `submit_quiz_attempt`). Using `FOR UPDATE` row locking inside the submission RPC also prevented duplicate submissions and enforced server-side deadlines.

For my self-directed learning tool, I chose **GitHub Actions** to automate Continuous Integration. I evaluated Jenkins as an alternative, but Jenkins requires hosting and maintaining a separate build server, whereas GitHub Actions integrates directly with Pull Requests using a single YAML file (`.github/workflows/ci.yml`). Configuring CI taught me how strict automated pipelines are: an environment type mismatch (`import.meta.env`) that might be overlooked locally immediately failed `tsc --noEmit`, prompting me to add `src/vite-env.d.ts` and enforce clean builds.

Regarding learning resources, the official **Supabase Documentation** and **Vitest Documentation** were the most reliable because they provided exact TypeScript examples for RLS policies and `vi.mock()` patterns. Tutorial blog posts were less helpful because many skipped security policies or mixed older React Router versions. Practicing **Test-Driven Development (TDD)**—writing failing tests for Zod schemas, timer countdowns, `ProtectedRoute`, and mocked quiz submissions before finalizing code—gave me confidence that refactoring would not break core behavior.

Looking ahead, my next skill to learn is **Containerization and Automated Deployment (Docker + CD)** so that after GitHub Actions passes all unit and Selenium E2E tests, the verified build can be automatically deployed to a staging environment with zero manual steps. Overall, this project bridged the gap between classroom theory and real-world software engineering discipline.

---

## 4. Five-Minute Live Demonstration Plan

1. **Minute 0:00–1:00 (Architecture & Repo):** Show `README.md`, GitHub Actions passing CI run, and explain the 3-tier Supabase + React architecture.
2. **Minute 1:00–2:30 (Admin Flow):** Log in as Admin, show Admin Dashboard metrics, create/publish a quiz, and add an MCQ question.
3. **Minute 2:30–4:00 (Student Flow & Security):** Log in as Student, show `ProtectedRoute` blocking `/admin/dashboard`, start a quiz, show countdown timer + page refresh persistence, and submit.
4. **Minute 4:00–5:00 (Results, Tests & Patterns):** Show the graded Result Page + Student Dashboard Recharts graph, then run `npm run test:coverage` in terminal.

---

## 5. Viva Questions & Answers

1. **Q: Why did you use the Adapter Pattern?**  
   **A:** To decouple React components from Supabase SDK queries (`supabase.from(...)`). If we ever switch backends, only the adapters change, and we can easily mock adapters in Vitest.
2. **Q: How do you prevent students from cheating by inspecting network responses?**  
   **A:** Students cannot `SELECT` from `question_options` directly due to RLS. They receive options via `get_quiz_questions_for_attempt()` which omits `is_correct`, and grading runs on the server inside `submit_quiz_attempt()`.
3. **Q: What happens if a student refreshes the browser during a quiz?**  
   **A:** `start_quiz_attempt` resumes the existing `in_progress` attempt with its original `expires_at` server timestamp, and `student_answers` are loaded from PostgreSQL so no progress is lost.
4. **Q: Why did you choose GitHub Actions over Jenkins?**  
   **A:** GitHub Actions is serverless, free for public/student repos, and natively blocks or annotates Pull Requests without maintaining a separate Jenkins server.
5. **Q: How did you practice TDD?**  
   **A:** We wrote Vitest tests first for schemas, `QuestionFactory`, `ScoringStrategy`, `timer.ts`, `ProtectedRoute`, and `attemptAdapter` (with mocked Supabase), verified failures/expectations, implemented the modules, and verified coverage.
