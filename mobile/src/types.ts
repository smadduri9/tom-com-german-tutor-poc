export type Lang = 'te' | 'en' | 'hi';
export const LANGS: Lang[] = ['te', 'en', 'hi'];
export type L10n = Record<Lang, string>;
export type Level = 'A1' | 'A2' | 'B1';
export const LEVELS: Level[] = ['A1', 'A2', 'B1'];

export type VocabItem = { id: string; de: string; meaning: L10n; ipa?: string; note?: L10n };
export type Example = { id: string; de: string; meaning: L10n; source?: string };
export type DialogueLine = { id: string; speaker: string; de: string; meaning: L10n };
export type Dialogue = { scene: L10n; lines: DialogueLine[] };
export type QuizOption = { de?: string; text?: L10n };
export type QuizQuestion = {
  id: string;
  kind: 'mcq' | 'listening';
  prompt: L10n;
  audioId?: string;
  audio_de?: string;
  options: QuizOption[];
  correctIndex: number;
  explanation: L10n;
};
export type AudioItem = { id: string; text: string; voice: 'female' | 'male'; slow: boolean };

export type Lesson = {
  id: string;
  slug: string;
  level: Level;
  review: { te: boolean; hi: boolean };
  title: L10n;
  subtitle: L10n;
  intro: L10n;
  vocabulary: VocabItem[];
  examples: Example[];
  more_vocabulary: VocabItem[];
  dialogue: Dialogue;
  grammar_note: { title: L10n; body: L10n };
  deep_dive: L10n;
  common_mistakes: { wrong: string; right: string; why: L10n }[];
  cultural_note?: L10n;
  practice_tip: L10n;
  self_check: { question: L10n; answer: L10n }[];
  quiz: QuizQuestion[];
  audio: AudioItem[];
};

export type CurriculumItem = { slug: string; title: L10n; topic: L10n };
export type Curriculum = Record<Level, CurriculumItem[]>;

// Kept for the existing progress/tutor screens until they are rewritten.
export type Phrase = VocabItem;
