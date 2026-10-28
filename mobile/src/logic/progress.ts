import type { ProgressRow } from '../backend/types';
import type { Curriculum, Level } from '../types';
import { LEVELS } from '../types';

export const PASS_PERCENT = 80;

export function findRow(progress: ProgressRow[], level: Level, slug: string): ProgressRow | undefined {
  return progress.find((r) => r.level === level && r.lessonSlug === slug);
}

// Completed lessons / lessons in the level, as a whole percent.
export function levelPercent(level: Level, progress: ProgressRow[], curriculum: Curriculum): number {
  const items = curriculum[level];
  if (!items.length) return 0;
  const done = items.filter((i) => findRow(progress, level, i.slug)?.lessonCompleted).length;
  return Math.round((done / items.length) * 100);
}

export function levelCompletedCount(level: Level, progress: ProgressRow[], curriculum: Curriculum): number {
  return curriculum[level].filter((i) => findRow(progress, level, i.slug)?.lessonCompleted).length;
}

// The first lesson of every level is open; lesson N+1 opens once lesson N is marked complete.
// Lessons that are not written yet are skipped, so they never block the ones after them.
export function isUnlocked(
  level: Level,
  slug: string,
  progress: ProgressRow[],
  curriculum: Curriculum,
  available: (level: Level, slug: string) => boolean = () => true,
): boolean {
  const items = curriculum[level];
  const i = items.findIndex((x) => x.slug === slug);
  if (i < 0) return false;
  for (let j = i - 1; j >= 0; j--) {
    if (available(level, items[j].slug)) return Boolean(findRow(progress, level, items[j].slug)?.lessonCompleted);
  }
  return true;
}

// The lesson touched last that is not finished, else the first unfinished one in A1 → A2 → B1 order.
export function continueLesson(
  progress: ProgressRow[],
  curriculum: Curriculum,
  available: (level: Level, slug: string) => boolean = () => true,
): { level: Level; slug: string } | null {
  const inCurriculum = (r: ProgressRow) => curriculum[r.level]?.some((i) => i.slug === r.lessonSlug);
  const recent = progress
    .filter((r) => !r.lessonCompleted && inCurriculum(r) && available(r.level, r.lessonSlug))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
  if (recent) return { level: recent.level, slug: recent.lessonSlug };
  for (const level of LEVELS) {
    for (const item of curriculum[level]) {
      if (!findRow(progress, level, item.slug)?.lessonCompleted && available(level, item.slug)) {
        return { level, slug: item.slug };
      }
    }
  }
  return null;
}

// Certificate rule: every lesson in the level has a quiz score of at least 80%.
export function levelCertified(level: Level, progress: ProgressRow[], curriculum: Curriculum): boolean {
  const items = curriculum[level];
  return (
    items.length > 0 &&
    items.every((i) => (findRow(progress, level, i.slug)?.quizScore ?? 0) >= PASS_PERCENT)
  );
}

// Rounded average of the best quiz scores of all lessons in the level.
export function certificateScore(level: Level, progress: ProgressRow[], curriculum: Curriculum): number {
  const items = curriculum[level];
  if (!items.length) return 0;
  const sum = items.reduce((n, i) => n + (findRow(progress, level, i.slug)?.quizScore ?? 0), 0);
  return Math.round(sum / items.length);
}

export function profileStats(progress: ProgressRow[]) {
  const scored = progress.filter((r) => typeof r.quizScore === 'number');
  return {
    lessonsCompleted: progress.filter((r) => r.lessonCompleted).length,
    quizzesPassed: scored.filter((r) => (r.quizScore as number) >= PASS_PERCENT).length,
    averageScore: scored.length
      ? Math.round(scored.reduce((n, r) => n + (r.quizScore as number), 0) / scored.length)
      : 0,
  };
}
