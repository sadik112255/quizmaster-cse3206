-- 003_rpc_functions.sql
-- Secure server-side RPC functions for quiz participation and evaluation

-- 1. Start or resume a quiz attempt
CREATE OR REPLACE FUNCTION public.start_quiz_attempt(p_quiz_id UUID)
RETURNS public.quiz_attempts AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_quiz public.quizzes%ROWTYPE;
    v_existing public.quiz_attempts%ROWTYPE;
    v_submitted_count INTEGER;
    v_new_attempt public.quiz_attempts%ROWTYPE;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    SELECT * INTO v_quiz FROM public.quizzes WHERE id = p_quiz_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Quiz not found';
    END IF;

    IF NOT v_quiz.is_published THEN
        RAISE EXCEPTION 'Quiz is not published';
    END IF;

    IF v_quiz.available_from IS NOT NULL AND NOW() < v_quiz.available_from THEN
        RAISE EXCEPTION 'Quiz is not yet available';
    END IF;

    IF v_quiz.available_until IS NOT NULL AND NOW() > v_quiz.available_until THEN
        RAISE EXCEPTION 'Quiz availability window has closed';
    END IF;

    -- Resume existing in-progress attempt if one exists (handles page refresh)
    SELECT * INTO v_existing
    FROM public.quiz_attempts
    WHERE quiz_id = p_quiz_id
      AND student_id = v_user_id
      AND status = 'in_progress'
    ORDER BY started_at DESC
    LIMIT 1;

    IF FOUND THEN
        RETURN v_existing;
    END IF;

    -- Enforce single-attempt rule when allow_multiple_attempts is false
    IF NOT v_quiz.allow_multiple_attempts THEN
        SELECT COUNT(*) INTO v_submitted_count
        FROM public.quiz_attempts
        WHERE quiz_id = p_quiz_id
          AND student_id = v_user_id
          AND status = 'submitted';

        IF v_submitted_count > 0 THEN
            RAISE EXCEPTION 'Multiple attempts are not allowed for this quiz';
        END IF;
    END IF;

    INSERT INTO public.quiz_attempts (quiz_id, student_id, status, started_at, expires_at)
    VALUES (
        p_quiz_id,
        v_user_id,
        'in_progress',
        NOW(),
        NOW() + (v_quiz.duration_minutes || ' minutes')::INTERVAL
    )
    RETURNING * INTO v_new_attempt;

    RETURN v_new_attempt;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Fetch questions & options for an active attempt WITHOUT exposing is_correct
CREATE OR REPLACE FUNCTION public.get_quiz_questions_for_attempt(p_attempt_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_attempt public.quiz_attempts%ROWTYPE;
    v_result JSONB;
BEGIN
    SELECT * INTO v_attempt FROM public.quiz_attempts WHERE id = p_attempt_id;
    IF NOT FOUND OR (v_attempt.student_id <> v_user_id AND NOT public.is_admin()) THEN
        RAISE EXCEPTION 'Attempt not found or access denied';
    END IF;

    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', q.id,
            'quiz_id', q.quiz_id,
            'question_type', q.question_type,
            'question_text', q.question_text,
            'marks', q.marks,
            'order_index', q.order_index,
            'options', (
                SELECT COALESCE(jsonb_agg(
                    jsonb_build_object(
                        'id', o.id,
                        'question_id', o.question_id,
                        'option_text', o.option_text,
                        'order_index', o.order_index
                    ) ORDER BY o.order_index
                ), '[]'::JSONB)
                FROM public.question_options o
                WHERE o.question_id = q.id
            )
        ) ORDER BY q.order_index
    ), '[]'::JSONB) INTO v_result
    FROM public.questions q
    WHERE q.quiz_id = v_attempt.quiz_id;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Submit and grade a quiz attempt inside a transaction
CREATE OR REPLACE FUNCTION public.submit_quiz_attempt(p_attempt_id UUID)
RETURNS public.quiz_attempts AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_attempt public.quiz_attempts%ROWTYPE;
    v_quiz public.quizzes%ROWTYPE;
    v_total_marks INTEGER := 0;
    v_earned_score INTEGER := 0;
    v_percentage NUMERIC(5,2) := 0;
    v_passed BOOLEAN := FALSE;
    v_ans RECORD;
    v_is_correct BOOLEAN;
    v_q_marks INTEGER;
