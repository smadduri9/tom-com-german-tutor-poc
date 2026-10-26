import raw from './lesson1.json';
import type { Lesson } from '../types';

export const lesson1 = raw as Lesson;

export function hasSlow(audioId: string): boolean {
  return lesson1.audio.some((a) => a.id === audioId && a.slow);
}
