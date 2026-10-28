import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, FunctionsHttpError, type SupabaseClient } from '@supabase/supabase-js';
import type { Lang, Level } from '../types';
import {
  BackendError,
  isValidEmail,
  MIN_PASSWORD,
  type Backend,
  type Certificate,
  type ProgressRow,
  type TutorMode,
  type TutorTurn,
} from './types';

type ProgressDb = {
  level: Level;
  lesson_slug: string;
  lesson_completed: boolean;
  quiz_score: number | null;
  updated_at: string;
};
type CertDb = { id: string; level: Level; score: number; issued_at: string; public_slug: string };

export function createSupabaseBackend(url: string, anonKey: string): Backend {
  const sb: SupabaseClient = createClient(url, anonKey, {
    auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
  });

  async function uid(): Promise<string> {
    const { data } = await sb.auth.getUser();
    if (!data.user) throw new BackendError('notSignedIn');
    return data.user.id;
  }
  function fail(error: { message?: string; status?: number } | null): never {
    const msg = error?.message ?? '';
    if (/invalid login/i.test(msg)) throw new BackendError('invalidCredentials', msg);
    if (/already registered|already exists/i.test(msg)) throw new BackendError('emailTaken', msg);
    if (/token|otp/i.test(msg)) throw new BackendError('invalidCode', msg);
    throw new BackendError('network', msg);
  }
  async function ensureProfile(fullName?: string) {
    const id = await uid();
    const { data } = await sb.from('profiles').select('id').eq('id', id).maybeSingle();
    if (!data) {
      const { error } = await sb.from('profiles').upsert({ id, full_name: fullName ?? '', ui_language: 'en' });
      if (error) fail(error);
    }
  }
  async function fullName(): Promise<string> {
    const id = await uid();
    const { data } = await sb.from('profiles').select('full_name').eq('id', id).maybeSingle();
    return data?.full_name ?? '';
  }

  return {
    kind: 'supabase',
    async signUp(email, password, name) {
      if (!isValidEmail(email)) throw new BackendError('invalidEmail');
      if (password.length < MIN_PASSWORD) throw new BackendError('weakPassword');
      const { error } = await sb.auth.signUp({ email: email.trim(), password, options: { data: { full_name: name } } });
      if (error) fail(error);
      // With "confirm email" switched on there is no session yet; the profile is created at first sign-in.
      const { data } = await sb.auth.getSession();
      if (data.session) await ensureProfile(name);
    },
    async signIn(email, password) {
      const { data, error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
      if (error) fail(error);
      await ensureProfile((data.user?.user_metadata?.full_name as string | undefined) ?? '');
    },
    async signOut() {
      await sb.auth.signOut();
    },
    async resetPassword(email) {
      if (!isValidEmail(email)) throw new BackendError('invalidEmail');
      const { error } = await sb.auth.resetPasswordForEmail(email.trim());
      if (error) fail(error);
    },
    async verifyResetCode(email, code) {
      const { error } = await sb.auth.verifyOtp({ email: email.trim(), token: code, type: 'recovery' });
      if (error) fail(error);
    },
    async getUser() {
      const { data } = await sb.auth.getUser();
      const u = data.user;
      if (!u) return null;
      const { data: p } = await sb.from('profiles').select('full_name, ui_language, created_at').eq('id', u.id).maybeSingle();
      return {
        id: u.id,
        email: u.email ?? '',
        fullName: p?.full_name ?? '',
        uiLanguage: (p?.ui_language as Lang | undefined) ?? 'en',
        createdAt: p?.created_at ?? u.created_at,
      };
    },
    async updateProfile(p: { fullName?: string; uiLanguage?: Lang }) {
      const id = await uid();
      const patch: Record<string, string> = {};
      if (p.fullName !== undefined) patch.full_name = p.fullName.trim();
      if (p.uiLanguage !== undefined) patch.ui_language = p.uiLanguage;
      const { error } = await sb.from('profiles').update(patch).eq('id', id);
      if (error) fail(error);
    },
    async changePassword(newPassword) {
      if (newPassword.length < MIN_PASSWORD) throw new BackendError('weakPassword');
      const { error } = await sb.auth.updateUser({ password: newPassword });
      if (error) fail(error);
    },
    async listProgress() {
      const { data, error } = await sb.from('progress').select('level, lesson_slug, lesson_completed, quiz_score, updated_at');
      if (error) fail(error);
      return ((data ?? []) as ProgressDb[]).map(
        (r): ProgressRow => ({
          level: r.level,
          lessonSlug: r.lesson_slug,
          lessonCompleted: r.lesson_completed,
          quizScore: r.quiz_score,
          updatedAt: r.updated_at,
        }),
      );
    },
    async saveProgress(row) {
      const id = await uid();
      const { data: old } = await sb
        .from('progress')
        .select('lesson_completed, quiz_score')
        .eq('user_id', id)
        .eq('level', row.level)
        .eq('lesson_slug', row.lessonSlug)
        .maybeSingle();
      const scores = [old?.quiz_score, row.quizScore].filter((s): s is number => typeof s === 'number');
      const { error } = await sb.from('progress').upsert({
        user_id: id,
        level: row.level,
        lesson_slug: row.lessonSlug,
        lesson_completed: Boolean(old?.lesson_completed || row.lessonCompleted),
        quiz_score: scores.length ? Math.max(...scores) : null,
        updated_at: new Date().toISOString(),
      });
      if (error) fail(error);
    },
    async listCertificates() {
      const { data, error } = await sb.from('certificates').select('id, level, score, issued_at, public_slug');
      if (error) fail(error);
      const name = await fullName();
      return ((data ?? []) as CertDb[]).map(
        (c): Certificate => ({
          id: c.id,
          level: c.level,
          score: c.score,
          issuedAt: c.issued_at,
          publicSlug: c.public_slug,
          fullName: name,
        }),
      );
    },
    async issueCertificate(level: Level, score: number) {
      const id = await uid();
      const { data, error } = await sb
        .from('certificates')
        .upsert({ user_id: id, level, score }, { onConflict: 'user_id,level', ignoreDuplicates: false })
        .select('id, level, score, issued_at, public_slug')
        .single();
      if (error) fail(error);
      const c = data as CertDb;
      return { id: c.id, level: c.level, score: c.score, issuedAt: c.issued_at, publicSlug: c.public_slug, fullName: await fullName() };
    },
    async askTutor(question: string, lang: Lang, history: TutorTurn[], mode: TutorMode) {
      const { data, error } = await sb.functions.invoke('tutor', {
        body: { question, lang, mode, history: history.slice(-6) },
      });
      if (error) {
        if (error instanceof FunctionsHttpError && error.context?.status === 429) throw new BackendError('tutorLimit');
        throw new BackendError('network', error.message);
      }
      return String((data as { answer?: string })?.answer ?? '');
    },
  };
}
