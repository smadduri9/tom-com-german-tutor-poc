import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Lang } from '../types';
import type { OtpState } from '../logic/otp';
import { isPass } from '../logic/quiz';
import { DEFAULT_STATE, loadState, saveState, type Persisted, type Session } from './storage';

type AppCtx = {
  hydrated: boolean;
  lang: Lang; // always set; falls back to 'en' before the user chooses
  langChosen: boolean;
  session: Session | null;
  progress: Persisted['progress'];
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
  const saveStep = useCallback(
    (step: number) => setState((s) => (s.progress.step === step ? s : { ...s, progress: { ...s.progress, step } })),
    [],
  );
  const recordQuiz = useCallback(
    (score: number) =>
      setState((s) => ({
        ...s,
        progress: {
          ...s.progress,
          quizBest: Math.max(s.progress.quizBest, score),
          passed: s.progress.passed || isPass(score),
        },
      })),
    [],
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
      progress: state.progress,
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
