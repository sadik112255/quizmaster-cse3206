import { describe, expect, it } from 'vitest';
import { formatCountdown, getRemainingSeconds } from '../../src/utils/timer';

describe('Timer Utilities', () => {
  it('computes remaining seconds accurately and clamps at 0', () => {
    const now = new Date('2026-11-28T10:00:00Z').getTime();
    expect(getRemainingSeconds('2026-11-28T10:05:30Z', now)).toBe(330);
    expect(getRemainingSeconds('2026-11-28T09:59:00Z', now)).toBe(0);
  });

  it('formats seconds as MM:SS', () => {
    expect(formatCountdown(0)).toBe('00:00');
    expect(formatCountdown(65)).toBe('01:05');
    expect(formatCountdown(900)).toBe('15:00');
  });
});
