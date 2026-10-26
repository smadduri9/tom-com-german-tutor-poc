jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import { lesson1 } from '../src/data/lesson';
import { isPass, scoreQuiz } from '../src/logic/quiz';
import { buildSteps, clampStep } from '../src/logic/steps';
import { DEFAULT_STATE, parsePersisted } from '../src/state/storage';

describe('quiz', () => {
  const q = lesson1.quiz;
  it('scores all correct as 5', () => {
    expect(scoreQuiz(q.map((x) => x.correctIndex), q)).toBe(5);
  });
  it('scores unanswered as wrong', () => {
    expect(scoreQuiz([null, null, null, null, null], q)).toBe(0);
  });
  it('passes at 4, fails at 3', () => {
    expect(isPass(4)).toBe(true);
    expect(isPass(3)).toBe(false);
  });
});

describe('steps', () => {
  it('has intro + 15 phrases + dialogue + grammar + pron', () => {
    const s = buildSteps(lesson1);
    expect(s).toHaveLength(19);
    expect(s[0].kind).toBe('intro');
    expect(s[18].kind).toBe('pron');
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
  it('keeps valid data', () => {
    const v = { lang: 'te', session: { email: 'a@b.co' }, progress: { step: 4, quizBest: 3, passed: false } };
    expect(parsePersisted(JSON.stringify(v))).toEqual(v);
  });
});
