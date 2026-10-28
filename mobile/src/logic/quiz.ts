import type { QuizQuestion } from '../types';

// Every quiz has 6 questions. 80% is the pass mark, which is 5 of 6.
export const QUIZ_LENGTH = 6;
export const PASS_SCORE = 5;

export function scoreQuiz(answers: (number | null)[], questions: QuizQuestion[]): number {
  return questions.reduce((n, q, i) => n + (answers[i] === q.correctIndex ? 1 : 0), 0);
}

export function isPass(score: number): boolean {
  return score >= PASS_SCORE;
}
