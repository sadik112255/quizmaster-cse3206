import { describe, expect, it, vi } from 'vitest';
import { attemptAdapter } from '../../src/adapters/attemptAdapter';
import { supabase } from '../../src/adapters/supabaseClient';

vi.mock('../../src/adapters/supabaseClient', () => ({
  supabase: {
    rpc: vi.fn(),
    from: vi.fn(),
  },
}));

describe('Quiz Submission Adapter (Mocked Supabase)', () => {
  it('calls submit_quiz_attempt RPC and returns graded attempt', async () => {
    const mockAttempt = {
      id: 'attempt-1',
      quiz_id: 'quiz-1',
      student_id: 'student-1',
      status: 'submitted',
      score: 8,
      percentage: 100,
      passed: true,
      started_at: '2026-11-28T10:00:00Z',
      expires_at: '2026-11-28T10:15:00Z',
      submitted_at: '2026-11-28T10:05:00Z',
    };

    vi.mocked(supabase.rpc).mockResolvedValue({
      data: mockAttempt,
      error: null,
    } as never);

    const result = await attemptAdapter.submitAttempt('attempt-1');
    expect(supabase.rpc).toHaveBeenCalledWith('submit_quiz_attempt', {
      p_attempt_id: 'attempt-1',
    });
    expect(result.status).toBe('submitted');
    expect(result.passed).toBe(true);
  });

  it('throws an error when RPC fails', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: null,
      error: { message: 'Attempt not found' },
    } as never);

    await expect(attemptAdapter.submitAttempt('bad-id')).rejects.toThrow('Attempt not found');
  });
});
