import { describe, expect, it } from 'vitest';
import { QuestionFactory } from '../../src/patterns/factory/QuestionFactory';
import {
  NegativeMarkingStrategy,
  QuizEvaluator,
  StandardScoringStrategy,
} from '../../src/patterns/strategy/ScoringStrategy';

describe('Design Patterns: QuestionFactory & ScoringStrategy', () => {
  it('creates a valid MCQ question via QuestionFactory', () => {
    const q = QuestionFactory.createQuestion('mcq', {
      questionText: 'Which pattern isolates Supabase?',
      marks: 2,
      orderIndex: 1,
      options: [
        { option_text: 'Adapter', is_correct: true },
        { option_text: 'Singleton', is_correct: false },
        { option_text: 'Observer', is_correct: false },
        { option_text: 'Decorator', is_correct: false },
      ],
    });

    expect(q.questionType).toBe('mcq');
    expect(q.options).toHaveLength(4);
    expect(q.validate()).toBe(true);
  });

  it('throws when QuestionFactory receives multiple correct options', () => {
    expect(() =>
      QuestionFactory.createQuestion('mcq', {
        questionText: 'Invalid MCQ',
        marks: 2,
        options: [
          { option_text: 'A', is_correct: true },
          { option_text: 'B', is_correct: true },
          { option_text: 'C', is_correct: false },
          { option_text: 'D', is_correct: false },
        ],
      })
    ).toThrow();
  });

  it('calculates score and pass status with StandardScoringStrategy', () => {
    const evaluator = new QuizEvaluator(new StandardScoringStrategy());
    const result = evaluator.evaluate(
      [
        { marks: 2, isSelected: true, isCorrect: true },
        { marks: 2, isSelected: true, isCorrect: false },
        { marks: 2, isSelected: true, isCorrect: true },
      ],
      50
    );

    expect(result.score).toBe(4);
    expect(result.totalMarks).toBe(6);
    expect(result.percentage).toBe(66.67);
    expect(result.passed).toBe(true);
  });

  it('deducts penalty for wrong answers with NegativeMarkingStrategy', () => {
    const evaluator = new QuizEvaluator(new NegativeMarkingStrategy(0.25));
    const result = evaluator.evaluate(
      [
        { marks: 4, isSelected: true, isCorrect: true },
        { marks: 4, isSelected: true, isCorrect: false },
      ],
      50
    );

    expect(result.score).toBe(3);
    expect(result.percentage).toBe(37.5);
    expect(result.passed).toBe(false);
  });

  it('clamps NegativeMarkingStrategy score at 0 when all answers are wrong', () => {
    const evaluator = new QuizEvaluator(new NegativeMarkingStrategy(0.5));
    const result = evaluator.evaluate(
      [
        { marks: 2, isSelected: true, isCorrect: false },
        { marks: 2, isSelected: true, isCorrect: false },
      ],
      50
    );

    expect(result.score).toBe(0);
    expect(result.totalMarks).toBe(4);
    expect(result.percentage).toBe(0);
    expect(result.passed).toBe(false);
  });
});
