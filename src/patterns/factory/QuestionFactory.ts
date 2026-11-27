export type SupportedQuestionType = 'mcq';

export interface QuestionOptionInput {
  option_text: string;
  is_correct: boolean;
  order_index: number;
}

export interface BaseQuestion {
  questionType: SupportedQuestionType;
  questionText: string;
  marks: number;
  orderIndex: number;
  validate(): boolean;
}

export class McqQuestion implements BaseQuestion {
  public readonly questionType: SupportedQuestionType = 'mcq';
  public readonly questionText: string;
  public readonly marks: number;
  public readonly orderIndex: number;
  public readonly options: QuestionOptionInput[];

  constructor(payload: {
    questionText: string;
    marks: number;
    orderIndex?: number;
    options: { option_text: string; is_correct: boolean }[];
  }) {
    this.questionText = payload.questionText.trim();
    this.marks = payload.marks;
    this.orderIndex = payload.orderIndex ?? 0;
    this.options = payload.options.map((opt, idx) => ({
      option_text: opt.option_text.trim(),
      is_correct: opt.is_correct,
      order_index: idx + 1,
    }));
  }

  /** Validates MCQ invariants: non-empty text, positive marks, 4 options, 1 correct answer. */
  validate(): boolean {
    if (!this.questionText || this.marks <= 0) return false;
    if (this.options.length !== 4) return false;
    if (this.options.some((o) => !o.option_text)) return false;
    const correctCount = this.options.filter((o) => o.is_correct).length;
    return correctCount === 1;
  }
}

export interface CreateMcqPayload {
  questionText: string;
  marks: number;
  orderIndex?: number;
  options: { option_text: string; is_correct: boolean }[];
}

/**
 * Factory Pattern (Creational):
 * Encapsulates creation and validation of question objects so new question types
 * can be added without modifying UI form components.
 */
export class QuestionFactory {
  static createQuestion(type: SupportedQuestionType, payload: CreateMcqPayload): McqQuestion {
    switch (type) {
      case 'mcq': {
        const question = new McqQuestion(payload);
        if (!question.validate()) {
          throw new Error(
            'Invalid MCQ question: requires non-empty text, positive marks, 4 non-empty options, and exactly 1 correct option.'
          );
        }
        return question;
      }
      default:
        throw new Error(`Unsupported question type: ${String(type)}`);
    }
  }
}
