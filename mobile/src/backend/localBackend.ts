import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Lang, Level } from '../types';
import { cannedAnswer } from './tutorCanned';
import {
  BackendError,
  isValidEmail,
  mergeProgress,
  MIN_PASSWORD,
  randomSlug,
  type Backend,
  type Certificate,
  type ProgressRow,
  type TutorMode,
  type TutorTurn,
  type User,
} from './types';

// Demo backend for the simulator: everything stays on the device, no keys needed.
// Never used when Supabase is configured (see backend/index.ts).
const KEY = 'tomcom.local.v1';
export const DEMO_EMAIL = 'demo@tomcom.test';
export const DEMO_PASSWORD = 'demo1234';
export const DEMO_RESET_CODE = '123456';

type LocalUser = User & { password: string };
type Db = {
  users: Record<string, LocalUser>; // by lower-case email
  sessionEmail: string | null;
  progress: Record<string, ProgressRow[]>; // by user id
  certificates: Record<string, Certificate[]>; // by user id
};

const norm = (email: string) => email.trim().toLowerCase();

function emptyDb(): Db {
  const demo: LocalUser = {
    id: 'demo-user',
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    fullName: 'Demo Learner',
    uiLanguage: 'en',
    createdAt: new Date().toISOString(),
  };
  return { users: { [DEMO_EMAIL]: demo }, sessionEmail: null, progress: {}, certificates: {} };
}

export function createLocalBackend(): Backend {
  let cache: Db | null = null;

  async function load(): Promise<Db> {
    if (cache) return cache;
    try {
      const raw = await AsyncStorage.getItem(KEY);
      cache = raw ? (JSON.parse(raw) as Db) : emptyDb();
    } catch {
      cache = emptyDb();
    }
    return cache;
  }
  async function save(db: Db) {
    cache = db;
    await AsyncStorage.setItem(KEY, JSON.stringify(db));
  }
  async function current(): Promise<{ db: Db; user: LocalUser }> {
    const db = await load();
    const user = db.sessionEmail ? db.users[db.sessionEmail] : undefined;
    if (!user) throw new BackendError('notSignedIn');
    return { db, user };
  }
  const publicUser = ({ password: _p, ...u }: LocalUser): User => u;

  return {
    kind: 'local',
    async signUp(email, password, fullName) {
      if (!isValidEmail(email)) throw new BackendError('invalidEmail');
      if (password.length < MIN_PASSWORD) throw new BackendError('weakPassword');
      const db = await load();
      const key = norm(email);
      if (db.users[key]) throw new BackendError('emailTaken');
      db.users[key] = {
        id: `local-${randomSlug(10)}`,
        email: key,
        password,
        fullName: fullName.trim(),
        uiLanguage: 'en',
        createdAt: new Date().toISOString(),
      };
      db.sessionEmail = key;
      await save(db);
    },
    async signIn(email, password) {
      const db = await load();
      const user = db.users[norm(email)];
      if (!user || user.password !== password) throw new BackendError('invalidCredentials');
      db.sessionEmail = user.email;
      await save(db);
    },
    async signOut() {
      const db = await load();
      db.sessionEmail = null;
      await save(db);
    },
    async resetPassword(email) {
      if (!isValidEmail(email)) throw new BackendError('invalidEmail');
      // The demo "sends" the fixed code shown on the screen.
    },
    async verifyResetCode(email, code) {
      const db = await load();
      const user = db.users[norm(email)];
      if (!user || code !== DEMO_RESET_CODE) throw new BackendError('invalidCode');
      db.sessionEmail = user.email;
      await save(db);
    },
    async getUser() {
      const db = await load();
      const user = db.sessionEmail ? db.users[db.sessionEmail] : undefined;
      return user ? publicUser(user) : null;
    },
    async updateProfile(p: { fullName?: string; uiLanguage?: Lang }) {
      const { db, user } = await current();
      if (p.fullName !== undefined) user.fullName = p.fullName.trim();
      if (p.uiLanguage !== undefined) user.uiLanguage = p.uiLanguage;
      await save(db);
    },
    async changePassword(newPassword) {
      if (newPassword.length < MIN_PASSWORD) throw new BackendError('weakPassword');
      const { db, user } = await current();
      user.password = newPassword;
      await save(db);
    },
    async listProgress() {
      const { db, user } = await current();
      return db.progress[user.id] ?? [];
    },
    async saveProgress(row) {
      const { db, user } = await current();
      const rows = db.progress[user.id] ?? [];
      const i = rows.findIndex((r) => r.level === row.level && r.lessonSlug === row.lessonSlug);
      const next = mergeProgress(rows[i], row, new Date().toISOString());
      db.progress[user.id] = i >= 0 ? rows.map((r, j) => (j === i ? next : r)) : [...rows, next];
      await save(db);
    },
    async listCertificates() {
      const { db, user } = await current();
      return (db.certificates[user.id] ?? []).map((c) => ({ ...c, fullName: user.fullName }));
    },
    async issueCertificate(level: Level, score: number) {
      const { db, user } = await current();
      const list = db.certificates[user.id] ?? [];
      const existing = list.find((c) => c.level === level);
      if (existing) return { ...existing, fullName: user.fullName };
      const cert: Certificate = {
        id: `cert-${randomSlug(10)}`,
        level,
        score,
        issuedAt: new Date().toISOString(),
        publicSlug: randomSlug(12),
        fullName: user.fullName,
      };
      db.certificates[user.id] = [...list, cert];
      await save(db);
      return cert;
    },
    async askTutor(question: string, lang: Lang, _history: TutorTurn[], mode: TutorMode) {
      await new Promise((r) => setTimeout(r, 400));
      return cannedAnswer(question, lang, mode);
    },
  };
}
