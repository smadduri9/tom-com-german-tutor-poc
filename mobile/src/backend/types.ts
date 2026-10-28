import type { Lang, Level } from '../types';

export type User = { id: string; email: string; fullName: string; uiLanguage: Lang; createdAt: string };
export type ProgressRow = {
  level: Level;
  lessonSlug: string;
  lessonCompleted: boolean;
  quizScore: number | null; // percent 0-100, best so far
  updatedAt: string;
};
export type Certificate = {
  id: string;
  level: Level;
  score: number;
  issuedAt: string;
  publicSlug: string;
  fullName: string;
};
export type TutorTurn = { role: 'user' | 'assistant'; text: string };
export type TutorMode = 'ask' | 'translate';

export interface Backend {
  readonly kind: 'local' | 'supabase';
  signUp(email: string, password: string, fullName: string): Promise<void>;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  resetPassword(email: string): Promise<void>; // sends the 6-digit code
  verifyResetCode(email: string, code: string): Promise<void>; // signs the user in for the password change
  getUser(): Promise<User | null>;
  updateProfile(p: { fullName?: string; uiLanguage?: Lang }): Promise<void>;
  changePassword(newPassword: string): Promise<void>;
  listProgress(): Promise<ProgressRow[]>;
  saveProgress(row: Omit<ProgressRow, 'updatedAt'>): Promise<void>;
  listCertificates(): Promise<Certificate[]>;
  issueCertificate(level: Level, score: number): Promise<Certificate>;
  askTutor(question: string, lang: Lang, history: TutorTurn[], mode: TutorMode): Promise<string>;
}

// Thrown with a code the screens translate into the UI language.
export class BackendError extends Error {
  constructor(
    public code:
      | 'invalidCredentials'
      | 'emailTaken'
      | 'weakPassword'
      | 'invalidEmail'
      | 'invalidCode'
      | 'notSignedIn'
      | 'tutorLimit'
      | 'network',
    message?: string,
  ) {
    super(message ?? code);
  }
}

export const MIN_PASSWORD = 6;

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// Best score wins and a completed lesson never goes back to "not completed".
export function mergeProgress(
  existing: ProgressRow | undefined,
  row: Omit<ProgressRow, 'updatedAt'>,
  now: string,
): ProgressRow {
  const scores = [existing?.quizScore, row.quizScore].filter((s): s is number => typeof s === 'number');
  return {
    level: row.level,
    lessonSlug: row.lessonSlug,
    lessonCompleted: Boolean(existing?.lessonCompleted || row.lessonCompleted),
    quizScore: scores.length ? Math.max(...scores) : null,
    updatedAt: now,
  };
}

export function randomSlug(length = 12): string {
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789';
  let s = '';
  for (let i = 0; i < length; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}
