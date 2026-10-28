import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { backend, BackendError, type Certificate, type ProgressRow, type User } from '../backend';
import { curriculumData, lessons } from '../data/lessons';
import { certificateScore, levelCertified } from '../logic/progress';
import type { Lang, Level } from '../types';

const LANG_KEY = 'tomcom.lang';

type AppCtx = {
  hydrated: boolean;
  lang: Lang;
  user: User | null;
  progress: ProgressRow[];
  certificates: Certificate[];
  setLang: (l: Lang) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  verifyResetCode: (email: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateName: (name: string) => Promise<void>;
  openLesson: (level: Level, slug: string) => Promise<void>;
  completeLesson: (level: Level, slug: string) => Promise<void>;
  recordQuiz: (level: Level, slug: string, percent: number) => Promise<Certificate | null>;
  markLevelPassedDemo: (level: Level) => Promise<Certificate | null>;
};

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [lang, setLangState] = useState<Lang>('en');
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<ProgressRow[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  const loadAccount = useCallback(async () => {
    const u = await backend.getUser();
    setUser(u);
    if (u) {
      setLangState(u.uiLanguage);
      const [p, c] = await Promise.all([backend.listProgress(), backend.listCertificates()]);
      setProgress(p);
      setCertificates(c);
    } else {
      setProgress([]);
      setCertificates([]);
    }
    return u;
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(LANG_KEY);
        if (saved === 'en' || saved === 'te' || saved === 'hi') setLangState(saved);
        await loadAccount();
      } catch (e) {
        console.warn('load failed', e);
      } finally {
        setHydrated(true);
      }
    })();
  }, [loadAccount]);

  const setLang = useCallback(
    (l: Lang) => {
      setLangState(l);
      AsyncStorage.setItem(LANG_KEY, l).catch(() => {});
      if (user) {
        setUser({ ...user, uiLanguage: l });
        backend.updateProfile({ uiLanguage: l }).catch(() => {});
      }
    },
    [user],
  );

  // After sign-in the app keeps the language the learner picked on this device.
  const afterSignIn = useCallback(async () => {
    const u = await loadAccount();
    if (u && u.uiLanguage !== lang) {
      await backend.updateProfile({ uiLanguage: lang }).catch(() => {});
      setUser({ ...u, uiLanguage: lang });
      setLangState(lang);
    }
    return u;
  }, [loadAccount, lang]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      await backend.signIn(email, password);
      await afterSignIn();
    },
    [afterSignIn],
  );
  const signUp = useCallback(
    async (email: string, password: string, fullName: string) => {
      await backend.signUp(email, password, fullName);
      // Supabase with email confirmation on: the account exists but nobody is signed in yet.
      if (!(await afterSignIn())) throw new BackendError('notSignedIn');
    },
    [afterSignIn],
  );
  const verifyResetCode = useCallback(
    async (email: string, code: string) => {
      await backend.verifyResetCode(email, code);
      await afterSignIn();
    },
    [afterSignIn],
  );
  const signOut = useCallback(async () => {
    await backend.signOut();
    setUser(null);
    setProgress([]);
    setCertificates([]);
  }, []);
  const updateName = useCallback(
    async (name: string) => {
      await backend.updateProfile({ fullName: name });
      await loadAccount();
    },
    [loadAccount],
  );

  const refreshProgress = useCallback(async () => {
    const p = await backend.listProgress();
    setProgress(p);
    return p;
  }, []);

  const save = useCallback(
    async (level: Level, slug: string, completed: boolean, score: number | null) => {
      await backend.saveProgress({ level, lessonSlug: slug, lessonCompleted: completed, quizScore: score });
      return refreshProgress();
    },
    [refreshProgress],
  );

  // Issues the level certificate when the rule becomes true and it does not exist yet.
  const maybeCertify = useCallback(
    async (level: Level, rows: ProgressRow[]): Promise<Certificate | null> => {
      if (!levelCertified(level, rows, curriculumData)) return null;
      if (certificates.some((c) => c.level === level)) return null;
      const cert = await backend.issueCertificate(level, certificateScore(level, rows, curriculumData));
      setCertificates(await backend.listCertificates());
      return cert;
    },
    [certificates],
  );

  const openLesson = useCallback((level: Level, slug: string) => save(level, slug, false, null).then(() => {}), [save]);
  const completeLesson = useCallback((level: Level, slug: string) => save(level, slug, true, null).then(() => {}), [save]);
  const recordQuiz = useCallback(
    async (level: Level, slug: string, percent: number) => maybeCertify(level, await save(level, slug, true, percent)),
    [save, maybeCertify],
  );
  // Dev-only shortcut: marks every lesson in the level as passed with 100%.
  const markLevelPassedDemo = useCallback(
    async (level: Level) => {
      for (const item of curriculumData[level]) {
        await backend.saveProgress({ level, lessonSlug: item.slug, lessonCompleted: true, quizScore: 100 });
      }
      return maybeCertify(level, await refreshProgress());
    },
    [refreshProgress, maybeCertify],
  );

  const value = useMemo<AppCtx>(
    () => ({
      hydrated,
      lang,
      user,
      progress,
      certificates,
      setLang,
      signIn,
      signUp,
      verifyResetCode,
      signOut,
      updateName,
      openLesson,
      completeLesson,
      recordQuiz,
      markLevelPassedDemo,
    }),
    [hydrated, lang, user, progress, certificates, setLang, signIn, signUp, verifyResetCode, signOut, updateName, openLesson, completeLesson, recordQuiz, markLevelPassedDemo],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside AppProvider');
  return v;
}

export function hasLesson(level: Level, slug: string): boolean {
  return Boolean(lessons[level]?.[slug]);
}
