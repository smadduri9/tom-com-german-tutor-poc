import {
  CODE_TTL_MS, DEMO_CODE, MAX_ATTEMPTS, RESEND_COOLDOWN_MS,
  createOtp, isValidEmail, normalizeEmail, resendSecondsLeft, verifyOtp,
} from '../src/logic/otp';

describe('email', () => {
  it('accepts valid emails', () => {
    expect(isValidEmail('ravi@example.com')).toBe(true);
    expect(isValidEmail('  ravi.k@gov.in ')).toBe(true);
  });
  it('rejects invalid emails', () => {
    for (const e of ['', 'ravi', 'ravi@', '@x.com', 'ravi@x', 'ra vi@x.com', 'ravi@x.c']) {
      expect(isValidEmail(e)).toBe(false);
    }
  });
  it('normalizes', () => expect(normalizeEmail('  Ravi@Example.COM ')).toBe('ravi@example.com'));
});

describe('verifyOtp', () => {
  const t0 = 1_000_000;
  it('accepts the demo code', () => {
    const s = createOtp('a@b.co', t0);
    expect(verifyOtp(s, DEMO_CODE, t0 + 1000).result).toEqual({ ok: true });
  });
  it('rejects bad format without using an attempt', () => {
    const s = createOtp('a@b.co', t0);
    for (const c of ['', '12345', '1234567', 'abcdef', '12 456']) {
      const r = verifyOtp(s, c, t0);
      expect(r.result).toEqual({ ok: false, reason: 'format' });
      expect(r.state.attemptsLeft).toBe(MAX_ATTEMPTS);
    }
  });
  it('counts wrong attempts and locks after the max', () => {
    let s = createOtp('a@b.co', t0);
    for (let i = 1; i < MAX_ATTEMPTS; i++) {
      const r = verifyOtp(s, '000000', t0);
      expect(r.result).toEqual({ ok: false, reason: 'wrong' });
      expect(r.state.attemptsLeft).toBe(MAX_ATTEMPTS - i);
      s = r.state;
    }
    const last = verifyOtp(s, '000000', t0);
    expect(last.result).toEqual({ ok: false, reason: 'locked' });
    expect(last.state.locked).toBe(true);
    expect(verifyOtp(last.state, DEMO_CODE, t0).result).toEqual({ ok: false, reason: 'locked' });
  });
  it('expires after the TTL', () => {
    const s = createOtp('a@b.co', t0);
    expect(verifyOtp(s, DEMO_CODE, t0 + CODE_TTL_MS + 1).result).toEqual({ ok: false, reason: 'expired' });
  });
  it('resend cooldown counts down to zero', () => {
    const s = createOtp('a@b.co', t0);
    expect(resendSecondsLeft(s, t0)).toBe(RESEND_COOLDOWN_MS / 1000);
    expect(resendSecondsLeft(s, t0 + RESEND_COOLDOWN_MS)).toBe(0);
    expect(resendSecondsLeft(s, t0 + RESEND_COOLDOWN_MS + 5000)).toBe(0);
  });
});
