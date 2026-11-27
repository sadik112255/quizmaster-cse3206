# Phase 2: System Design — QuizMaster

## 1. Software Architecture

QuizMaster follows a layered **Client-Server Architecture** with a React + TypeScript Single Page Application (SPA) communicating with Supabase (PostgreSQL + Auth + RLS + RPC).

```mermaid
flowchart TB
    Client["Browser (React + TypeScript + Vite)"]
    subgraph Presentation["Presentation Layer"]
        Pages["Pages (Public / Admin / Student)"]
        Components["Reusable UI Components"]
        Forms["React Hook Form + Zod"]
    end
    subgraph Domain["Domain & Pattern Layer"]
        Factory["QuestionFactory (Creational)"]
        Strategy["ScoringStrategy (Behavioral)"]
    end
    subgraph DataAccess["Data Access Layer"]
        Adapters["Supabase Adapters (Structural)"]
        SDK["@supabase/supabase-js"]
    end
    subgraph Backend["Supabase Backend"]
        Auth["Supabase Auth"]
        DB["PostgreSQL + RLS"]
        RPC["RPC: start_quiz_attempt / submit_quiz_attempt"]
    end

    Client --> Presentation
    Presentation --> Domain
    Presentation --> Adapters
    Adapters --> SDK
    SDK --> Auth
    SDK --> DB
    SDK --> RPC
```

---

## 2. Database ER Diagram

```mermaid
erDiagram
    profiles ||--o{ quizzes : "creates"
    profiles ||--o{ quiz_attempts : "takes"
    quizzes ||--o{ questions : "contains"
    quizzes ||--o{ quiz_attempts : "receives"
    questions ||--o{ question_options : "offers"
    quiz_attempts ||--o{ student_answers : "stores"
    questions ||--o{ student_answers : "referenced_by"
    question_options ||--o{ student_answers : "chosen_as"

    profiles {
        uuid id PK
        text full_name
        text email
        text role
        timestamptz created_at
        timestamptz updated_at
    }
    quizzes {
        uuid id PK
        uuid created_by FK
        text title
        text description
        int duration_minutes
        int total_marks
        int pass_percentage
        boolean is_published
        boolean allow_multiple_attempts
        boolean show_answers_after_submit
        timestamptz available_from
        timestamptz available_until
        timestamptz created_at
        timestamptz updated_at
    }
    questions {
        uuid id PK
        uuid quiz_id FK
        text question_type
        text question_text
        int marks
        int order_index
        timestamptz created_at
        timestamptz updated_at
    }
    question_options {
        uuid id PK
        uuid question_id FK
        text option_text
        boolean is_correct
        int order_index
    }
    quiz_attempts {
        uuid id PK
        uuid quiz_id FK
        uuid student_id FK
        text status
        int score
        numeric percentage
        boolean passed
        timestamptz started_at
        timestamptz expires_at
        timestamptz submitted_at
    }
    student_answers {
        uuid id PK
        uuid attempt_id FK
        uuid question_id FK
        uuid selected_option_id FK
        boolean is_correct
        int marks_awarded
        timestamptz updated_at
    }
```

---

## 3. UML Class Diagram (Design Patterns)

