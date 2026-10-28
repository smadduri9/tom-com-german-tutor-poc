import type { QuizQuestion } from '../types';
import { PASS_PERCENT } from './progress';

export function scoreQuiz(answers: (number | null)[], questions: QuizQuestion[]): number {
  return questions.reduce((n, q, i) => n + (answers[i] === q.correctIndex ? 1 : 0), 0);
}

export function scorePercent(correct: number, total: number): number {
  return total > 0 ? Math.round((correct / total) * 100) : 0;
}

export function isPass(percent: number): boolean {
  return percent >= PASS_PERCENT;
}
