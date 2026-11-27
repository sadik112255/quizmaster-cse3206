-- seed.sql
-- Sample quiz and MCQ questions for QuizMaster

DO $$
DECLARE
    v_quiz_id UUID;
    v_q1_id UUID;
    v_q2_id UUID;
    v_q3_id UUID;
    v_q4_id UUID;
BEGIN
    -- Insert sample published quiz if not already present
    SELECT id INTO v_quiz_id FROM public.quizzes WHERE title = 'Software Engineering Fundamentals' LIMIT 1;

    IF v_quiz_id IS NULL THEN
        INSERT INTO public.quizzes (
            title,
            description,
            duration_minutes,
            total_marks,
            pass_percentage,
            is_published,
            allow_multiple_attempts,
            show_answers_after_submit
        ) VALUES (
            'Software Engineering Fundamentals',
            'Test your understanding of SDLC models, Design Patterns, Testing, and CI/CD.',
            15,
            8,
            50,
            TRUE,
            TRUE,
            TRUE
        ) RETURNING id INTO v_quiz_id;

        -- Question 1
        INSERT INTO public.questions (quiz_id, question_type, question_text, marks, order_index)
        VALUES (v_quiz_id, 'mcq', 'Which design pattern provides a unified interface to an incompatible third-party library or database SDK?', 2, 1)
        RETURNING id INTO v_q1_id;

        INSERT INTO public.question_options (question_id, option_text, is_correct, order_index) VALUES
            (v_q1_id, 'Singleton Pattern', FALSE, 1),
            (v_q1_id, 'Adapter Pattern', TRUE, 2),
            (v_q1_id, 'Observer Pattern', FALSE, 3),
            (v_q1_id, 'Builder Pattern', FALSE, 4);

        -- Question 2
        INSERT INTO public.questions (quiz_id, question_type, question_text, marks, order_index)
        VALUES (v_quiz_id, 'mcq', 'What is the correct sequence of Test-Driven Development (TDD)?', 2, 2)
        RETURNING id INTO v_q2_id;

        INSERT INTO public.question_options (question_id, option_text, is_correct, order_index) VALUES
            (v_q2_id, 'Implement -> Test -> Deploy', FALSE, 1),
            (v_q2_id, 'Write Failing Test -> Minimum Code to Pass -> Refactor', TRUE, 2),
            (v_q2_id, 'Refactor -> Write Test -> Commit', FALSE, 3),
            (v_q2_id, 'Design -> Code -> Manual QA', FALSE, 4);

        -- Question 3
        INSERT INTO public.questions (quiz_id, question_type, question_text, marks, order_index)
        VALUES (v_quiz_id, 'mcq', 'Which PostgreSQL feature enforces row-level access control directly in the database?', 2, 3)
        RETURNING id INTO v_q3_id;

        INSERT INTO public.question_options (question_id, option_text, is_correct, order_index) VALUES
            (v_q3_id, 'Foreign Key Constraints', FALSE, 1),
            (v_q3_id, 'Row Level Security (RLS)', TRUE, 2),
            (v_q3_id, 'B-Tree Indexes', FALSE, 3),
            (v_q3_id, 'Materialized Views', FALSE, 4);

        -- Question 4
        INSERT INTO public.questions (quiz_id, question_type, question_text, marks, order_index)
        VALUES (v_quiz_id, 'mcq', 'Which design pattern allows swapping scoring algorithms at runtime without modifying the evaluator?', 2, 4)
        RETURNING id INTO v_q4_id;

        INSERT INTO public.question_options (question_id, option_text, is_correct, order_index) VALUES
            (v_q4_id, 'Factory Pattern', FALSE, 1),
            (v_q4_id, 'Strategy Pattern', TRUE, 2),
            (v_q4_id, 'Decorator Pattern', FALSE, 3),
            (v_q4_id, 'Proxy Pattern', FALSE, 4);
    END IF;
END $$;
