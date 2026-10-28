import type { Lesson } from '../types';

export type Step =
  | { kind: 'intro' }
  | { kind: 'vocab'; index: number }
  | { kind: 'dialogue' }
  | { kind: 'grammar' }
  | { kind: 'practice' };

export function buildSteps(lesson: Lesson): Step[] {
  return [
    { kind: 'intro' },
    ...lesson.vocabulary.map((_, index) => ({ kind: 'vocab' as const, index })),
    { kind: 'dialogue' },
    { kind: 'grammar' },
    { kind: 'practice' },
  ];
}

export function clampStep(step: number, total: number): number {
  if (!Number.isFinite(step)) return 0;
  return Math.min(Math.max(0, Math.floor(step)), total - 1);
}
