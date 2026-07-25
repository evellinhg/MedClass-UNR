export interface ScoringInput {
  correct: number
  wrong: number
  totalQuestions: number
  durationSeconds: number
}

/**
 * Points formula:
 * +10 per correct answer, -3 per wrong answer, +1 per question attempted
 * (rewards volume), plus a speed bonus up to 20pts for answering faster
 * than 90s/question on average. Never goes below 0.
 */
export function calculatePoints({ correct, wrong, totalQuestions, durationSeconds }: ScoringInput) {
  const avgSecondsPerQuestion = totalQuestions > 0 ? durationSeconds / totalQuestions : 0
  const speedBonus = Math.max(0, Math.min(20, Math.round((90 - avgSecondsPerQuestion) / 5)))
  const points = correct * 10 - wrong * 3 + totalQuestions * 1 + speedBonus
  return Math.max(0, Math.round(points))
}
