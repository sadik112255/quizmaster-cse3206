import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const quizSchema = z.object({
  title: z.string().min(3, 'Quiz title must be at least 3 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  duration_minutes: z.coerce.number().int().min(1, 'Duration must be at least 1 minute').max(300),
  total_marks: z.coerce.number().int().min(1, 'Total marks must be at least 1'),
  pass_percentage: z.coerce.number().int().min(0).max(100),
  allow_multiple_attempts: z.boolean().default(false),
  show_answers_after_submit: z.boolean().default(true),
  is_published: z.boolean().default(false),
});

export const questionOptionSchema = z.object({
  option_text: z.string().min(1, 'Option text is required'),
  is_correct: z.boolean(),
});

export const mcqQuestionSchema = z
  .object({
    question_text: z.string().min(5, 'Question text must be at least 5 characters'),
    marks: z.coerce.number().int().min(1, 'Marks must be at least 1'),
    options: z.array(questionOptionSchema).length(4, 'MCQ must have exactly 4 options'),
  })
  .refine((data) => data.options.filter((o) => o.is_correct).length === 1, {
    message: 'Exactly one option must be marked as correct',
    path: ['options'],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type QuizFormValues = z.infer<typeof quizSchema>;
export type McqQuestionFormValues = z.infer<typeof mcqQuestionSchema>;
