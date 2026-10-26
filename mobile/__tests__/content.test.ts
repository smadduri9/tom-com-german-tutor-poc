import { lesson1 } from '../src/data/lesson';
import { audioMap } from '../src/data/audioMap';
import { strings } from '../src/i18n/strings';
import { LANGS, type L10n } from '../src/types';

function expectL10n(l: L10n, where: string) {
  for (const lang of LANGS) {
    if (typeof l?.[lang] !== 'string' || l[lang].trim() === '') throw new Error(`Missing ${lang} in ${where}`);
  }
}

describe('UI strings', () => {
  it('every key has te, en, hi', () => {
    for (const [k, v] of Object.entries(strings)) expectL10n(v, `strings.${k}`);
  });
});

describe('lesson1 content', () => {
  const audioIds = new Set(lesson1.audio.map((a) => a.id));

  it('has 15 phrases, 6 dialogue lines, 5 quiz questions', () => {
    expect(lesson1.phrases).toHaveLength(15);
    expect(lesson1.dialogue).toHaveLength(6);
    expect(lesson1.quiz).toHaveLength(5);
  });

  it('every text is trilingual', () => {
    expectL10n(lesson1.title, 'title');
    expectL10n(lesson1.subtitle, 'subtitle');
    expectL10n(lesson1.intro, 'intro');
    lesson1.phrases.forEach((p) => expectL10n(p.meaning, p.id));
    lesson1.dialogue.forEach((d) => expectL10n(d.meaning, d.id));
    expectL10n(lesson1.grammar.title, 'grammar.title');
    expectL10n(lesson1.grammar.body, 'grammar.body');
    lesson1.grammar.examples.forEach((e) => expectL10n(e.label, `grammar ${e.de}`));
    lesson1.pronunciation.forEach((p) => expectL10n(p.tip, `pron ${p.de}`));
    lesson1.quiz.forEach((q) => {
      expectL10n(q.prompt, q.id);
      q.options.forEach((o, i) => {
        if (o.text) expectL10n(o.text, `${q.id} option ${i}`);
        else expect(typeof o.de).toBe('string');
      });
    });
  });

  it('every referenced audio id exists in lesson.audio', () => {
    const refs = [
      ...lesson1.phrases.map((p) => p.id),
      ...lesson1.dialogue.map((d) => d.id),
      ...lesson1.grammar.examples.map((e) => e.audioId),
      ...lesson1.pronunciation.map((p) => p.audioId),
      ...lesson1.quiz.flatMap((q) => (q.audioId ? [q.audioId] : [])),
    ];
    for (const r of refs) expect(audioIds.has(r)).toBe(true);
  });

  it('every audio clip has a bundled file (and a slow file when slow=true)', () => {
    for (const a of lesson1.audio) {
      expect(audioMap).toHaveProperty(a.id);
      if (a.slow) expect(audioMap).toHaveProperty(`${a.id}_slow`);
    }
  });

  it('quiz correctIndex is in range', () => {
    for (const q of lesson1.quiz) {
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(q.options.length);
    }
  });
});
