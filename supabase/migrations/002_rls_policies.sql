-- 002_rls_policies.sql
-- Row Level Security policies for QuizMaster

-- Helper function to check admin role without recursive RLS issues
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_answers ENABLE ROW LEVEL SECURITY;

-- 1. Profiles policies
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile name"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id
        AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    );

-- 2. Quizzes policies
CREATE POLICY "Admins have full access to quizzes"
    ON public.quizzes FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Students can view published available quizzes"
    ON public.quizzes FOR SELECT
    USING (
        is_published = TRUE
        AND (available_from IS NULL OR available_from <= NOW())
        AND (available_until IS NULL OR available_until >= NOW())
    );

-- 3. Questions policies
CREATE POLICY "Admins have full access to questions"
    ON public.questions FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Students can view questions of published quizzes"
    ON public.questions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.quizzes q
            WHERE q.id = quiz_id AND q.is_published = TRUE
        )
    );

-- 4. Question Options policies
-- IMPORTANT: Students cannot SELECT directly from question_options so is_correct is never leaked.
-- Students fetch options via RPC get_quiz_questions_for_attempt() which omits is_correct.
CREATE POLICY "Admins have full access to question_options"
    ON public.question_options FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 5. Quiz Attempts policies
CREATE POLICY "Students can view own attempts and admins view all"
    ON public.quiz_attempts FOR SELECT
    USING (student_id = auth.uid() OR public.is_admin());

-- Attempts are created and submitted via secure RPC functions (start_quiz_attempt / submit_quiz_attempt)

-- 6. Student Answers policies
CREATE POLICY "Students can view own answers and admins view all"
    ON public.student_answers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.quiz_attempts a
            WHERE a.id = attempt_id AND (a.student_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "Students can insert answers for own in-progress attempt"
    ON public.student_answers FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.quiz_attempts a
            WHERE a.id = attempt_id
              AND a.student_id = auth.uid()
              AND a.status = 'in_progress'
              AND NOW() <= a.expires_at + INTERVAL '15 seconds'
        )
    );

CREATE POLICY "Students can update answers for own in-progress attempt"
    ON public.student_answers FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.quiz_attempts a
            WHERE a.id = attempt_id
              AND a.student_id = auth.uid()
              AND a.status = 'in_progress'
              AND NOW() <= a.expires_at + INTERVAL '15 seconds'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.quiz_attempts a
            WHERE a.id = attempt_id
              AND a.student_id = auth.uid()
              AND a.status = 'in_progress'
              AND NOW() <= a.expires_at + INTERVAL '15 seconds'
        )
    );
