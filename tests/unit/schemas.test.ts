import { describe, expect, it } from 'vitest';
import { loginSchema, mcqQuestionSchema, quizSchema, registerSchema } from '../../src/schemas';

describe('Authentication & Form Validation Schemas', () => {
  it('accepts valid login credentials', () => {
    const result = loginSchema.safeParse({
      email: 'student@ruet.ac.bd',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email or short password on login', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: '123' });
    expect(result.success).toBe(false);
  });

  it('rejects registration when passwords do not match', () => {
    const result = registerSchema.safeParse({
      fullName: 'Sadik',
      email: 'sadik@ruet.ac.bd',
      password: 'password123',
      confirmPassword: 'differentPassword',
    });
    expect(result.success).toBe(false);
  });

  it('validates quiz creation payload', () => {
    const result = quizSchema.safeParse({
      title: 'CSE 3206 Midterm',
      description: 'Software Engineering Sessional Quiz',
      duration_minutes: 20,
      total_marks: 10,
      pass_percentage: 50,
    });
    expect(result.success).toBe(true);
  });

  it('rejects MCQ question without exactly one correct option', () => {
    const result = mcqQuestionSchema.safeParse({
      question_text: 'What is TDD?',
      marks: 2,
      options: [
        { option_text: 'A', is_correct: false },
        { option_text: 'B', is_correct: false },
        { option_text: 'C', is_correct: false },
        { option_text: 'D', is_correct: false },
      ],
    });
    expect(result.success).toBe(false);
  });
});
