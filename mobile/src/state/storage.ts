import AsyncStorage from '@react-native-async-storage/async-storage';
import { LANGS, type Lang } from '../types';

const KEY = 'tc.v1';

export type Progress = { step: number; quizBest: number; passed: boolean };
export type Session = { email: string };
// Progress is kept per email, so each person who signs in on this phone starts fresh.
export type Persisted = { lang: Lang | null; session: Session | null; progressByEmail: Record<string, Progress> };

export const DEFAULT_PROGRESS: Progress = { step: 0, quizBest: 0, passed: false };

export const DEFAULT_STATE: Persisted = { lang: null, session: null, progressByEmail: {} };

export function emailKey(email: string): string {
  return email.trim().toLowerCase();
}

function parseProgress(p: unknown): Progress | null {
  if (!p || typeof p !== 'object') return null;
  const o = p as Record<string, unknown>;
  const step = o.step, quizBest = o.quizBest;
  return {
    step: Number.isInteger(step) && (step as number) >= 0 ? (step as number) : 0,
    quizBest: Number.isInteger(quizBest) && (quizBest as number) >= 0 && (quizBest as number) <= 5 ? (quizBest as number) : 0,
    passed: o.passed === true,
  };
}

// Never trust stored data: anything malformed falls back to defaults.
export function parsePersisted(raw: string | null): Persisted {
  if (!raw) return DEFAULT_STATE;
  try {
    const d = JSON.parse(raw);
    const lang: Lang | null = LANGS.includes(d?.lang) ? d.lang : null;
    const session: Session | null =
      typeof d?.session?.email === 'string' && d.session.email.length > 0 ? { email: d.session.email } : null;
    const progressByEmail: Record<string, Progress> = {};
    if (d?.progressByEmail && typeof d.progressByEmail === 'object') {
      for (const [email, p] of Object.entries(d.progressByEmail)) {
        const parsed = parseProgress(p);
        if (parsed) progressByEmail[emailKey(email)] = parsed;
      }
    } else if (session) {
      // Older saves had one shared progress; give it to whoever is signed in.
      const old = parseProgress(d?.progress);
      if (old) progressByEmail[emailKey(session.email)] = old;
    }
    return { lang, session, progressByEmail };
  } catch {
    return DEFAULT_STATE;
  }
}

export async function loadState(): Promise<Persisted> {
  try {
    return parsePersisted(await AsyncStorage.getItem(KEY));
  } catch {
    return DEFAULT_STATE;
  }
}

export async function saveState(state: Persisted): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Saving is best effort in the POC; the app keeps working in memory.
  }
}
