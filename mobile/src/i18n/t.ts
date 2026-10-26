import { strings, type StringKey } from './strings';
import type { L10n, Lang } from '../types';

export function t(lang: Lang, key: StringKey, vars?: Record<string, string | number>): string {
  let s: string = strings[key][lang] || strings[key].en;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
  }
  return s;
}

export function pick(text: L10n, lang: Lang): string {
  return text[lang] || text.en;
}
