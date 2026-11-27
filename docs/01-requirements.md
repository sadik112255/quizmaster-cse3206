# Phase 1: Requirement Analysis — QuizMaster

**Course:** CSE 3206 – Software Engineering Sessional (22 Series)  
**Project:** QuizMaster – Online Quiz Management System  
**Process Model:** Incremental SDLC  

---

## 1. Project Scope

### In-Scope
- Role-based authentication (Admin and Student) using Supabase Auth.
- Admin quiz lifecycle management (create, edit, delete, publish/unpublish, availability window, attempt limits).
- Admin MCQ question bank management (4 options, 1 correct answer, per-question marks) with extensible architecture.
- Student quiz participation with persistent answers, countdown timer, and server-side deadline enforcement.
- Automatic server-side evaluation via PostgreSQL RPC inside a transaction.
- Role-specific dashboards with Recharts analytics for students and summary metrics for admins.
- Unit testing (Vitest + React Testing Library + mocked Supabase), Selenium E2E tests, and GitHub Actions CI.

### Out-of-Scope
- Payment gateways or paid subscriptions.
- Live video proctoring or browser lockdown.
- Automated deployment (CD) to a production host (CI only).

---

## 2. Process Model Justification

**Chosen Model:** Incremental SDLC  
**Why Incremental?**
1. **Modular Delivery:** QuizMaster has 6 distinct functional modules that can be built and verified increment by increment (Auth → Quiz/Questions → Attempt & Evaluation → Dashboards).
2. **Early Risk Reduction:** Database security (RLS policies) and server-side grading are tested early before building the full UI.
3. **Clear Git & Viva Traceability:** Each increment maps cleanly to a feature branch, Pull Request, and unit test suite.

---

## 3. Functional Requirements

| ID | Requirement | Role |
| :--- | :--- | :--- |
| **FR-1** | Users can register as Students, log in, log out, and update their profile. | Student / Admin |
| **FR-2** | Routes and actions are protected by role; Students cannot access Admin pages. | System |
| **FR-3** | Admins can create, edit, delete, and publish/unpublish quizzes with duration, total marks, pass threshold, availability dates, and attempt limits. | Admin |
| **FR-4** | Admins can add, edit, and delete MCQ questions (4 options, 1 correct option, marks). | Admin |
| **FR-5** | Students can browse published and currently available quizzes and view instructions. | Student |
| **FR-6** | Students can start an attempt, navigate questions, save answers persistently, view a countdown timer, and submit. | Student |
| **FR-7** | System prevents unpublished quiz attempts, duplicate single-attempt submissions, and late submissions using server timestamps. | System |
| **FR-8** | System evaluates answers securely on the backend, stores score/percentage/pass-fail, and reveals answers only after submission when permitted. | System |
| **FR-9** | Admin dashboard displays total students, quizzes, published quizzes, attempts, average score, and recent activity. | Admin |
| **FR-10** | Student dashboard displays available/completed quizzes, history, scores, and performance charts. | Student |

---

## 4. Non-Functional Requirements

| ID | Category | Requirement |
| :--- | :--- | :--- |
| **NFR-1** | Security | Supabase Row Level Security (RLS) enforces all access rules; `is_correct` is never exposed to students before submission; only publishable key is used in frontend. |
| **NFR-2** | Reliability | Answers are saved to PostgreSQL as the student selects them so page refreshes do not lose progress; submission uses a DB transaction. |
| **NFR-3** | Maintainability | Code follows Adapter, Factory, and Strategy design patterns with TypeScript strict mode. |
| **NFR-4** | Usability | Clean, responsive light-mode SaaS UI with clear loading, empty, error, and confirmation states. |
| **NFR-5** | Testability | Core business logic is unit-tested with mocked Supabase dependencies; E2E flows are verified with Selenium. |

---

## 5. User Stories

1. **As a Student**, I want to register and log in securely so that I can access my personal quiz dashboard.
2. **As an Admin**, I want to create and publish quizzes with a time limit and passing score so that students can take structured assessments.
3. **As an Admin**, I want to add MCQ questions with four options and marks so that each quiz tests specific knowledge.
4. **As a Student**, I want my selected answers to be saved automatically while taking a quiz so that an accidental page refresh does not lose my work.
5. **As a Student**, I want to see my score, percentage, and pass/fail result immediately after submitting so that I know how I performed.
6. **As an Admin**, I want to view overall quiz statistics and student results so that I can evaluate class performance.

---

## 6. Key Use Cases

### Use Case 1: Take and Submit Quiz (Student)
- **Actor:** Student
- **Preconditions:** Logged in as Student; quiz is published and within availability window; student has not exceeded attempt limit.
- **Main Flow:**
  1. Student selects a quiz from Available Quizzes and reads instructions.
  2. Student clicks "Start Quiz"; backend creates `quiz_attempts` row with `started_at` and `expires_at`.
  3. Student selects answers; each selection upserts into `student_answers`.
  4. Student clicks "Submit Quiz" (or timer expires).
  5. Backend RPC `submit_quiz_attempt` validates deadline, grades answers inside a transaction, updates `quiz_attempts`, and returns the result.
- **Postconditions:** Attempt status becomes `submitted`; score, percentage, and pass/fail status are persisted.

### Use Case 2: Create & Publish Quiz (Admin)
- **Actor:** Admin
- **Preconditions:** Logged in with `role = 'admin'`.
- **Main Flow:**
  1. Admin navigates to Create Quiz and fills out title, description, duration, total marks, pass percentage, and availability.
  2. Admin adds MCQ questions with 4 options and marks one as correct.
  3. Admin clicks "Publish" to make the quiz visible to students.
- **Postconditions:** Quiz is saved with `is_published = true` and appears on students' Available Quizzes page.
