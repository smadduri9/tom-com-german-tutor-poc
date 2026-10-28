jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import { lessons } from '../src/data/lessons';
import { isPass, scoreQuiz } from '../src/logic/quiz';
import { buildSteps, clampStep } from '../src/logic/steps';
import { DEFAULT_STATE, parsePersisted } from '../src/state/storage';

describe('quiz', () => {
  const q = lessons.A1.greetings.quiz;
  it('scores all correct as 5', () => {
    expect(scoreQuiz(q.map((x) => x.correctIndex), q)).toBe(6);
  });
  it('scores unanswered as wrong', () => {
    expect(scoreQuiz(q.map(() => null), q)).toBe(0);
  });
  it('passes at 5 of 6 (80%), fails at 4', () => {
    expect(isPass(5)).toBe(true);
    expect(isPass(4)).toBe(false);
  });
});

describe('steps', () => {
  it('has intro + 15 vocab + dialogue + grammar + practice', () => {
    const s = buildSteps(lessons.A1.greetings);
    expect(s).toHaveLength(19);
    expect(s[0].kind).toBe('intro');
    expect(s[18].kind).toBe('practice');
  });
  it('clamps', () => {
    expect(clampStep(-3, 19)).toBe(0);
    expect(clampStep(99, 19)).toBe(18);
    expect(clampStep(NaN, 19)).toBe(0);
  });
});

describe('parsePersisted', () => {
  it('returns defaults for null and junk', () => {
    expect(parsePersisted(null)).toEqual(DEFAULT_STATE);
    expect(parsePersisted('not json')).toEqual(DEFAULT_STATE);
    expect(parsePersisted('{"lang":"fr","progress":{"step":-1,"quizBest":9}}')).toEqual(DEFAULT_STATE);
  });
  it('keeps valid data, per email', () => {
    const v = {
      lang: 'te',
      session: { email: 'a@b.co' },
      progressByEmail: { 'a@b.co': { step: 4, quizBest: 3, passed: false }, 'c@d.co': { step: 0, quizBest: 5, passed: true } },
    };
    expect(parsePersisted(JSON.stringify(v))).toEqual(v);
  });
  it('moves old shared progress to the signed-in email', () => {
    const old = { lang: 'en', session: { email: 'A@B.co' }, progress: { step: 7, quizBest: 2, passed: false } };
    expect(parsePersisted(JSON.stringify(old)).progressByEmail).toEqual({ 'a@b.co': { step: 7, quizBest: 2, passed: false } });
  });
  it('drops old shared progress when nobody is signed in', () => {
    const old = { lang: 'en', session: null, progress: { step: 7, quizBest: 2, passed: false } };
    expect(parsePersisted(JSON.stringify(old)).progressByEmail).toEqual({});
  });
});
