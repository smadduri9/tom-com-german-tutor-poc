import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { backend, type TutorMode, type TutorTurn } from '../backend';
import { errorMessage } from '../i18n/levels';
import { t } from '../i18n/t';
import { useApp } from './AppContext';

// Chat history lives in memory for the session; the last 6 turns go to the tutor.
type TutorCtx = {
  turns: TutorTurn[];
  busy: boolean;
  error: string;
  ask: (question: string, mode: TutorMode) => Promise<string | null>;
};
const Ctx = createContext<TutorCtx | null>(null);

export function TutorProvider({ children }: { children: React.ReactNode }) {
  const { lang } = useApp();
  const [turns, setTurns] = useState<TutorTurn[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const ask = useCallback(
    async (question: string, mode: TutorMode) => {
      const shown = question;
      const sent = mode === 'translate' ? t(lang, 'translatePrefix') + question : question;
      const history = turns.slice(-6);
      setTurns((h) => [...h, { role: 'user', text: shown }]);
      setBusy(true);
      setError('');
      try {
        const answer = await backend.askTutor(sent, lang, history, mode);
        setTurns((h) => [...h, { role: 'assistant', text: answer }]);
        return answer;
      } catch (e) {
        setError(errorMessage(lang, e));
        return null;
      } finally {
        setBusy(false);
      }
    },
    [lang, turns],
  );

  const value = useMemo(() => ({ turns, busy, error, ask }), [turns, busy, error, ask]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTutor(): TutorCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useTutor must be used inside TutorProvider');
  return v;
}
