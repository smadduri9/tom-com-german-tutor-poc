import type { Lang, Level } from '../types';
import { t } from './t';

export function levelName(lang: Lang, level: Level): string {
  return t(lang, level === 'A1' ? 'levelA1' : level === 'A2' ? 'levelA2' : 'levelB1');
}

export function errorMessage(lang: Lang, e: unknown): string {
  const code = (e as { code?: string })?.code;
  switch (code) {
    case 'invalidCredentials':
      return t(lang, 'errInvalidCredentials');
    case 'emailTaken':
      return t(lang, 'errEmailTaken');
    case 'weakPassword':
      return t(lang, 'errWeakPassword');
    case 'invalidEmail':
      return t(lang, 'errInvalidEmail');
    case 'invalidCode':
      return t(lang, 'errInvalidCode');
    case 'tutorLimit':
      return t(lang, 'tutorLimit');
    default:
      return t(lang, 'errNetwork');
  }
}

export function formatDay(iso: string, lang: Lang): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const locale = lang === 'te' ? 'te-IN' : lang === 'hi' ? 'hi-IN' : 'en-GB';
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
}
