import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Lang } from '../types';
import type { OtpState } from '../logic/otp';
import { isPass } from '../logic/quiz';
import {
  DEFAULT_PROGRESS,
  DEFAULT_STATE,
  emailKey,
  loadState,
  saveState,
  type Persisted,
  type Progress,
  type Session,
} from './storage';

type AppCtx = {
  hydrated: boolean;
  lang: Lang; // always set; falls back to 'en' before the user chooses
  langChosen: boolean;
  session: Session | null;
  progress: Progress; // of the signed-in email
  otp: OtpState | null;
  setLang: (l: Lang) => void;
  setSession: (s: Session | null) => void;
  setOtp: (o: OtpState | null) => void;
  saveStep: (step: number) => void;
  recordQuiz: (score: number) => void;
  logout: () => void;
};

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Persisted>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [otp, setOtp] = useState<OtpState | null>(null);

  useEffect(() => {
    let alive = true;
    loadState().then((s) => {
      if (!alive) return;
      setState(s);
      setHydrated(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Only save after loading, otherwise defaults would overwrite saved data.
  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  const setLang = useCallback((lang: Lang) => setState((s) => ({ ...s, lang })), []);
  const setSession = useCallback((session: Session | null) => setState((s) => ({ ...s, session })), []);
  // Updates the signed-in email's progress; does nothing when nobody is signed in.
  const updateProgress = useCallback(
    (fn: (p: Progress) => Progress) =>
      setState((s) => {
        if (!s.session) return s;
        const key = emailKey(s.session.email);
        const cur = s.progressByEmail[key] ?? DEFAULT_PROGRESS;
        const next = fn(cur);
        return next === cur ? s : { ...s, progressByEmail: { ...s.progressByEmail, [key]: next } };
      }),
    [],
  );
  const saveStep = useCallback(
    (step: number) => updateProgress((p) => (p.step === step ? p : { ...p, step })),
    [updateProgress],
  );
  const recordQuiz = useCallback(
    (score: number) =>
      updateProgress((p) => ({ ...p, quizBest: Math.max(p.quizBest, score), passed: p.passed || isPass(score) })),
    [updateProgress],
  );
  const logout = useCallback(() => {
    setOtp(null);
    setState((s) => ({ ...s, session: null }));
  }, []);

  const value = useMemo<AppCtx>(
    () => ({
      hydrated,
      lang: state.lang ?? 'en',
      langChosen: state.lang !== null,
      session: state.session,
      progress: (state.session && state.progressByEmail[emailKey(state.session.email)]) || DEFAULT_PROGRESS,
      otp,
      setLang,
      setSession,
      setOtp,
      saveStep,
      recordQuiz,
      logout,
    }),
    [hydrated, state, otp, setLang, setSession, saveStep, recordQuiz, logout],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside AppProvider');
  return v;
}
