import AsyncStorage from '@react-native-async-storage/async-storage';
import { LANGS, type Lang } from '../types';

const KEY = 'tc.v1';

export type Progress = { step: number; quizBest: number; passed: boolean };
export type Session = { email: string };
export type Persisted = { lang: Lang | null; session: Session | null; progress: Progress };

export const DEFAULT_STATE: Persisted = {
  lang: null,
  session: null,
  progress: { step: 0, quizBest: 0, passed: false },
};

// Never trust stored data: anything malformed falls back to defaults.
export function parsePersisted(raw: string | null): Persisted {
  if (!raw) return DEFAULT_STATE;
  try {
    const d = JSON.parse(raw);
    const lang: Lang | null = LANGS.includes(d?.lang) ? d.lang : null;
    const session: Session | null =
      typeof d?.session?.email === 'string' && d.session.email.length > 0 ? { email: d.session.email } : null;
    const p = d?.progress ?? {};
    const progress: Progress = {
      step: Number.isInteger(p.step) && p.step >= 0 ? p.step : 0,
      quizBest: Number.isInteger(p.quizBest) && p.quizBest >= 0 && p.quizBest <= 5 ? p.quizBest : 0,
      passed: p.passed === true,
    };
    return { lang, session, progress };
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
