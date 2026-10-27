import { lessons } from '../src/data/lessons';
import { curriculumData } from '../src/data/lessons';
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

describe('curriculum', () => {
  it('has 48 lessons with trilingual titles and topics', () => {
    const all = [...curriculumData.A1, ...curriculumData.A2, ...curriculumData.B1];
    expect(all).toHaveLength(48);
    for (const item of all) {
      expectL10n(item.title, `${item.slug} title`);
      expectL10n(item.topic, `${item.slug} topic`);
    }
  });
});

describe('greetings lesson content', () => {
  const lesson = lessons.A1.greetings;
  const audioIds = new Set(lesson.audio.map((a) => a.id));

  it('has the expected shape and counts', () => {
    expect(lesson.vocabulary).toHaveLength(15);
    expect(lesson.dialogue.lines).toHaveLength(6);
    expect(lesson.quiz).toHaveLength(6);
    expect(lesson.quiz.slice(0, 4).every((q) => q.kind === 'mcq')).toBe(true);
    expect(lesson.quiz.slice(4).every((q) => q.kind === 'listening')).toBe(true);
  });

  it('every text is trilingual', () => {
    expectL10n(lesson.title, 'title');
    expectL10n(lesson.intro, 'intro');
    expectL10n(lesson.deep_dive, 'deep_dive');
    expectL10n(lesson.practice_tip, 'practice_tip');
    expectL10n(lesson.grammar_note.title, 'grammar_note.title');
    expectL10n(lesson.grammar_note.body, 'grammar_note.body');
    lesson.vocabulary.forEach((v) => expectL10n(v.meaning, v.id));
    lesson.examples.forEach((e) => expectL10n(e.meaning, e.id));
    lesson.dialogue.lines.forEach((d) => expectL10n(d.meaning, d.id));
    lesson.quiz.forEach((q) => {
      expectL10n(q.prompt, q.id);
      expectL10n(q.explanation, `${q.id} explanation`);
      q.options.forEach((o, i) => {
        if (o.text) expectL10n(o.text, `${q.id} option ${i}`);
        else expect(typeof o.de).toBe('string');
      });
    });
  });

  it('every referenced audio id exists in lesson.audio', () => {
    const refs = [
      ...lesson.vocabulary.map((v) => v.id),
      ...lesson.dialogue.lines.map((d) => d.id),
      ...lesson.quiz.flatMap((q) => (q.audioId ? [q.audioId] : [])),
    ];
    for (const r of refs) expect(audioIds.has(r)).toBe(true);
  });

  it('every audio clip has a bundled file (and a slow file when slow=true)', () => {
    for (const a of lesson.audio) {
      expect(audioMap).toHaveProperty(a.id);
      if (a.slow) expect(audioMap).toHaveProperty(`${a.id}_slow`);
    }
  });

  it('quiz correctIndex is in range', () => {
    for (const q of lesson.quiz) {
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(q.options.length);
    }
  });
});
