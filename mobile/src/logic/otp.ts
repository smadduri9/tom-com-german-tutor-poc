export const DEMO_CODE = '123456';
export const MAX_ATTEMPTS = 5;
export const RESEND_COOLDOWN_MS = 30_000;
export const CODE_TTL_MS = 10 * 60_000;

export type OtpState = {
  email: string;
  sentAt: number;
  attemptsLeft: number;
  locked: boolean;
};

export type VerifyReason = 'format' | 'wrong' | 'locked' | 'expired';
export type VerifyResult = { ok: true } | { ok: false; reason: VerifyReason };

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function createOtp(email: string, now: number): OtpState {
  return { email: normalizeEmail(email), sentAt: now, attemptsLeft: MAX_ATTEMPTS, locked: false };
}

export function verifyOtp(
  state: OtpState,
  code: string,
  now: number,
): { result: VerifyResult; state: OtpState } {
  if (state.locked) return { result: { ok: false, reason: 'locked' }, state };
  if (now - state.sentAt > CODE_TTL_MS) return { result: { ok: false, reason: 'expired' }, state };
  if (!/^\d{6}$/.test(code)) return { result: { ok: false, reason: 'format' }, state };
  if (code === DEMO_CODE) return { result: { ok: true }, state };
  const attemptsLeft = state.attemptsLeft - 1;
  const next: OtpState = { ...state, attemptsLeft, locked: attemptsLeft <= 0 };
  return { result: { ok: false, reason: next.locked ? 'locked' : 'wrong' }, state: next };
}

export function resendSecondsLeft(state: OtpState, now: number): number {
  return Math.max(0, Math.ceil((state.sentAt + RESEND_COOLDOWN_MS - now) / 1000));
}
