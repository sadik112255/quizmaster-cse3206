/** Computes remaining seconds until an ISO expiration timestamp (clamped at 0). */
export function getRemainingSeconds(expiresAtIso: string, nowMs: number = Date.now()): number {
  const expiresMs = new Date(expiresAtIso).getTime();
  if (Number.isNaN(expiresMs)) return 0;
  return Math.max(0, Math.floor((expiresMs - nowMs) / 1000));
}

/** Formats seconds as MM:SS (e.g., 04:09). */
export function formatCountdown(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