BEGIN
    -- Lock row to prevent concurrent duplicate submissions
    SELECT * INTO v_attempt
    FROM public.quiz_attempts
    WHERE id = p_attempt_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Attempt not found';
    END IF;

    IF v_attempt.student_id <> v_user_id THEN
        RAISE EXCEPTION 'You cannot submit another student''s attempt';
    END IF;

    IF v_attempt.status = 'submitted' THEN
        RETURN v_attempt;
    END IF;

    SELECT * INTO v_quiz FROM public.quizzes WHERE id = v_attempt.quiz_id;

    -- Sum total marks from questions
    SELECT COALESCE(SUM(marks), 0) INTO v_total_marks
    FROM public.questions
    WHERE quiz_id = v_attempt.quiz_id;

    IF v_total_marks = 0 THEN
        v_total_marks := GREATEST(v_quiz.total_marks, 1);
    END IF;

    -- Evaluate each saved answer against question_options.is_correct
    FOR v_ans IN
        SELECT sa.id, sa.question_id, sa.selected_option_id
        FROM public.student_answers sa
        WHERE sa.attempt_id = p_attempt_id
    LOOP
        SELECT q.marks INTO v_q_marks
        FROM public.questions q
        WHERE q.id = v_ans.question_id AND q.quiz_id = v_attempt.quiz_id;

        SELECT COALESCE(o.is_correct, FALSE) INTO v_is_correct
        FROM public.question_options o
        WHERE o.id = v_ans.selected_option_id AND o.question_id = v_ans.question_id;

        IF v_is_correct IS TRUE THEN
            v_earned_score := v_earned_score + COALESCE(v_q_marks, 0);
            UPDATE public.student_answers
            SET is_correct = TRUE, marks_awarded = COALESCE(v_q_marks, 0)
            WHERE id = v_ans.id;
        ELSE
            UPDATE public.student_answers
            SET is_correct = FALSE, marks_awarded = 0
            WHERE id = v_ans.id;
        END IF;
    END LOOP;

    v_percentage := ROUND((v_earned_score::NUMERIC / v_total_marks::NUMERIC) * 100, 2);
    v_passed := v_percentage >= v_quiz.pass_percentage;

    UPDATE public.quiz_attempts
    SET status = 'submitted',
        score = v_earned_score,
        percentage = v_percentage,
        passed = v_passed,
        submitted_at = NOW()
    WHERE id = p_attempt_id
    RETURNING * INTO v_attempt;

    RETURN v_attempt;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Review submitted attempt (only reveals correct answers if permitted)
CREATE OR REPLACE FUNCTION public.get_attempt_review(p_attempt_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_attempt public.quiz_attempts%ROWTYPE;
    v_quiz public.quizzes%ROWTYPE;
    v_allow_review BOOLEAN;
    v_questions JSONB;
BEGIN
    SELECT * INTO v_attempt FROM public.quiz_attempts WHERE id = p_attempt_id;
    IF NOT FOUND OR (v_attempt.student_id <> v_user_id AND NOT public.is_admin()) THEN
        RAISE EXCEPTION 'Attempt not found or access denied';
    END IF;

    IF v_attempt.status <> 'submitted' THEN
        RAISE EXCEPTION 'Attempt has not been submitted yet';
    END IF;

    SELECT * INTO v_quiz FROM public.quizzes WHERE id = v_attempt.quiz_id;
    v_allow_review := v_quiz.show_answers_after_submit OR public.is_admin();

    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', q.id,
            'question_text', q.question_text,
            'marks', q.marks,
            'selected_option_id', sa.selected_option_id,
            'marks_awarded', COALESCE(sa.marks_awarded, 0),
            'is_correct', CASE WHEN v_allow_review THEN COALESCE(sa.is_correct, FALSE) ELSE NULL END,
            'options', (
                SELECT COALESCE(jsonb_agg(
                    jsonb_build_object(
                        'id', o.id,
                        'option_text', o.option_text,
                        'is_correct', CASE WHEN v_allow_review THEN o.is_correct ELSE NULL END
                    ) ORDER BY o.order_index
                ), '[]'::JSONB)
                FROM public.question_options o
                WHERE o.question_id = q.id
            )
        ) ORDER BY q.order_index
    ), '[]'::JSONB) INTO v_questions
    FROM public.questions q
    LEFT JOIN public.student_answers sa
        ON sa.question_id = q.id AND sa.attempt_id = p_attempt_id
    WHERE q.quiz_id = v_attempt.quiz_id;

    RETURN jsonb_build_object(
        'attempt', to_jsonb(v_attempt),
        'quiz', to_jsonb(v_quiz),
        'show_answers', v_allow_review,
        'questions', v_questions
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. Admin Dashboard Statistics RPC
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS JSONB AS $$
DECLARE
    v_total_students INTEGER;
    v_total_quizzes INTEGER;
    v_published_quizzes INTEGER;
    v_total_attempts INTEGER;
    v_avg_score NUMERIC(5,2);
    v_recent_activity JSONB;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Admin access required';
    END IF;

    SELECT COUNT(*) INTO v_total_students FROM public.profiles WHERE role = 'student';
    SELECT COUNT(*) INTO v_total_quizzes FROM public.quizzes;
    SELECT COUNT(*) INTO v_published_quizzes FROM public.quizzes WHERE is_published = TRUE;
    SELECT COUNT(*) INTO v_total_attempts FROM public.quiz_attempts WHERE status = 'submitted';
    SELECT COALESCE(ROUND(AVG(percentage), 2), 0) INTO v_avg_score
    FROM public.quiz_attempts WHERE status = 'submitted';

    SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::JSONB) INTO v_recent_activity
    FROM (
        SELECT
            a.id,
            p.full_name AS student_name,
            q.title AS quiz_title,
            a.score,
            a.percentage,
            a.passed,
            a.submitted_at
        FROM public.quiz_attempts a
        JOIN public.profiles p ON p.id = a.student_id
        JOIN public.quizzes q ON q.id = a.quiz_id
        WHERE a.status = 'submitted'
        ORDER BY a.submitted_at DESC
        LIMIT 10
    ) t;

    RETURN jsonb_build_object(
        'total_students', v_total_students,
        'total_quizzes', v_total_quizzes,
        'published_quizzes', v_published_quizzes,
        'total_attempts', v_total_attempts,
        'average_score', v_avg_score,
        'recent_activity', v_recent_activity
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
