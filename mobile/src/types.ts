export type Lang = 'te' | 'en' | 'hi';
export const LANGS: Lang[] = ['te', 'en', 'hi'];
export type L10n = Record<Lang, string>;

export type Phrase = { id: string; de: string; meaning: L10n };
export type DialogueLine = { id: string; speaker: string; de: string; meaning: L10n };
export type GrammarExample = { audioId: string; de: string; label: L10n };
export type PronItem = { audioId: string; de: string; focus: string; tip: L10n };
export type QuizOption = { de?: string; text?: L10n };
export type QuizQuestion = {
  id: string;
  prompt: L10n;
  audioId?: string;
  options: QuizOption[];
  correctIndex: number;
};
export type AudioItem = { id: string; text: string; voice: 'female' | 'male'; slow: boolean };

export type Lesson = {
  id: string;
  level: string;
  title: L10n;
  subtitle: L10n;
  intro: L10n;
  phrases: Phrase[];
  dialogue: DialogueLine[];
  grammar: { title: L10n; body: L10n; examples: GrammarExample[] };
  pronunciation: PronItem[];
  quiz: QuizQuestion[];
  audio: AudioItem[];
};
