export interface AnswerEvaluationInput {
  marks: number;
  isSelected: boolean;
  isCorrect: boolean;
}

export interface EvaluationResult {
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
}

/**
 * Strategy Pattern (Behavioral):
 * Defines a common contract for quiz scoring algorithms.
 */
export interface ScoringStrategy {
  calculateScore(items: AnswerEvaluationInput[], passPercentage: number): EvaluationResult;
}

/** Standard MCQ scoring: full marks for correct answers, 0 for incorrect/unanswered. */
export class StandardScoringStrategy implements ScoringStrategy {
  calculateScore(items: AnswerEvaluationInput[], passPercentage: number): EvaluationResult {
    const totalMarks = items.reduce((sum, item) => sum + item.marks, 0);
    const score = items.reduce(
      (sum, item) => (item.isSelected && item.isCorrect ? sum + item.marks : sum),
      0
    );
    const percentage = totalMarks > 0 ? Number(((score / totalMarks) * 100).toFixed(2)) : 0;
    return {
      score,
      totalMarks,
      percentage,
      passed: percentage >= passPercentage,
    };
  }
}

/** Future negative-marking strategy: deducts a fraction of marks for wrong selected answers. */
export class NegativeMarkingStrategy implements ScoringStrategy {
  private readonly penaltyRatio: number;

  constructor(penaltyRatio = 0.25) {
    this.penaltyRatio = penaltyRatio;
  }

  calculateScore(items: AnswerEvaluationInput[], passPercentage: number): EvaluationResult {
    const totalMarks = items.reduce((sum, item) => sum + item.marks, 0);
    const rawScore = items.reduce((sum, item) => {
      if (!item.isSelected) return sum;
      return item.isCorrect ? sum + item.marks : sum - item.marks * this.penaltyRatio;
    }, 0);
    const score = Math.max(0, Number(rawScore.toFixed(2)));
    const percentage = totalMarks > 0 ? Number(((score / totalMarks) * 100).toFixed(2)) : 0;
    return {
      score,
      totalMarks,
      percentage,
      passed: percentage >= passPercentage,
    };
  }
}

/** Context class that delegates evaluation to the active ScoringStrategy. */
export class QuizEvaluator {
  private strategy: ScoringStrategy;

  constructor(strategy: ScoringStrategy = new StandardScoringStrategy()) {
    this.strategy = strategy;
  }

  setStrategy(strategy: ScoringStrategy): void {
    this.strategy = strategy;
  }

  evaluate(items: AnswerEvaluationInput[], passPercentage: number): EvaluationResult {
    return this.strategy.calculateScore(items, passPercentage);
  }
}
