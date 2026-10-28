import type { ProgressRow } from '../src/backend/types';
import { mergeProgress } from '../src/backend/types';
import {
  certificateScore,
  continueLesson,
  isUnlocked,
  levelCertified,
  levelPercent,
  profileStats,
} from '../src/logic/progress';
import { isPass, scorePercent } from '../src/logic/quiz';
import type { Curriculum } from '../src/types';

const L = { en: 'x', te: 'x', hi: 'x' };
const cur: Curriculum = {
  A1: [
    { slug: 'a', title: L, topic: L },
    { slug: 'b', title: L, topic: L },
    { slug: 'c', title: L, topic: L },
    { slug: 'd', title: L, topic: L },
  ],
  A2: [{ slug: 'x', title: L, topic: L }],
  B1: [{ slug: 'y', title: L, topic: L }],
};
const row = (lessonSlug: string, lessonCompleted: boolean, quizScore: number | null, updatedAt = '2026-01-01T00:00:00Z'): ProgressRow => ({
  level: 'A1',
  lessonSlug,
  lessonCompleted,
  quizScore,
  updatedAt,
});

describe('levelPercent', () => {
  it('is completed / total', () => {
    expect(levelPercent('A1', [], cur)).toBe(0);
    expect(levelPercent('A1', [row('a', true, null), row('b', false, null)], cur)).toBe(25);
  });
});

describe('isUnlocked', () => {
  it('opens the first lesson of every level', () => {
    expect(isUnlocked('A1', 'a', [], cur)).toBe(true);
    expect(isUnlocked('A2', 'x', [], cur)).toBe(true);
    expect(isUnlocked('B1', 'y', [], cur)).toBe(true);
  });
  it('opens lesson N+1 when lesson N is completed, whatever the quiz score', () => {
    expect(isUnlocked('A1', 'b', [], cur)).toBe(false);
    expect(isUnlocked('A1', 'b', [row('a', false, null)], cur)).toBe(false);
    expect(isUnlocked('A1', 'b', [row('a', true, 50)], cur)).toBe(true);
    expect(isUnlocked('A1', 'c', [row('a', true, 50)], cur)).toBe(false);
  });
  it('rejects unknown slugs', () => {
    expect(isUnlocked('A1', 'nope', [], cur)).toBe(false);
  });
});

describe('continueLesson', () => {
  it('starts at the first lesson', () => {
    expect(continueLesson([], cur)).toEqual({ level: 'A1', slug: 'a' });
  });
  it('prefers the most recently touched unfinished lesson', () => {
    const p = [row('a', true, 100, '2026-01-01T00:00:00Z'), { ...row('y', false, null, '2026-02-01T00:00:00Z'), level: 'B1' as const }];
    expect(continueLesson(p, cur)).toEqual({ level: 'B1', slug: 'y' });
  });
  it('falls back to the first unfinished lesson in order', () => {
    expect(continueLesson([row('a', true, 100)], cur)).toEqual({ level: 'A1', slug: 'b' });
  });
  it('skips lessons that are not available', () => {
    expect(continueLesson([], cur, (_l, s) => s !== 'a')).toEqual({ level: 'A1', slug: 'b' });
  });
});

describe('certificates', () => {
  const all = (score: number) => cur.A1.map((i) => row(i.slug, true, score));
  it('needs every lesson at 80% or more', () => {
    expect(levelCertified('A1', all(80), cur)).toBe(true);
    expect(levelCertified('A1', [...all(90).slice(0, 3), row('d', true, 79)], cur)).toBe(false);
    expect(levelCertified('A1', all(100).slice(0, 3), cur)).toBe(false);
  });
  it('scores the rounded average of best scores', () => {
    expect(certificateScore('A1', [row('a', true, 80), row('b', true, 85), row('c', true, 90), row('d', true, 100)], cur)).toBe(89);
  });
});

describe('profileStats', () => {
  it('counts completed lessons, passed quizzes and the average score', () => {
    expect(profileStats([row('a', true, 100), row('b', true, 67), row('c', false, null)])).toEqual({
      lessonsCompleted: 2,
      quizzesPassed: 1,
      averageScore: 84,
    });
  });
});

describe('quiz scoring', () => {
  it('passes at 80%', () => {
    expect(scorePercent(5, 6)).toBe(83);
    expect(isPass(scorePercent(5, 6))).toBe(true);
    expect(isPass(scorePercent(4, 6))).toBe(false);
  });
});

describe('mergeProgress', () => {
  it('keeps the best score and never un-completes a lesson', () => {
    const old = row('a', true, 90);
    const next = mergeProgress(old, { level: 'A1', lessonSlug: 'a', lessonCompleted: false, quizScore: 50 }, 'now');
    expect(next).toEqual({ level: 'A1', lessonSlug: 'a', lessonCompleted: true, quizScore: 90, updatedAt: 'now' });
  });
  it('keeps a score when opening the lesson again', () => {
    const next = mergeProgress(row('a', false, 67), { level: 'A1', lessonSlug: 'a', lessonCompleted: false, quizScore: null }, 'now');
    expect(next.quizScore).toBe(67);
  });
});

describe('isUnlocked with unwritten lessons', () => {
  it('skips lessons that are not available yet', () => {
    const avail = (_l: string, s: string) => s !== 'a';
    expect(isUnlocked('A1', 'b', [], cur, avail)).toBe(true);
    expect(isUnlocked('A1', 'c', [], cur, avail)).toBe(false);
  });
});
