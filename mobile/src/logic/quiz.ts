import type { QuizQuestion } from '../types';

export const PASS_SCORE = 4;

export function scoreQuiz(answers: (number | null)[], questions: QuizQuestion[]): number {
  return questions.reduce((n, q, i) => n + (answers[i] === q.correctIndex ? 1 : 0), 0);
}

export function isPass(score: number): boolean {
  return score >= PASS_SCORE;
}