```mermaid
classDiagram
    class BaseQuestion {
        <<interface>>
        +string questionType
        +string questionText
        +number marks
        +validate() boolean
    }
    class McqQuestion {
        +string questionType
        +string questionText
        +number marks
        +QuestionOptionInput[] options
        +validate() boolean
    }
    class QuestionFactory {
        +createQuestion(type, payload) BaseQuestion
    }

    BaseQuestion <|.. McqQuestion
    QuestionFactory ..> BaseQuestion : creates

    class ScoringStrategy {
        <<interface>>
        +calculateScore(items, passPercentage) EvaluationResult
    }
    class StandardScoringStrategy {
        +calculateScore(items, passPercentage) EvaluationResult
    }
    class NegativeMarkingStrategy {
        -number penaltyRatio
        +calculateScore(items, passPercentage) EvaluationResult
    }
    class QuizEvaluator {
        -ScoringStrategy strategy
        +setStrategy(strategy) void
        +evaluate(items, passPercentage) EvaluationResult
    }

    ScoringStrategy <|.. StandardScoringStrategy
    ScoringStrategy <|.. NegativeMarkingStrategy
    QuizEvaluator o-- ScoringStrategy

    class QuizAdapter {
        +getPublishedQuizzes() Promise~Quiz[]~
        +getAdminQuizzes() Promise~Quiz[]~
        +createQuiz(input) Promise~Quiz~
        +updateQuiz(id, input) Promise~Quiz~
        +deleteQuiz(id) Promise~void~
    }
    class AttemptAdapter {
        +startAttempt(quizId) Promise~QuizAttempt~
        +saveAnswer(attemptId, questionId, optionId) Promise~void~
        +submitAttempt(attemptId) Promise~QuizAttempt~
    }
```

---

## 4. Design Pattern Justifications

### A. Factory Pattern (Creational) — `QuestionFactory`
- **Problem Solved:** Question creation requires type-specific validation (e.g., an MCQ must have 4 options and exactly 1 correct option). Putting this inside UI components couples the form to a single question type.
- **Rejected Alternative:** Inline `if/else` object literals inside `QuestionsPage.tsx`, which duplicates validation and makes adding True/False or Short Answer questions fragile.
- **Why Suitable:** Centralizes creation and validation in one place, making future question types easy to plug in.

### B. Adapter Pattern (Structural) — `quizAdapter`, `questionAdapter`, `attemptAdapter`
- **Problem Solved:** Supabase SDK queries use database column names (`snake_case`) and return `{ data, error }` envelopes. Exposing that directly to React components couples UI code to the database schema.
- **Rejected Alternative:** Calling `supabase.from('quizzes').select(...)` directly inside React components and hooks.
- **Why Suitable:** Isolates database access behind clean domain methods, simplifies error handling, and makes unit testing trivial by mocking the adapter.

### C. Strategy Pattern (Behavioral) — `ScoringStrategy`
- **Problem Solved:** Different quizzes or future grading policies may require different scoring rules (standard scoring vs. negative marking).
- **Rejected Alternative:** Hardcoding a single `calculateScore` function with boolean flags (`if (negativeMarking) ...`), which violates the Open/Closed Principle.
- **Why Suitable:** Encapsulates each scoring algorithm behind a common `ScoringStrategy` interface so new rules can be added without modifying `QuizEvaluator`.

---

## 5. UI Wireframes (Textual Mockups)

### Student Quiz Attempt Interface
```text
+------------------------------------------------------------------+
| QuizMaster          [Quiz Title]               Time Left: 14:32  |
+------------------------------------------------------------------+
| Question 2 of 10                                  (2 Marks)      |
|                                                                  |
| What does RLS stand for in PostgreSQL / Supabase?                |
|   ( ) Role Level Security                                        |
|   (*) Row Level Security                                         |
|   ( ) Relational Lock System                                     |
|   ( ) Remote Login Service                                       |
|                                                                  |
| [ Previous ]                              [ Save & Next ]        |
+------------------------------------------------------------------+
| Question Navigator: [1*] [2*] [3 ] [4 ] ...      [ Submit Quiz ] |
+------------------------------------------------------------------+
```

### Admin Dashboard
```text
+------------------------------------------------------------------+
| QuizMaster Admin  | Dashboard | Quizzes | Results | Logout       |
+------------------------------------------------------------------+
| [Total Students: 42] [Total Quizzes: 8] [Published: 6] [Avg: 78%]|
+------------------------------------------------------------------+
| Recent Student Activity                                          |
| - Alice Rahman   | Data Structures Quiz 1 | 90% (Passed)         |
| - Bob Karim      | Software Eng. Midterm  | 65% (Passed)         |
+------------------------------------------------------------------+
```
