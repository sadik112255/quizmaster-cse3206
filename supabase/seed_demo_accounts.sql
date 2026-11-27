-- seed_demo_accounts.sql
-- Run this in Supabase Dashboard -> SQL Editor AFTER 001, 002, and 003 migrations.
-- 1. Confirms any previously registered unconfirmed users so they can log in immediately.
-- 2. Creates Demo Admin (admin@quizmaster.edu / Admin@1234) and Demo Student (student@quizmaster.edu / Student@1234).
-- 3. Populates demo quizzes, MCQ questions, options, and sample submitted attempts.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Confirm any existing unconfirmed users
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;

DO $$
DECLARE
    v_admin_id UUID;
    v_student_id UUID;
    v_quiz1_id UUID;
    v_quiz2_id UUID;
    v_quiz3_id UUID;
    v_q_id UUID;
    v_opt_correct UUID;
    v_opt_wrong UUID;
    v_attempt1_id UUID;
    v_attempt2_id UUID;
BEGIN
    -- 1. Create Demo Admin if not exists
    SELECT id INTO v_admin_id FROM auth.users WHERE email = 'admin@quizmaster.edu';
    IF v_admin_id IS NULL THEN
        v_admin_id := gen_random_uuid();
        INSERT INTO auth.users (
            id, instance_id, aud, role, email, encrypted_password,
            email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
            created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
        ) VALUES (
            v_admin_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'admin@quizmaster.edu', crypt('Admin@1234', gen_salt('bf')),
            NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Demo Admin"}',
            NOW(), NOW(), '', '', '', ''
        );
    END IF;

    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES (v_admin_id, 'Demo Admin', 'admin@quizmaster.edu', 'admin')
    ON CONFLICT (id) DO UPDATE SET role = 'admin', full_name = 'Demo Admin';

    -- 2. Create Demo Student if not exists
    SELECT id INTO v_student_id FROM auth.users WHERE email = 'student@quizmaster.edu';
    IF v_student_id IS NULL THEN
        v_student_id := gen_random_uuid();
        INSERT INTO auth.users (
            id, instance_id, aud, role, email, encrypted_password,
            email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
            created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
        ) VALUES (
            v_student_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'student@quizmaster.edu', crypt('Student@1234', gen_salt('bf')),
            NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sadik Rahman (Demo)"}',
            NOW(), NOW(), '', '', '', ''
        );
    END IF;

    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES (v_student_id, 'Sadik Rahman (Demo)', 'student@quizmaster.edu', 'student')
    ON CONFLICT (id) DO UPDATE SET role = 'student', full_name = 'Sadik Rahman (Demo)';

    -- 3. Create Demo Quiz 1 (Published)
    SELECT id INTO v_quiz1_id FROM public.quizzes WHERE title = 'Software Engineering Fundamentals' LIMIT 1;
    IF v_quiz1_id IS NULL THEN
        INSERT INTO public.quizzes (
            created_by, title, description, duration_minutes, total_marks,
            pass_percentage, is_published, allow_multiple_attempts, show_answers_after_submit
        ) VALUES (
            v_admin_id,
            'Software Engineering Fundamentals',
            'Covers SDLC models, Design Patterns, TDD, and PostgreSQL RLS.',
            15, 8, 50, TRUE, TRUE, TRUE
        ) RETURNING id INTO v_quiz1_id;

        INSERT INTO public.questions (quiz_id, question_type, question_text, marks, order_index)
        VALUES (v_quiz1_id, 'mcq', 'Which design pattern isolates Supabase queries from React components?', 2, 1)
        RETURNING id INTO v_q_id;
        INSERT INTO public.question_options (question_id, option_text, is_correct, order_index) VALUES
            (v_q_id, 'Adapter Pattern', TRUE, 1),
            (v_q_id, 'Singleton Pattern', FALSE, 2),
            (v_q_id, 'Observer Pattern', FALSE, 3),
            (v_q_id, 'Builder Pattern', FALSE, 4);

        INSERT INTO public.questions (quiz_id, question_type, question_text, marks, order_index)
        VALUES (v_quiz1_id, 'mcq', 'What is the correct sequence of Test-Driven Development (TDD)?', 2, 2)
        RETURNING id INTO v_q_id;
        INSERT INTO public.question_options (question_id, option_text, is_correct, order_index) VALUES
            (v_q_id, 'Code -> Test -> Deploy', FALSE, 1),
            (v_q_id, 'Failing Test -> Minimum Code -> Refactor', TRUE, 2),
            (v_q_id, 'Refactor -> Test -> Commit', FALSE, 3),
            (v_q_id, 'Design -> Code -> Manual QA', FALSE, 4);

        INSERT INTO public.questions (quiz_id, question_type, question_text, marks, order_index)
        VALUES (v_quiz1_id, 'mcq', 'Which PostgreSQL feature enforces row-level access control?', 2, 3)
        RETURNING id INTO v_q_id;
        INSERT INTO public.question_options (question_id, option_text, is_correct, order_index) VALUES
            (v_q_id, 'Foreign Keys', FALSE, 1),
            (v_q_id, 'Row Level Security (RLS)', TRUE, 2),
            (v_q_id, 'B-Tree Indexes', FALSE, 3),
            (v_q_id, 'Views', FALSE, 4);

        INSERT INTO public.questions (quiz_id, question_type, question_text, marks, order_index)
        VALUES (v_quiz1_id, 'mcq', 'Which pattern allows swapping scoring algorithms at runtime?', 2, 4)
        RETURNING id INTO v_q_id;
        INSERT INTO public.question_options (question_id, option_text, is_correct, order_index) VALUES
            (v_q_id, 'Factory Pattern', FALSE, 1),
            (v_q_id, 'Strategy Pattern', TRUE, 2),
            (v_q_id, 'Decorator Pattern', FALSE, 3),
            (v_q_id, 'Proxy Pattern', FALSE, 4);
    END IF;

    -- 4. Create Demo Quiz 2 (Published)
    SELECT id INTO v_quiz2_id FROM public.quizzes WHERE title = 'React & TypeScript Essentials' LIMIT 1;
    IF v_quiz2_id IS NULL THEN
        INSERT INTO public.quizzes (
            created_by, title, description, duration_minutes, total_marks,
            pass_percentage, is_published, allow_multiple_attempts, show_answers_after_submit
        ) VALUES (
            v_admin_id,
            'React & TypeScript Essentials',
            'Tests React hooks, TypeScript strict typing, and Zod validation.',
            10, 6, 50, TRUE, TRUE, TRUE
        ) RETURNING id INTO v_quiz2_id;

        INSERT INTO public.questions (quiz_id, question_type, question_text, marks, order_index)
        VALUES (v_quiz2_id, 'mcq', 'Which library is used in QuizMaster for schema-based form validation?', 3, 1)
        RETURNING id INTO v_q_id;
        INSERT INTO public.question_options (question_id, option_text, is_correct, order_index) VALUES
            (v_q_id, 'Zod', TRUE, 1),
            (v_q_id, 'Redux', FALSE, 2),
            (v_q_id, 'Axios', FALSE, 3),
            (v_q_id, 'Lodash', FALSE, 4);

        INSERT INTO public.questions (quiz_id, question_type, question_text, marks, order_index)
        VALUES (v_quiz2_id, 'mcq', 'Which hook runs side effects such as fetching data on mount?', 3, 2)
        RETURNING id INTO v_q_id;
        INSERT INTO public.question_options (question_id, option_text, is_correct, order_index) VALUES
            (v_q_id, 'useState', FALSE, 1),
            (v_q_id, 'useEffect', TRUE, 2),
            (v_q_id, 'useMemo', FALSE, 3),
            (v_q_id, 'useRef', FALSE, 4);
    END IF;

    -- 5. Create Demo Quiz 3 (Draft - only visible to Admin)
    SELECT id INTO v_quiz3_id FROM public.quizzes WHERE title = 'CI/CD & GitHub Actions (Draft)' LIMIT 1;
    IF v_quiz3_id IS NULL THEN
        INSERT INTO public.quizzes (
            created_by, title, description, duration_minutes, total_marks,
            pass_percentage, is_published, allow_multiple_attempts, show_answers_after_submit
        ) VALUES (
            v_admin_id,
            'CI/CD & GitHub Actions (Draft)',
            'Unpublished draft quiz to demonstrate Admin publish/unpublish.',
            10, 4, 50, FALSE, FALSE, TRUE
        );
    END IF;

    -- 6. Insert sample submitted attempts for Demo Student so dashboards & charts have data
    IF NOT EXISTS (SELECT 1 FROM public.quiz_attempts WHERE student_id = v_student_id) THEN
        INSERT INTO public.quiz_attempts (
            quiz_id, student_id, status, score, percentage, passed, started_at, expires_at, submitted_at
        ) VALUES (
            v_quiz1_id, v_student_id, 'submitted', 6, 75.00, TRUE,
            NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '15 minutes', NOW() - INTERVAL '2 days' + INTERVAL '8 minutes'
        ) RETURNING id INTO v_attempt1_id;

        INSERT INTO public.quiz_attempts (
            quiz_id, student_id, status, score, percentage, passed, started_at, expires_at, submitted_at
        ) VALUES (
            v_quiz2_id, v_student_id, 'submitted', 6, 100.00, TRUE,
            NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '10 minutes', NOW() - INTERVAL '1 day' + INTERVAL '4 minutes'
        ) RETURNING id INTO v_attempt2_id;

        -- Populate one answer sample
        SELECT q.id, o.id INTO v_q_id, v_opt_correct
        FROM public.questions q
        JOIN public.question_options o ON o.question_id = q.id AND o.is_correct = TRUE
        WHERE q.quiz_id = v_quiz1_id
        LIMIT 1;

        IF v_q_id IS NOT NULL THEN
            INSERT INTO public.student_answers (attempt_id, question_id, selected_option_id, is_correct, marks_awarded)
            VALUES (v_attempt1_id, v_q_id, v_opt_correct, TRUE, 2)
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;
END $$;
