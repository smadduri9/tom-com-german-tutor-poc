import { lessons } from '../data/lessons';

// True when the clip has a slow (🐢) recording. Looks across every lesson.
export function hasSlow(audioId: string): boolean {
  return Object.values(lessons).some((level) =>
    Object.values(level).some((lesson) => lesson.audio.some((a) => a.id === audioId && a.slow)),
  );
}
